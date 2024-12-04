import { db } from "@/server/db/db";
import {
  dictionaryAmendmentAffectedGames,
  dictionaryAmendments,
} from "@/server/db/schema";
import { inArray } from "drizzle-orm";
import { AmendmentAffectedGames } from "./types";

export const getAmendments = async () => {
  // Get dictionary amendments that need to be applied
  const amendments = await db.query.dictionaryAmendments.findMany({
    where: (dictionaryAmendments, { eq, and }) =>
      and(eq(dictionaryAmendments.isApplied, false)),
  });

  const wordsToAdd = amendments.flatMap((amendment) => amendment.wordsToAdd);
  const wordsToRemove = amendments.flatMap(
    (amendment) => amendment.wordsToRemove,
  );

  console.log(
    `Found ${amendments.length} amendments with ${wordsToAdd.length} words to add and ${wordsToRemove.length} words to remove.`,
  );

  return amendments;
};

export const markAmendmentsApplied = async (
  affectedGames: AmendmentAffectedGames[],
  dryRun = true,
) => {
  if (affectedGames.length === 0) {
    console.log("No amendments to mark as applied.");
    return;
  }

  const amendmentIds = affectedGames.map(({ amendmentId }) => amendmentId);

  if (dryRun) {
    console.log("DRY RUN: Not updating dictionary amendments.");
  } else {
    // Update dictionary amendments to mark them as applied
    await db
      .update(dictionaryAmendments)
      .set({ isApplied: true })
      .where(inArray(dictionaryAmendments.id, amendmentIds));
    console.log(`${amendmentIds.length} dictionary amendments completed.`);

    // Link the amendments to the games
    const result = await db
      .insert(dictionaryAmendmentAffectedGames)
      .values(
        affectedGames.flatMap(({ dates, amendmentId }) =>
          dates.map((date) => ({
            gameDate: date,
            amendmentId,
          })),
        ),
      )
      .returning();
    console.log(
      `${result.length} affected games linked to dictionary amendments.`,
    );
  }
};
