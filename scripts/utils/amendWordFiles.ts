import {
  readRemovedWordsFile,
  readWordsFile,
  writeRemovedWordsFile,
  writeWordFileCache,
  writeWordsFile,
} from "./files";
import { applyWordsChanges } from "./utils";

/**
 * Amend word files in file system
 *
 * @param {string[]} currentWords - Current words
 * @param {string[]} wordsToAdd - Words to add
 * @param {string[]} wordsToRemove - Words to remove
 * @param {boolean} dryRun - Whether to run in dry run mode
 * @returns {string[]} New words
 */
export const amendWordFiles = async (
  currentWords: string[],
  wordsToAdd: string[],
  wordsToRemove: string[],
  dryRun = true,
) => {
  console.log("Amending word files...");

  const removedWords = await readRemovedWordsFile();

  // Add wordsToRemove to removedWords
  const newRemovedWords = applyWordsChanges(removedWords, wordsToRemove);

  // Add wordsToAdd to words and remove wordsToRemove from words
  const newWords = applyWordsChanges(currentWords, wordsToAdd, wordsToRemove);

  console.log("Changes:");
  console.log(`${currentWords.length} words before changes.`);
  console.log(`${wordsToAdd.length} words to be added.`);
  console.log(`${wordsToRemove.length} words to be removed.`);
  console.log(`${newWords.length} unique words after changes.`);

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
  const DRY_RUN = true;
  const newWords = await amendWordFiles(
    words,
    wordsToAdd,
    wordsToRemove,
    DRY_RUN,
  );
  console.log(newWords);
};

if (require.main === module) {
  main();
}
