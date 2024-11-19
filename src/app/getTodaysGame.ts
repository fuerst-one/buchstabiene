import fs from "fs";
import dayjs from "dayjs";

const getLettersFromWord = (word: string) => {
  if (!word) {
    return [];
  }
  return [...new Set(word.split("")).values()];
};

const isMainWord = (word: string) => {
  return getLettersFromWord(word).length === 7;
};

const isPossibleWord = (
  word: string,
  mainLetter: string,
  letters: string[]
) => {
  return (
    word.includes(mainLetter) &&
    getLettersFromWord(word).every((letter) => letters.includes(letter))
  );
};

export const getTodaysGame = () => {
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
  return { letters, possibleWords, timestamp };
};
