import { gameDateDate, gameDateString } from "@/lib/DateFormat";
import { GameInsert, games } from "@/server/db/schema";
import { db } from "@/server/db/db";
import { GameSource } from "./types";

/**
 * Insert new games into DB, skipping already assigned letter sets and dates.
 *
 * @param {GameSource[]} newGames - New games to insert
 * @param {boolean} dryRun - Whether to run in dry run mode
 */
export const insertGames = async (newGames: GameSource[], dryRun = true) => {
  console.log("Seeding games...");

  // Get last assigned date in database
  const assignedGames = await db.query.games.findMany();
  const lastAssignedDate = gameDateDate(
    Math.max(
      ...assignedGames.map((game) => gameDateDate(game.date).valueOf()),
    ) || undefined,
  );
  const startDate = lastAssignedDate.add(1, "day");
  const assignedLetterSets = assignedGames.map((game) => game.letterSet);

  // Convert new games to DB format
  const gameValues: GameInsert[] = newGames
    .filter((game) => !assignedLetterSets.includes(game.letterSet))
    .map((game, idx) => ({
      date: gameDateString(startDate.add(idx, "day")),
      updatedAt: new Date(),
      letterSet: game.letterSet,
      possibleWords: game.possibleWords,
    }));

  if (dryRun) {
    console.log(`DRY RUN: Would insert ${gameValues.length} games into DB.`);
  } else {
    await db.insert(games).values(gameValues);
    console.log(`${gameValues.length} games inserted into DB.`);
  }
};
