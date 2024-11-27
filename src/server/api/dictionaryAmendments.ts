"use server";
import { serverAdminGuard } from "@/zustand/useServerAuth";
import { db } from "@/server/db/db";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  games,
  savedGames,
  dictionaryAmendments,
  dictionaryAmendmentAffectedGames,
  wordVotes,
} from "../db/schema";

export type DeletionReason = "manual_action" | "downvote_threshold";

/**
 * Deletes words from games and saved games and creates a dictionary amendment.
 * @param words - The words to delete.
 * @param reason - The reason for the deletion.
 * @returns An object containing the affected games and saved games, and the dictionary amendment.
 */
export const adminDeleteWordFromGames = async (
  words: string[],
  reason: DeletionReason = "manual_action",
) => {
  await serverAdminGuard();

  // Since games and saved games could be large, we need to do this in chunks.
  const CHUNK_SIZE = 100;

  // Find all games that contain the words to delete.
  let offset = 0;
  const affectedGames = [];
  while (true) {
    const games_ = await db.query.games.findMany({
      offset,
      limit: CHUNK_SIZE,
      with: { gameDates: true },
    });
    if (games_.length === 0) {
      break;
    }

    // Check if the game contains any of the words to delete.
    const affectedBatch = [];
    for (const game of games_) {
      const oldPossibleWords = game.possibleWords.split(",");
      const newPossibleWords = oldPossibleWords.filter(
        (w) => !words.includes(w),
      );
      if (newPossibleWords.length === oldPossibleWords.length) {
        continue;
      }
      affectedBatch.push({
        index: game.index,
        dates: game.gameDates.map((d) => d.date),
        oldPossibleWords,
        newPossibleWords,
      });
    }
    // Update the games with the new possible words.
    await Promise.all(
      affectedBatch.map(({ index, newPossibleWords }) =>
        db
          .update(games)
          .set({
            possibleWords: newPossibleWords.join(","),
            updatedAt: new Date(),
          })
          .where(eq(games.index, index)),
      ),
    );
    offset += games_.length;
    affectedGames.push(...affectedBatch);
  }

  // If no games were affected, return.
  if (affectedGames.length === 0) {
    return 0;
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
      const newFoundWords = oldFoundWords.filter((w) => !words.includes(w));
      if (newFoundWords.length === oldFoundWords.length) {
        continue;
      }
      affectedBatch.push({
        gameId: savedGame.gameId,
        userId: savedGame.userId,
        oldFoundWords,
        newFoundWords,
      });
    }

    // Update the saved games with the new found words.
    await Promise.all(
      affectedBatch.map(({ newFoundWords, gameId, userId }) =>
        db
          .update(savedGames)
          .set({ foundWords: newFoundWords, updatedAt: new Date() })
          .where(
            and(eq(savedGames.gameId, gameId), eq(savedGames.userId, userId)),
          ),
      ),
    );
    offset += savedGames_.length;
    affectedSavedGames.push(...affectedBatch);
  }

  // Create the dictionary amendment with the deleted words.
  const dictionaryAmendments_ = await db
    .insert(dictionaryAmendments)
    .values({
      words,
      action: "delete",
      reason,
    })
    .returning();
  const dictionaryAmendment = dictionaryAmendments_[0];

  // Create the dictionary amendment affected games to link the amendment to the games.
  const dictionaryAmendmentAffectedGames_ = await db
    .insert(dictionaryAmendmentAffectedGames)
    .values(
      affectedGames.map(({ index }) => ({
        gameIndex: index,
        amendmentId: dictionaryAmendment.id,
      })),
    )
    .returning();

  // Delete the word votes for the deleted words.
  await db.delete(wordVotes).where(inArray(wordVotes.word, words));

  // Revalidate the admin and game pages.
  revalidatePath("/admin", "page");
  revalidatePath("/spielen/[date]", "page");

  return {
    affectedGames,
    affectedSavedGames,
    dictionaryAmendment,
    dictionaryAmendmentAffectedGames: dictionaryAmendmentAffectedGames_,
  };
};
