"use server";
import { serverAdminGuard } from "@/zustand/useServerAuth";
import { db } from "@/server/db/db";
import { inArray } from "drizzle-orm";
import { dictionaryAmendments, wordVotes } from "../db/schema";
import { revalidatePath } from "next/cache";

export type AmendmentReason = "manual_action" | "automatic_action";

/**
 * Creates a dictionary amendment.
 * @param wordsToAdd - The words to add.
 * @param wordsToRemove - The words to remove.
 * @param reason - The reason for the amendment.
 * @returns The dictionary amendment.
 */
export const adminCreateDictionaryAmendment = async (
  wordsToAdd: string[],
  wordsToRemove: string[],
  reason: AmendmentReason = "manual_action",
) => {
  await serverAdminGuard();

  // Create the dictionary amendment with the deleted words.
  const dictionaryAmendments_ = await db
    .insert(dictionaryAmendments)
    .values({
      wordsToAdd,
      wordsToRemove,
      reason,
    })
    .returning();
  const dictionaryAmendment = dictionaryAmendments_[0];

  // Delete the word votes for the deleted words.
  await db
    .delete(wordVotes)
    .where(inArray(wordVotes.word, [...wordsToRemove, ...wordsToAdd]));

  revalidatePath("/admin", "page");

  return dictionaryAmendment;
};
