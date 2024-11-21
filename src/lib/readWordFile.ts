import { promises as fs } from "fs";

export const readWordFile = async (path: string) => {
  const file = await fs.readFile(path, "utf8");
  return file.split("\n");
};
