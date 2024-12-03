"use server";
import { serverAdminGuard } from "@/zustand/useServerAuth";
import { db } from "@/server/db/db";
import { inArray } from "drizzle-orm";
import { dictionaryAmendments, wordVotes } from "../db/schema";

export type AmendmentReason = "manual_action" | "automatic_action";

/**
 * Deletes words from games and saved games and creates a dictionary amendment.
 * @param words - The words to delete.
 * @param reason - The reason for the deletion.
 * @returns An object containing the affected games and saved games, and the dictionary amendment.
 */
export const adminDeleteWordFromGames = async (
  words: string[],
  reason: AmendmentReason = "manual_action",
) => {
  await serverAdminGuard();

  // Create the dictionary amendment with the deleted words.
  const dictionaryAmendments_ = await db
    .insert(dictionaryAmendments)
    .values({
      words,
      action: "remove",
      reason,
    })
    .returning();
  const dictionaryAmendment = dictionaryAmendments_[0];

  // Delete the word votes for the deleted words.
  await db.delete(wordVotes).where(inArray(wordVotes.word, words));

  return dictionaryAmendment;
};

/**
 * Adds words to games and saved games and creates a dictionary amendment.
 * @param words - The words to add.
 * @param reason - The reason for the addition.
 * @returns An object containing the affected games and saved games, and the dictionary amendment.
 */
export const adminAddWordToGames = async (
  words: string[],
  reason: AmendmentReason = "manual_action",
) => {
  await serverAdminGuard();

  // Create the dictionary amendment with the added words.
  const dictionaryAmendments_ = await db
    .insert(dictionaryAmendments)
    .values({
      words,
      action: "add",
      reason,
    })
    .returning();
  const dictionaryAmendment = dictionaryAmendments_[0];

  // Delete the word votes for the deleted words.
  await db.delete(wordVotes).where(inArray(wordVotes.word, words));

  return dictionaryAmendment;
};
