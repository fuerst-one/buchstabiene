"use server";
import { serverAdminGuard } from "@/zustand/useServerAuth";
import { db } from "@/server/db/db";
import { inArray } from "drizzle-orm";
import { dictionaryAmendments, wordVotes } from "../db/schema";
import { revalidatePath } from "next/cache";
import { publicGetGameByDate } from "./game";
import { isPossibleWord } from "@/components/Game/utils";

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

export type AmendmentEffect = {
  amendmentId: number;
  createdAt: Date;
  appliedAt: Date | null;
  reason: string;
  wordsAdded: string[];
  wordsRemoved: string[];
};
export const publicGetAmendmentsAffectingGame = async (date: string) => {
  const game = await publicGetGameByDate(date);
  if (!game) {
    return [];
  }

  const amendments = await db.query.dictionaryAmendmentAffectedGames.findMany({
    where: (dictionaryAmendmentAffectedGames, { eq }) =>
      eq(dictionaryAmendmentAffectedGames.gameDate, date),
    with: {
      dictionaryAmendment: true,
    },
  });

  const amendmentEffects: AmendmentEffect[] = [];
  for (const amendment of amendments) {
    if (!amendment.dictionaryAmendment.appliedAt) {
      continue;
    }
    const wordsAdded = amendment.dictionaryAmendment.wordsToAdd.filter((word) =>
      game.possibleWords.includes(word),
    );
    const wordsRemoved = amendment.dictionaryAmendment.wordsToRemove.filter(
      (word) => isPossibleWord(word, game.letterSet),
    );
    amendmentEffects.push({
      amendmentId: amendment.dictionaryAmendment.id,
      createdAt: amendment.dictionaryAmendment.createdAt,
      appliedAt: amendment.dictionaryAmendment.appliedAt,
      reason: amendment.dictionaryAmendment.reason,
      wordsAdded,
      wordsRemoved,
    });
  }

  return amendmentEffects;
};
