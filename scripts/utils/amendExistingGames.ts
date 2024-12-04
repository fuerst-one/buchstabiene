import { db } from "@/server/db/db";
import { and, eq } from "drizzle-orm";
import { games, savedGames } from "@/server/db/schema";
import { gameDateDate, gameDateString } from "@/lib/DateFormat";
import { applyWordsChanges, isWordsChanged } from "./utils";
import { isPossibleWord } from "@/components/Game/utils";

/**
 * Deletes words from games and saved games and creates a dictionary amendment.
 * @param wordsToAdd - The words to add.
 * @param wordsToRemove - The words to remove.
 * @param dryRun - Whether to run the update in dry run mode.
 * @returns An object containing the affected games and saved games.
 */
export const amendExistingGames = async (
  wordsToAdd: string[],
  wordsToRemove: string[],
  dryRun = true,
) => {
  // Since games and saved games could be large, we need to do this in chunks.
  const CHUNK_SIZE = 1000;

  // Find all games that contain the words to delete.
  let offset = 0;
  const affectedGames = [];
  while (true) {
    const gamesBatch = await db.query.games.findMany({
      where: (games, { lte }) =>
        lte(games.date, gameDateString(gameDateDate())),
      orderBy: (games, { asc }) => [asc(games.date)],
      offset,
      limit: CHUNK_SIZE,
    });

    // If no games were found, break the loop.
    if (gamesBatch.length === 0) {
      break;
    }

    // Check if the game contains any of the words to delete.
    const affectedBatch = [];
    for (const game of gamesBatch) {
      const letterSet = game.letterSet;
      const oldWords = game.possibleWords;
      const possibleNewWords = wordsToAdd.filter((word) =>
        isPossibleWord(word, letterSet.split("")),
      );
      const newWords = applyWordsChanges(
        oldWords,
        possibleNewWords,
        wordsToRemove,
      );
      if (!isWordsChanged(oldWords, newWords)) {
        continue;
      }
      const addedWords = [
        ...new Set(newWords).difference(new Set(oldWords)).values(),
      ];
      const removedWords = [
        ...new Set(oldWords).difference(new Set(newWords)).values(),
      ];
      affectedBatch.push({
        date: game.date,
        newWords,
        addedWords,
        removedWords,
      });
    }

    // Update the games with the new possible words.
    if (!dryRun) {
      await Promise.all(
        affectedBatch.map(({ date, newWords }) =>
          db
            .update(games)
            .set({
              updatedAt: new Date(),
              possibleWords: newWords,
            })
            .where(eq(games.date, date)),
        ),
      );
    }

    offset += gamesBatch.length;
    affectedGames.push(...affectedBatch);
  }

  if (dryRun) {
    console.log(`DRY RUN: Did not update ${affectedGames.length} games.`);
  } else {
    console.log(`${affectedGames.length} games updated.`);
  }

  // If no games were affected, return.
  if (affectedGames.length === 0) {
    return { affectedGames: [], affectedSavedGames: [] };
  }

  // Find all saved games that contain the words to delete.
  offset = 0;
  const affectedSavedGames = [];
  while (true) {
    const savedGamesBatch = await db.query.savedGames.findMany({
      orderBy: (savedGames, { asc }) => [
        asc(savedGames.date),
        asc(savedGames.userId),
      ],
      offset,
      limit: CHUNK_SIZE,
    });

    // If no saved games were found, break the loop.
    if (savedGamesBatch.length === 0) {
      break;
    }

    // Check if the saved game contains any of the words to delete.
    const affectedBatch = [];
    for (const savedGame of savedGamesBatch) {
      const oldWords = savedGame.foundWords;
      // Important: We do not add words here, only remove them.
      const newWords = applyWordsChanges(oldWords, [], wordsToRemove);
      if (!isWordsChanged(oldWords, newWords)) {
        continue;
      }
      const removedWords = [
        ...new Set(oldWords).difference(new Set(newWords)).values(),
      ];
      affectedBatch.push({
        date: savedGame.date,
        userId: savedGame.userId,
        newWords,
        removedWords,
      });
    }

    // Update the saved games with the new found words.
    if (!dryRun) {
      await Promise.all(
        affectedBatch.map(({ newWords, date, userId }) =>
          db
            .update(savedGames)
            .set({
              updatedAt: new Date(),
              foundWords: newWords,
            })
            .where(
              and(eq(savedGames.date, date), eq(savedGames.userId, userId)),
            ),
        ),
      );
    }

    offset += savedGamesBatch.length;
    affectedSavedGames.push(...affectedBatch);
  }

  if (dryRun) {
    console.log(
      `DRY RUN: Did not update ${affectedSavedGames.length} saved games.`,
    );
  } else {
    console.log(`${affectedSavedGames.length} saved games updated.`);
  }

  return {
    affectedGames,
    affectedSavedGames,
  };
};
export type AffectedGames = Awaited<ReturnType<typeof amendExistingGames>>;
