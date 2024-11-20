"use server";

import fs from "fs";
import dayjs from "dayjs";
import {
  isMainWord,
  getLettersFromWord,
  isPossibleWord,
  getWordScore,
} from "./utils";

export const getTodaysGame = async () => {
  const wordsFileContent = fs.readFileSync("./src/app/data/game-words.txt");
  const words = wordsFileContent.toString().split("\n");
  const mainWords = words.filter((word) => isMainWord(word));
  const timestamp = Math.floor(dayjs().startOf("day").valueOf() / 1000);
  const todayIndex = timestamp % mainWords.length;
  const mainWord = mainWords[todayIndex];
  const letters = getLettersFromWord(mainWord).sort(() => Math.random() - 0.5);
  const mainLetter = letters[0];
  const possibleWords = words.filter((word) =>
    isPossibleWord(word, mainLetter, letters)
  );
  const maxScore = possibleWords.reduce(
    (acc, word) => acc + getWordScore(word),
    0
  );
  return { timestamp, letters, possibleWords, maxScore };
};
