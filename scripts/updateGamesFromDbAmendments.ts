import { gameDateString } from "@/lib/DateFormat";
import { DEFAULT_GAME_GEN_OPTIONS, getWordsHash } from "./utils/utils";
import { readWordsFile } from "./utils/files";
import { filterGames } from "./utils/filterGames";
import { amendWordFiles } from "./utils/amendWordFiles";
import { removeGames } from "./utils/removeGames";
import { insertGames } from "./utils/insertGames";
import { generateGames } from "./utils/generateGames";
import { arrayShuffle } from "@/lib/arrayShuffle";
import { markAmendmentsApplied, getAmendments } from "./utils/getAmendments";
import { amendExistingGames } from "./utils/amendExistingGames";
import { AmendmentAffectedGames } from "./utils/types";

/**
 * Collects dictionary amendments from DB and updates games.
 *
 * @attention This is a heavy operation.
 * @warning This deletes all games after today and cannot be undone. Create a backup before running.
 */
export const updateGamesFromDbAmendments = async (
  options = DEFAULT_GAME_GEN_OPTIONS,
  dryRun = true,
) => {
  console.log("Updating games...");
  console.log({ dryRun, currentDate: gameDateString() });

  // Get current words
  const words = await readWordsFile();

  // Get dictionary amendments
  const amendments = await getAmendments();

  let newWords = words;
  const affectedGames: AmendmentAffectedGames[] = [];

  for (const amendment of amendments) {
    const { wordsToAdd, wordsToRemove } = amendment;

    // Update words with dictionary amendments from database
    newWords = await amendWordFiles(
      newWords,
      wordsToAdd,
      wordsToRemove,
      dryRun,
    );

    // Update games and saved games until including today with amendments
    const { affectedGames: amendmentAffectedGames } = await amendExistingGames(
      wordsToAdd,
      wordsToRemove,
      dryRun,
    );

    // Add affected games to the list
    affectedGames.push({
      amendmentId: amendment.id,
      dates: amendmentAffectedGames.map((game) => game.date),
    });
  }

  // Skip games update if words hash is unchanged
  if ((await getWordsHash(newWords)) === (await getWordsHash(words))) {
    console.log(
      "Words hash unchanged, skipping games update but marking amendments as applied",
    );
    // Mark dictionary amendments as applied
    await markAmendmentsApplied(affectedGames, dryRun);
    return;
  }

  // Generate new games based on updated words
  const games = await generateGames(newWords, options);
  const filteredGames = await filterGames(games);
  const shuffledGames = arrayShuffle(filteredGames);

  // Remove games after today and insert new games
  await removeGames("after_today", dryRun);
  await insertGames(shuffledGames, dryRun);

  // Mark dictionary amendments as applied
  await markAmendmentsApplied(affectedGames, dryRun);
};

if (require.main === module) {
  const DRY_RUN = true;
  updateGamesFromDbAmendments(DEFAULT_GAME_GEN_OPTIONS, DRY_RUN);
}
