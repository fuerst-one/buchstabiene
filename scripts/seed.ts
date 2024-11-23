import { isPossibleWord, getWinningScore } from "@/components/Game/utils";
import { DateFormat } from "@/lib/DateFormat";
import { readWordFile } from "@/lib/readWordFile";
import { shuffle } from "@/lib/shuffle";
import { db } from "@/server/db/db";
import { gameDates, games } from "@/server/db/schema";
import dayjs from "dayjs";
import { join } from "path";

const gameDataDir = join(process.cwd(), "src/app/_data");

const seedGames = async (
  words: string[],
  letterSets: string[],
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

  // Seed games
  const gameValues: {
    index: number;
    letterSet: string;
    possibleWords: string;
    maxScore: number;
  }[] = [];
  for (let i = 0; i < letterSets.length; i++) {
    console.log(`Generating game ${i + 1} of ${letterSets.length}...`);
    const letterSet = letterSets[i];
    const letters = letterSet.split("");
    const possibleWords = words.filter((word) => isPossibleWord(word, letters));
    const maxScore = getWinningScore(possibleWords);
    gameValues.push({
      index: i,
      letterSet,
      possibleWords: possibleWords.join(","),
      maxScore,
    });
  }

  if (dryRun) {
    console.log("DRY RUN: ", { gameValues });
  } else {
    await db.insert(games).values(gameValues);
    console.log("Games seeded!");
  }
};

const seedGameDates = async (
  letterSets: string[],
  dropTable: boolean,
  dryRun: boolean,
) => {
  if (dryRun) {
    console.log("DRY RUN");
  } else {
    if (dropTable) {
      console.log("Dropping game dates table...");
      await db.delete(gameDates);
      console.log("Game dates table dropped!");
    }
  }

  console.log("Seeding game dates...");

  // Get already assigned games
  const assignedGameDates = await db.query.gameDates.findMany();

  // Get last assigned date
  const lastAssignedDate = dayjs(
    Math.max(
      ...assignedGameDates.map((game) =>
        dayjs(game.date, DateFormat.date).valueOf(),
      ),
    ) || undefined,
  );

  const startDate = lastAssignedDate.add(1, "day");
  const assignedGameIndices = assignedGameDates.map((game) => game.gameIndex);

  // Get new randomized game indices
  let indices = shuffle(Array.from({ length: letterSets.length }, (_, i) => i));
  if (assignedGameIndices.length === letterSets.length) {
    console.log("All games already assigned, restarting with all games...");
  } else {
    indices = indices.filter((index) => !assignedGameIndices.includes(index));
  }

  // Generate new game date values
  const gameDatesValues: { date: string; gameIndex: number }[] = [];
  for (let i = 0; i < indices.length; i++) {
    gameDatesValues.push({
      date: startDate.add(i, "day").format(DateFormat.date),
      gameIndex: indices[i],
    });
  }

  const invalidDates = gameDatesValues
    .map((game) => game.date)
    .filter((date) => date.length > 10);

  if (invalidDates.length > 0) {
    throw new Error("Invalid dates: " + invalidDates.join(", "));
  }

  if (dryRun) {
    console.log("DRY RUN: ", {
      assignedGameDates,
      lastAssignedDate,
      gameDatesValues,
    });
  } else {
    await db.insert(gameDates).values(gameDatesValues);
    console.log("Game dates seeded!");
  }
};

const main = async () => {
  const DRY_RUN = false;

  const words = await readWordFile(join(gameDataDir, "words.txt"));
  const letterSets = await readWordFile(join(gameDataDir, "letterSets.txt"));

  const SEED_GAMES = false;
  const DROP_GAMES = false;
  if (SEED_GAMES) {
    await seedGames(words, letterSets, DROP_GAMES, DRY_RUN);
  }

  const SEED_GAME_DATES = true;
  const DROP_GAME_DATES = false;
  if (SEED_GAME_DATES) {
    await seedGameDates(letterSets, DROP_GAME_DATES, DRY_RUN);
  }
};

main();
