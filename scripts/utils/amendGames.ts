import { db } from "@/server/db/db";
import { and, eq } from "drizzle-orm";
import { games, savedGames } from "@/server/db/schema";
import { difference, unique } from "@/lib/unique";
import { gameDateDate, gameDateString } from "@/lib/DateFormat";

/**
 * Deletes words from games and saved games and creates a dictionary amendment.
 * @param words - The words to delete.
 * @param reason - The reason for the deletion.
 * @returns An object containing the affected games and saved games, and the dictionary amendment.
 */
export const amendGames = async (
  wordsToAdd: string[],
  wordsToRemove: string[],
  dryRun = true,
) => {
  // Since games and saved games could be large, we need to do this in chunks.
  const CHUNK_SIZE = 100;

  // Find all games that contain the words to delete.
  let offset = 0;
  const affectedGames = [];
  while (true) {
    const games_ = await db.query.games.findMany({
      where: (games, { lte }) =>
        lte(games.date, gameDateString(gameDateDate().add(1, "day"))),
      offset,
      limit: CHUNK_SIZE,
    });
    if (games_.length === 0) {
      break;
    }

    // Check if the game contains any of the words to delete.
    const affectedBatch = [];
    for (const game of games_) {
      const oldPossibleWords = game.possibleWords;
      const newPossibleWords = unique([
        ...oldPossibleWords,
        ...wordsToAdd,
      ]).filter((w) => !wordsToRemove.includes(w));
      if (
        difference(new Set(oldPossibleWords), new Set(newPossibleWords))
          .size === 0
      ) {
        continue;
      }
      affectedBatch.push({
        date: game.date,
        oldPossibleWords,
        newPossibleWords,
      });
    }

    // Update the games with the new possible words.
    if (dryRun) {
      console.log(`DRY RUN: Not updating ${affectedBatch.length} games.`);
    } else {
      await Promise.all(
        affectedBatch.map(({ date, newPossibleWords }) =>
          db
            .update(games)
            .set({
              updatedAt: new Date(),
              possibleWords: newPossibleWords,
            })
            .where(eq(games.date, date)),
        ),
      );
      console.log(`${affectedBatch.length} games updated.`);
    }

    offset += games_.length;
    affectedGames.push(...affectedBatch);
  }

  // If no games were affected, return.
  if (affectedGames.length === 0) {
    return { affectedGames: [] };
  }

  // Find all saved games that contain the words to delete.
  offset = 0;
  const affectedSavedGames = [];
  while (true) {
    const savedGames_ = await db.query.savedGames.findMany({
      offset,
      limit: CHUNK_SIZE,
    });
    if (savedGames_.length === 0) {
      break;
    }

    // Check if the saved game contains any of the words to delete.
    const affectedBatch = [];
    for (const savedGame of savedGames_) {
      const oldFoundWords = savedGame.foundWords;
      const newFoundWords = unique([...oldFoundWords, ...wordsToAdd]).filter(
        (w) => !wordsToRemove.includes(w),
      );
      if (
        difference(new Set(oldFoundWords), new Set(newFoundWords)).size === 0
      ) {
        continue;
      }
      affectedBatch.push({
        date: savedGame.date,
        userId: savedGame.userId,
        oldFoundWords,
        newFoundWords,
      });
    }

    // Update the saved games with the new found words.
    if (dryRun) {
      console.log(`DRY RUN: Not updating ${affectedBatch.length} saved games.`);
    } else {
      await Promise.all(
        affectedBatch.map(({ newFoundWords, date, userId }) =>
          db
            .update(savedGames)
            .set({
              updatedAt: new Date(),
              foundWords: newFoundWords,
            })
            .where(
              and(eq(savedGames.date, date), eq(savedGames.userId, userId)),
            ),
        ),
      );
      console.log(`${affectedBatch.length} saved games updated.`);
    }

    offset += savedGames_.length;
    affectedSavedGames.push(...affectedBatch);
  }

  return {
    affectedGames,
    affectedSavedGames,
  };
};
