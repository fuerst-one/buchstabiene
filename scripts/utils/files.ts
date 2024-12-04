import { existsSync, promises as fs } from "fs";
import { join } from "path";
import { GameGenOptions, GameSource } from "./types";
import { DEFAULT_GAME_GEN_OPTIONS, getWordsHash } from "./utils";
import { AffectedGames } from "./amendExistingGames";

const fileEncoding = "utf8";

// Word files
const dataDir = join(process.cwd(), "scripts", "data");

const wordsFile = join(dataDir, "words.txt");
export const readWordsFile = async () => {
  return (await fs.readFile(wordsFile, fileEncoding)).split("\n");
};
export const writeWordsFile = async (words: string[]) => {
  return await fs.writeFile(wordsFile, words.join("\n"), fileEncoding);
};

const removedWordsFile = join(dataDir, "removedWords.txt");
export const readRemovedWordsFile = async () => {
  return (await fs.readFile(removedWordsFile, fileEncoding)).split("\n");
};
export const writeRemovedWordsFile = async (words: string[]) => {
  return await fs.writeFile(removedWordsFile, words.join("\n"), fileEncoding);
};

// Cache files
export const cacheDir = join(dataDir, "cache");
const cacheHashDir = (hash: string) => join(cacheDir, hash);
const cacheLogFile = join(cacheDir, "cache.txt");
export const readCacheLogFile = async () => {
  return (await fs.readFile(cacheLogFile, fileEncoding)).split("\n");
};
const appendCacheLogFile = async (hash: string) => {
  const log = (await fs.readFile(cacheLogFile, fileEncoding)).split("\n");
  if (log.includes(hash)) {
    return;
  }
  return await fs.appendFile(cacheLogFile, `${hash}\n`, fileEncoding);
};
const createCacheDirIfNotExists = async (hash: string) => {
  if (!existsSync(cacheHashDir(hash))) {
    console.log(`Creating cache directory for ${hash}`);
    await appendCacheLogFile(hash);
    await fs.mkdir(cacheHashDir(hash));
  }
};

const cacheWordsFile = (hash: string) => join(cacheHashDir(hash), "words.txt");
export const writeWordFileCache = async (words: string[]) => {
  const hash = await getWordsHash(words);
  await createCacheDirIfNotExists(hash);
  return await fs.writeFile(
    cacheWordsFile(hash),
    words.join("\n"),
    fileEncoding,
  );
};
const cacheRemovedWordsFile = (hash: string) =>
  join(cacheHashDir(hash), "removedWords.txt");
export const writeRemovedWordsFileCache = async (
  words: string[],
  hash: string,
) => {
  await createCacheDirIfNotExists(hash);
  return await fs.writeFile(
    cacheRemovedWordsFile(hash),
    words.join("\n"),
    fileEncoding,
  );
};

const changeLogFile = (hash: string) =>
  join(cacheHashDir(hash), "appliedChanges.json");
export const writeChangeLogFile = async (
  affectedGames: AffectedGames,
  hash: string,
) => {
  return await fs.writeFile(
    changeLogFile(hash),
    JSON.stringify(affectedGames, null, 2),
    fileEncoding,
  );
};

export const gamesFileName = (options: GameGenOptions) => {
  const letters = options.letterSetFilter?.letters?.sort().join("");
  const count = options.letterSetFilter?.maxCount;
  return `${letters}-${count}.txt`;
};
export const cacheGamesFile = (
  hash: string,
  options = DEFAULT_GAME_GEN_OPTIONS,
) => join(cacheHashDir(hash), gamesFileName(options));

export const encodeGame = (game: GameSource) => {
  return `${game.letterSet}\t${game.winningScore}\t${game.totalScore}\t${game.possibleWords.join(",")}`;
};
export const decodeGame = (encoded: string): GameSource => {
  const [letterSet, winningScore, totalScore, possibleWords] =
    encoded.split("\t");
  return {
    letterSet,
    winningScore: parseInt(winningScore),
    totalScore: parseInt(totalScore),
    possibleWords: possibleWords.split(","),
  };
};

export const readGamesFile = async (
  wordsHash: string,
  options = DEFAULT_GAME_GEN_OPTIONS,
) => {
  return (await fs.readFile(cacheGamesFile(wordsHash, options), fileEncoding))
    .split("\n")
    .map(decodeGame);
};
export const writeGamesFile = async (
  games: GameSource[],
  wordsHash: string,
  options = DEFAULT_GAME_GEN_OPTIONS,
) => {
  await createCacheDirIfNotExists(wordsHash);
  return await fs.writeFile(
    cacheGamesFile(wordsHash, options),
    games.map(encodeGame).join("\n"),
    fileEncoding,
  );
};
