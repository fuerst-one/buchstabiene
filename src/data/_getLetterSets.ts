import fs from "fs";
import { getLettersFromWord, getMaxScore, isPossibleWord } from "@/app/utils";

const restrictedLetters = "enisrt".split("");
const isRestrictedLetterSet = (letters: string[]) => {
  return (
    restrictedLetters.filter((letter) => letters.includes(letter)).length > 1
  );
};

const getLetterSets = (allWords: string[]) => {
  const potentialLetterSets = allWords
    .map((word) => getLettersFromWord(word))
    .filter((letters) => letters.length === 7)
    .filter((letters) => !isRestrictedLetterSet(letters));

  console.log({ potentialLetterSetCount: potentialLetterSets.length });

  const validLetterSets = potentialLetterSets.filter((letters, idx) => {
    const possibleWords = allWords.filter((word) =>
      isPossibleWord(word, letters)
    );
    const maxScore = getMaxScore(possibleWords);
    console.log({
      idx,
      letters: letters.join(""),
      wordCount: possibleWords.length,
      maxScore,
    });
    return possibleWords.length > 20 && maxScore > 100 && maxScore < 400;
  });

  console.log({ validLetterSetCount: validLetterSets.length });

  const validletterSets = validLetterSets.map((letters) => letters.join(""));

  console.log({
    letterSetsCount: validletterSets.length,
  });

  const chunks = validletterSets.reduce((acc, word) => {
    const letters = getLettersFromWord(word);
    const mainLetter = letters[0];
    acc[mainLetter] = [...(acc[mainLetter] || []), new Set(word.slice(1))];
    return acc;
  }, {} as Record<string, Set<string>[]>);

  // get unique letter sets for each main letter
  const uniqueLetterSets = Object.entries(chunks).map(
    ([mainLetter, otherLetterSets]) => {
      const uniqueLetterSets: Set<string>[] = [];

      for (const letterSet of otherLetterSets) {
        if (
          !uniqueLetterSets.find((set) => set.difference(letterSet).size === 0)
        ) {
          uniqueLetterSets.push(new Set(letterSet));
        }
      }

      return {
        mainLetter,
        otherLetterSets: uniqueLetterSets.map((set) =>
          [...set.values()].join("")
        ),
      };
    }
  );

  const letterSets = uniqueLetterSets.reduce(
    (acc, { mainLetter, otherLetterSets }) => {
      for (const letters of otherLetterSets) {
        acc.push(mainLetter + letters);
      }
      return acc;
    },
    [] as string[]
  );

  return letterSets;
};

const main = () => {
  const wordsFileContent = fs.readFileSync("./src/data/words.txt");
  const words = wordsFileContent.toString().split("\n");

  const letterSets = getLetterSets(words);

  fs.writeFileSync("./src/data/letter-sets.txt", letterSets.join("\n"));
};

main();
