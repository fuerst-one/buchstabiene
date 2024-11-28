import { DateFormat, gameDateDate, gameDateString } from "@/lib/DateFormat";
import { GameSource, getWordsHash, readWordsFile } from "./_data/files";
import { db } from "@/server/db/db";
import { GameInsert, games } from "@/server/db/schema";
import { generateGames } from "./_data/generateGames";

export const seedGames = async (
  newGames: GameSource[],
  dropTable: boolean,
  dryRun: boolean,
) => {
  if (dryRun) {
    console.log("DRY RUN");
  } else {
    if (dropTable) {
      console.log("Dropping games table...");
      await db.delete(games);
      console.log("Games table dropped!");
    }
  }

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

  // Seed games
  const gameValues: GameInsert[] = [];
  let index = 0;
  for (const game of newGames) {
    if (assignedLetterSets.includes(game.letterSet)) {
      continue;
    }
    gameValues.push({
      date: startDate.add(index, "day").format(DateFormat.date),
      updatedAt: new Date(),
      letterSet: game.letterSet,
      possibleWords: game.possibleWords,
    });
    index++;
  }

  if (dryRun) {
    console.log("DRY RUN: ", { gameValues });
  } else {
    await db.insert(games).values(gameValues);
    console.log("Games seeded!");
  }
};

const main = async () => {
  const DRY_RUN = false;
  console.log({ DRY_RUN, currentDate: gameDateString() });

  const words = await readWordsFile();
  const wordsHash = await getWordsHash(words);
  const games = await generateGames(words, wordsHash);

  const DROP_GAMES = false;
  await seedGames(games, DROP_GAMES, DRY_RUN);
};

if (require.main === module) {
  main();
}
