import { gameDateString, gameDateDate } from "@/lib/DateFormat";
import { db } from "@/server/db/db";
import { games } from "@/server/db/schema";
import { gt } from "drizzle-orm";

const removeAllGames = async (dryRun = true) => {
  if (dryRun) {
    console.log("DRY RUN: Would drop games table.");
    return;
  }
  await db.delete(games);
  console.log("Games table dropped.");
};

const removeGamesAfterToday = async (dryRun = true) => {
  const startDate = gameDateString(gameDateDate().add(1, "day"));
  if (dryRun) {
    const gamesAfterToday = await db.query.games.findMany({
      where: (games, { gt }) => gt(games.date, startDate),
    });
    console.log(
      `DRY RUN: Would delete ${gamesAfterToday.length} games from DB.`,
    );
    return;
  }
  const deletedGames = await db
    .delete(games)
    .where(gt(games.date, startDate))
    .returning();
  console.log(`Deleted ${deletedGames.length} games from DB.`);
};

/**
 * Remove games from DB
 *
 * @warning This cannot be undone. Create a backup before running.
 * @param {optional} removeMode - "all" or "after_today"
 * @param {optional} dryRun - Whether to run in dry run mode
 */
export const removeGames = async (
  removeMode: "all" | "after_today" = "after_today",
  dryRun: boolean = true,
) => {
  console.log(`Removing games. Mode "${removeMode}"`);
  if (removeMode === "all") {
    await removeAllGames(dryRun);
  } else {
    await removeGamesAfterToday(dryRun);
  }
};
