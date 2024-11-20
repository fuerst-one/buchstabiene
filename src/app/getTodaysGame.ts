"use server";
import fs from "fs";
import dayjs from "@/dayjs";
import { isPossibleWord, getMaxScore } from "./utils";
import { btoa } from "buffer";

export type Game = {
  id: string;
  letters: string[];
  possibleWords: string[];
  maxScore: number;
};

export const getTodaysGame = async (): Promise<Game> => {
  const wordsFileContent = fs.readFileSync("src/data/words.txt");
  const words = wordsFileContent.toString().split("\n");

  const letterSetsContent = fs.readFileSync("src/data/letter-sets.txt");
  const letterSets = letterSetsContent.toString().split("\n");

  const timestamp = Math.floor(
    dayjs().tz("Europe/Berlin").startOf("day").valueOf() / 1000
  );
  const todayIndex = timestamp % letterSets.length;
  const letterSet = letterSets[todayIndex];

  const id = btoa(letterSet + timestamp);
  const letters = letterSet.split("");
  const possibleWords = words.filter((word) => isPossibleWord(word, letters));
  const maxScore = getMaxScore(possibleWords);

  return { id, letters, possibleWords, maxScore };
};
