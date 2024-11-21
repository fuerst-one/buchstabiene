import { isPossibleWord, getMaxScore } from "@/components/Game/utils";
import { readWordFile } from "@/lib/readWordFile";
import { db } from "@/server/db/db";
import { games } from "@/server/db/schema";
import { join } from "path";

const gameDataDir = join(process.cwd(), "src/app/_data");

const main = async () => {
  console.log("Cleaning database...");

  await db.delete(games);

  console.log("Database cleaned!");
  console.log("Seeding database...");

  const words = await readWordFile(join(gameDataDir, "words.txt"));
  const letterSets = await readWordFile(join(gameDataDir, "letterSets.txt"));

  // Seed games
  for (let i = 0; i < letterSets.length; i++) {
    console.log(`Seeding game ${i + 1} of ${letterSets.length}...`);
    const letterSet = letterSets[i];
    const letters = letterSet.split("");
    const possibleWords = words.filter((word) => isPossibleWord(word, letters));
    const maxScore = getMaxScore(possibleWords);
    await db.insert(games).values({
      index: i,
      letterSet,
      possibleWords: possibleWords.join(","),
      maxScore,
    });
  }

  console.log("Database seeded!");
};

main();
