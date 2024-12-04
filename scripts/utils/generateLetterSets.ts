import { getLettersFromWord } from "@/components/Game/utils";
import { readWordsFile } from "./files";
import { DEFAULT_GAME_GEN_OPTIONS } from "./utils";
import { LetterSetFilterOptions } from "./types";

const isValidLetterSet = (
  letters: string[],
  options?: LetterSetFilterOptions,
) => {
  if (!options?.letters || !options?.maxCount) {
    return true;
  }
  return (
    letters.filter((letter) => options.letters!.includes(letter)).length <=
    options.maxCount
  );
};

export const generateLetterSets = (
  words: string[],
  options = DEFAULT_GAME_GEN_OPTIONS.letterSetFilter,
) => {
  // Get all possible letterSets
  const possibleLetterSets = words
    .map((word) => getLettersFromWord(word))
    .filter((letters) => letters.length === 7)
    .filter((letters) => isValidLetterSet(letters, options));

  // Get letterSet sets by splitting each letterSet into main letter and other letters
  const letterSetsByMainLetter = possibleLetterSets.reduce(
    (acc, letters) => {
      // Split letterSet into main letter and other letters
      const [mainLetter, ...otherLetters] = letters;
      acc[mainLetter] = [...(acc[mainLetter] || []), otherLetters];
      return acc;
    },
    {} as Record<string, string[][]>,
  );

  // Get unique letterSet sets for each main letter
  const letterSetsByMainLetterUnique = Object.entries(
    letterSetsByMainLetter,
  ).map(([mainLetter, otherLetters]) => {
    const uniqueOtherLetters: string[] = [];
    for (const letters of otherLetters) {
      if (!uniqueOtherLetters.includes(letters.sort().join(""))) {
        uniqueOtherLetters.push(letters.sort().join(""));
      }
    }
    return [mainLetter, uniqueOtherLetters] as const;
  });

  // Join main letter with unique letterSet sets to get all unique letterSets
  const letterSets = letterSetsByMainLetterUnique.flatMap(
    ([mainLetter, otherLetters]) =>
      otherLetters.map((letters) => mainLetter + letters),
  );

  console.log(`Generated ${letterSets.length} unique letter sets.`);

  return letterSets;
};

const main = async () => {
  const words = await readWordsFile();
  generateLetterSets(words);
};

if (require.main === module) {
  main();
}
