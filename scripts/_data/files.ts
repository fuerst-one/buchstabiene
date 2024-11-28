import { existsSync, promises as fs } from "fs";
import crypto from "crypto";
import { join } from "path";

export const getWordsHash = async (words: string[]): Promise<string> => {
  const content = words.join("\n");
  return new Promise((resolve) => {
    const hash = crypto.createHash("sha256");
    hash.update(content);
    resolve(hash.digest("hex"));
  });
};

// Game files
const gameDataDir = join(process.cwd(), "scripts/_data");
export const readGameFile = async (path: string) => {
  return await fs.readFile(join(gameDataDir, path), "utf8");
};
export const writeGameFile = async (path: string, content: string) => {
  return await fs.writeFile(join(gameDataDir, path), content);
};

const wordsFile = `words.txt`;
export const readWordsFile = async () => {
  return (await readGameFile(wordsFile)).split("\n");
};
export const writeWordsFile = async (words: string[]) => {
  return await writeGameFile(wordsFile, words.join("\n"));
};

const removedWordsFile = `removedWords.txt`;
export const readRemovedWordsFile = async () => {
  return (await readGameFile(removedWordsFile)).split("\n");
};
export const writeRemovedWordsFile = async (words: string[]) => {
  return await writeGameFile(removedWordsFile, words.join("\n"));
};

// Source files
const sourceDir = join(gameDataDir, "test");
const readSourceFile = async (path: string) => {
  return await fs.readFile(join(sourceDir, path), "utf8");
};
const writeSourceFile = async (path: string, content: string) => {
  return await fs.writeFile(join(sourceDir, path), content);
};
const createSourceDirIfNotExists = async (wordsHash: string) => {
  if (!existsSync(join(sourceDir, "iterations", wordsHash))) {
    await fs.mkdir(join(sourceDir, "iterations", wordsHash));
  }
};

const uniqueLetterSetsFile = (wordsHash: string) =>
  join("iterations", wordsHash, "letterSetsUnique.txt");
export const readUniqueLetterSetsFile = async (wordsHash: string) => {
  return (await readSourceFile(uniqueLetterSetsFile(wordsHash))).split("\n");
};
export const writeUniqueLetterSetsFile = async (
  wordsHash: string,
  uniqueLetterSets: string[],
) => {
  await createSourceDirIfNotExists(wordsHash);
  return await writeSourceFile(
    uniqueLetterSetsFile(wordsHash),
    uniqueLetterSets.join("\n"),
  );
};

export type GameSource = {
  index: number;
  letterSet: string;
  possibleWords: string[];
  winningScore: number;
};

const gamesFile = (wordsHash: string) =>
  join("iterations", wordsHash, "games.json");
export const readGamesFile = async (wordsHash: string) => {
  return JSON.parse(await readSourceFile(gamesFile(wordsHash))) as GameSource[];
};
export const writeGamesFile = async (
  wordsHash: string,
  games: GameSource[],
) => {
  await createSourceDirIfNotExists(wordsHash);
  return await writeSourceFile(
    gamesFile(wordsHash),
    JSON.stringify(games, null, 2),
  );
};
