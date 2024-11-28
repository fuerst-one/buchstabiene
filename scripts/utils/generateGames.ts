import {
  isPossibleWord,
  getWinningScore,
  getTotalScore,
} from "@/components/Game/utils";
import {
  cacheGamesFile,
  readGamesFile,
  readWordsFile,
  writeGamesFile,
} from "./files";
import { DEFAULT_GAME_GEN_OPTIONS, getWordsHash } from "./utils";
import { generateLetterSets } from "./generateLetterSets";
import cliProgress from "cli-progress";
import { GameSource } from "./types";

export const generateGames = async (
  words: string[],
  options = DEFAULT_GAME_GEN_OPTIONS,
) => {
  const wordsHash = await getWordsHash(words);

  try {
    console.log(`Reading cache for "${cacheGamesFile(wordsHash, options)}"...`);
    const cachedGames = await readGamesFile(wordsHash, options);
    console.log(`Found ${cachedGames.length} games.`);
    return cachedGames;
  } catch (error) {
    console.error((error as Error).message);
    console.log("No cache found with this hash, generating...");
  }

  const letterSets = generateLetterSets(words, options.letterSetFilter);

  const start = performance.now();
  const progress = new cliProgress.SingleBar({
    format: "Generating games... {bar} {percentage}% | {value}/{total}",
  });
  progress.start(letterSets.length, 0);

  const games: GameSource[] = letterSets.map((letterSet) => {
    progress.increment();
    const letters = letterSet.split("");
    const possibleWords = words.filter((word) => isPossibleWord(word, letters));
    const winningScore = getWinningScore(possibleWords);
    const totalScore = getTotalScore(possibleWords);
    return {
      letterSet,
      winningScore,
      totalScore,
      possibleWords,
    };
  });

  progress.stop();
  const duration = ((performance.now() - start) / 1000).toFixed(3);
  console.log(`Generated ${games.length} games in ${duration}s.`);

  // Write games to file to cache them
  await writeGamesFile(games, wordsHash, options);

  return games;
};

const main = async () => {
  const words = await readWordsFile();
  await generateGames(words);
};

if (require.main === module) {
  main();
}
