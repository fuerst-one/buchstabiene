import { db } from "@/server/db/db";
import {
  dictionaryAmendmentAffectedGames,
  dictionaryAmendments,
} from "@/server/db/schema";
import { inArray } from "drizzle-orm";

export const getAmendments = async () => {
  // Get dictionary amendments that need to be applied
  const amendments = await db.query.dictionaryAmendments.findMany({
    where: (dictionaryAmendments, { eq, and }) =>
      and(eq(dictionaryAmendments.isApplied, false)),
  });
  const wordsToAdd = amendments
    .filter((amendment) => amendment.action === "add")
    .flatMap((amendment) => amendment.words);
  const wordsToRemove = amendments
    .filter((amendment) => amendment.action === "remove")
    .flatMap((amendment) => amendment.words);

  const amendmentIds = amendments.map((amendment) => amendment.id);

  console.log(
    `Found ${amendmentIds.length} amendments with ${wordsToAdd.length} words to add and ${wordsToRemove.length} words to remove.`,
  );

  return { wordsToAdd, wordsToRemove, amendmentIds };
};

export const markAmendmentsApplied = async (
  amendmentIds: number[],
  affectedGames: { date: string }[],
  dryRun = true,
) => {
  if (amendmentIds.length === 0) {
    console.log("No amendments to mark as applied.");
    return;
  }

  if (dryRun) {
    console.log("DRY RUN: Not updating dictionary amendments.");
  }

  // Update dictionary amendments to mark them as applied
  await db
    .update(dictionaryAmendments)
    .set({ isApplied: true })
    .where(inArray(dictionaryAmendments.id, amendmentIds));
  console.log(`${amendmentIds.length} dictionary amendments completed`);

  // Create the dictionary amendment affected games to link the amendment to the games.
  const amendmentId = amendmentIds.pop()!;
  await db
    .insert(dictionaryAmendmentAffectedGames)
    .values(
      affectedGames.map(({ date }) => ({
        gameDate: date,
        amendmentId,
      })),
    )
    .returning();
};
