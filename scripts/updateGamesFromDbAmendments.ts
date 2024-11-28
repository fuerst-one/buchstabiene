import { gameDateString } from "@/lib/DateFormat";
import { DEFAULT_GAME_GEN_OPTIONS, getWordsHash } from "./utils/utils";
import { readWordsFile } from "./utils/files";
import { filterGames } from "./utils/filterGames";
import { amendWordFiles } from "./utils/amendWordFiles";
import { removeGames } from "./utils/removeGames";
import { insertGames } from "./utils/insertGames";
import { generateGames } from "./utils/generateGames";
import { shuffle } from "@/lib/shuffle";
import { markAmendmentsApplied, getAmendments } from "./utils/getAmendments";
import { amendGames } from "./utils/amendGames";

/**
 * Collects dictionary amendments from DB and updates games.
 *
 * @attention This is a heavy operation.
 * @warning This deletes all games after today and cannot be undone. Create a backup before running.
 */
export const updateGamesFromDbAmendments = async (
  options = DEFAULT_GAME_GEN_OPTIONS,
  dryRun = false,
) => {
  console.log("Updating games...");
  console.log({ dryRun, currentDate: gameDateString() });

  // Get current words
  const words = await readWordsFile();

  // Get dictionary amendments
  const { wordsToAdd, wordsToRemove, amendmentIds } = await getAmendments();

  // Update words with dictionary amendments from database
  const newWords = await amendWordFiles(
    words,
    wordsToAdd,
    wordsToRemove,
    dryRun,
  );

  // Skip games update if words hash is unchanged
  if ((await getWordsHash(newWords)) === (await getWordsHash(words))) {
    console.log("Words hash unchanged, skipping games update");
    return;
  }

  // Update games and saved games until including today with amendments
  const { affectedGames } = await amendGames(wordsToAdd, wordsToRemove, dryRun);

  // Generate new games based on updated words
  const games = await generateGames(newWords, options);
  const filteredGames = await filterGames(games);
  const shuffledGames = shuffle(filteredGames);

  // Remove games after today and insert new games
  await removeGames("after_today", dryRun);
  await insertGames(shuffledGames, dryRun);

  // Mark dictionary amendments as applied
  await markAmendmentsApplied(amendmentIds, affectedGames, dryRun);
};

if (require.main === module) {
  const DRY_RUN = false;
  updateGamesFromDbAmendments(DEFAULT_GAME_GEN_OPTIONS, DRY_RUN);
}
