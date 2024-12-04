import crypto from "crypto";
import { GameGenOptions, GameSource } from "./types";
import { readCacheLogFile } from "./files";
import { arrayUnique } from "@/lib/arrayUnique";
import { arrayEqual } from "@/lib/arrayEqual";

export const DEFAULT_GAME_GEN_OPTIONS: GameGenOptions = {
  letterSetFilter: {
    letters: "enisrt".split(""),
    maxCount: 2,
  },
  gameFilter: {
    minWords: 15,
    maxWords: 35,
    minScore: 45,
    maxScore: 150,
  },
};

export const getWordsHash = async (words: string[]): Promise<string> => {
  const content = words.sort().join("\n");
  return new Promise((resolve) => {
    const hash = crypto.createHash("sha256");
    hash.update(content);
    resolve(hash.digest("hex"));
  });
};

export const getLatestWordsHash = async (): Promise<string> => {
  const hashes = await readCacheLogFile();
  return hashes[hashes.length - 1];
};

export const applyWordsChanges = (
  oldWords: string[],
  wordsToAdd?: string[],
  wordsToRemove?: string[],
) => {
  return arrayUnique([...oldWords, ...(wordsToAdd || [])])
    .filter((w) => !wordsToRemove || !wordsToRemove.includes(w))
    .sort();
};

export const isWordsChanged = (oldWords: string[], newWords: string[]) =>
  !arrayEqual(oldWords, newWords);

export const logGameScoreDistribution = (games: GameSource[]) => {
  const scoreTable = Object.fromEntries(
    Object.entries(
      games.reduce(
        (acc, { winningScore }) => {
          const scoreGroup = Math.floor(winningScore / 10) * 10;
          acc[scoreGroup] = (acc[scoreGroup] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>,
      ),
    ).map(([score, count]) => [
      score,
      Array(Math.round(count / 10))
        .fill("*")
        .join(""),
    ]),
  );

  const wordCountTable = Object.fromEntries(
    Object.entries(
      games.reduce(
        (acc, { possibleWords }) => {
          const countGroup = Math.floor(possibleWords.length / 10) * 10;
          acc[countGroup] = (acc[countGroup] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>,
      ),
    ).map(([wordCount, count]) => [
      wordCount,
      Array(Math.round(count / 20))
        .fill("*")
        .join(""),
    ]),
  );

  console.log({
    totalGames: games.length,
    winningScoreMedian: games.sort((a, b) => a.winningScore - b.winningScore)[
      Math.floor(games.length / 2)
    ].winningScore,
    winningScoreMean:
      games.reduce((acc, { winningScore }) => acc + winningScore, 0) /
      games.length,
    scoreTable,
    wordCountTable,
  });
};
