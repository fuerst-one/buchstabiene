import { gameDateDate, gameDateString } from "@/lib/DateFormat";
import {
  getWordsHash,
  readRemovedWordsFile,
  readWordsFile,
  writeRemovedWordsFile,
  writeWordsFile,
} from "./_data/files";
import { db } from "@/server/db/db";
import { dictionaryAmendments, games } from "@/server/db/schema";
import { gt, inArray } from "drizzle-orm";
import { generateGames } from "./_data/generateGames";
import { seedGames } from "./seedGames";

const updateGames = async (
  words: string[],
  startDateMode: "overwrite_after_today" | "append_after_last_assigned",
  dryRun: boolean,
) => {
  if (startDateMode === "overwrite_after_today") {
    // Remove all game dates after today
    console.log("Removing unplayed games...");
    const startDate = gameDateDate().add(1, "day");
    if (dryRun) {
      console.log("DRY RUN: Removing game dates after today...");
    } else {
      const deletedGames = await db
        .delete(games)
        .where(gt(games.date, gameDateString(startDate)))
        .returning();
      console.log({ deletedGames });
    }
  }

  console.log("Generating games...");
  const wordsHash = await getWordsHash(words);
  const newGames = await generateGames(words, wordsHash);

  console.log("Seeding games...");
  await seedGames(newGames, false, dryRun);
};

const updateFiles = async (words: string[], dryRun = true) => {
  console.log("Updating word files...");

  const dictionaryAmendments_ = await db.query.dictionaryAmendments.findMany({
    where: (dictionaryAmendments, { eq, and }) =>
      and(
        eq(dictionaryAmendments.action, "delete"),
        eq(dictionaryAmendments.isSourceFileUpdated, false),
      ),
  });

  const removedWords = await readRemovedWordsFile();
  const newRemovedWords = [
    ...new Set([
      ...removedWords,
      ...dictionaryAmendments_.map((amendment) => amendment.words).flat(),
    ]),
  ];

  const newWords = words.filter((word) => !newRemovedWords.includes(word));

  console.log({
    old: words.length,
    new: newWords.length,
    delta: words.length - newWords.length,
  });

  if (dryRun) {
    console.log("DRY RUN: Updating removed words file...");
  } else {
    await writeRemovedWordsFile(newRemovedWords);
    await writeWordsFile(newWords);
    console.log("Word files updated!");
  }

  if (dryRun) {
    console.log("DRY RUN: Updating dictionary amendments...");
  } else {
    const ids = dictionaryAmendments_.map((amendment) => amendment.id);
    await db
      .update(dictionaryAmendments)
      .set({ isSourceFileUpdated: true })
      .where(inArray(dictionaryAmendments.id, ids));
    console.log("Dictionary amendments updated!");
  }

  return newWords;
};

const main = async () => {
  const DRY_RUN = false;
  console.log({ DRY_RUN, currentDate: gameDateString() });

  let words = await readWordsFile();
  words = await updateFiles(words, DRY_RUN);

  const START_DATE_MODE = "overwrite_after_today";
  await updateGames(words, START_DATE_MODE, DRY_RUN);
};

if (require.main === module) {
  main();
}
