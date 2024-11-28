import {
  readRemovedWordsFile,
  readWordsFile,
  writeRemovedWordsFile,
  writeWordFileCache,
  writeWordsFile,
} from "./files";
import { unique } from "@/lib/unique";

/**
 * Amend word files in file system
 *
 * @param {string[]} words - Current words
 * @param {string[]} wordsToAdd - Words to add
 * @param {string[]} wordsToRemove - Words to remove
 * @param {boolean} dryRun - Whether to run in dry run mode
 * @returns {string[]} New words
 */
export const amendWordFiles = async (
  words: string[],
  wordsToAdd: string[],
  wordsToRemove: string[],
  dryRun = true,
) => {
  console.log("Amending word files...");

  const removedWords = await readRemovedWordsFile();
  const newRemovedWords = unique([...removedWords, ...wordsToRemove]).sort();
  const newWords = unique([...words, ...wordsToAdd])
    .filter((word) => !newRemovedWords.includes(word))
    .sort();

  console.log(`${wordsToAdd.length} words added.`);
  console.log(`${wordsToRemove.length} words removed.`);
  console.log(`${newWords.length} unique words left.`);

  if (dryRun) {
    console.log("DRY RUN: Not amending word files.");
  } else {
    await writeRemovedWordsFile(newRemovedWords);
    await writeWordsFile(newWords);
    await writeWordFileCache(newWords);
    console.log("Word files amended.");
  }

  return newWords;
};

// Manually run this to update word files without DB Amendments
const main = async () => {
  const words = await readWordsFile();
  const wordsToAdd: string[] = [];
  const wordsToRemove: string[] = [];
  await amendWordFiles(words, wordsToAdd, wordsToRemove, false);
};

if (require.main === module) {
  main();
}
