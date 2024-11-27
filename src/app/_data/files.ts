import { promises as fs } from "fs";
import { join } from "path";

export type WordFilePath = "words.txt" | "letterSets.txt";

const gameDataDir = join(process.cwd(), "src/app/_data");

export const readWordFile = async (path: WordFilePath) => {
  const file = await fs.readFile(join(gameDataDir, path), "utf8");
  return file.split("\n");
};

export const writeWordFile = async (path: WordFilePath, words: string[]) => {
  await fs.writeFile(path, words.join("\n"));
};
