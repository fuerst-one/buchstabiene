import { DEFAULT_GAME_GEN_OPTIONS, logGameScoreDistribution } from "./utils";
import { readWordsFile } from "./files";
import { generateGames } from "./generateGames";
import { GameSource } from "./types";

export const filterGames = async (
  games: GameSource[],
  options = DEFAULT_GAME_GEN_OPTIONS.gameFilter,
) => {
  const filteredGames = games.filter(({ possibleWords, winningScore }) => {
    return (
      (!options?.minWords || possibleWords.length >= options.minWords) &&
      (!options?.maxWords || possibleWords.length <= options.maxWords) &&
      (!options?.minScore || winningScore >= options.minScore) &&
      (!options?.maxScore || winningScore <= options.maxScore)
    );
  });
  logGameScoreDistribution(filteredGames);
  return filteredGames;
};

const main = async () => {
  const words = await readWordsFile();
  const games = await generateGames(words);
  await filterGames(games);
};

if (require.main === module) {
  main();
}
