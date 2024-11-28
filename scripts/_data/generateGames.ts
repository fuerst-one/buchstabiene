import {
  getLettersFromWord,
  getWinningScore,
  isPossibleWord,
} from "@/components/Game/utils";
import {
  GameSource,
  getWordsHash,
  readGamesFile,
  readRemovedWordsFile,
  readUniqueLetterSetsFile,
  readWordsFile,
  writeGamesFile,
  writeUniqueLetterSetsFile,
} from "./files";
import { shuffle } from "@/lib/shuffle";

const restrictedLetters = "enisrat".split("");
const isRestrictedLetterSet = (letters: string[]) => {
  return (
    restrictedLetters.filter((letter) => letters.includes(letter)).length > 2
  );
};

const getUniqueLetterSets = async (allWords: string[], wordsHash: string) => {
  try {
    const letterSetsUnique = await readUniqueLetterSetsFile(wordsHash);
    console.log({ letterSetsUniqueCount: letterSetsUnique.length });
    return letterSetsUnique;
  } catch {
    console.log("No unique letter sets found, generating...");
  }

  const potentialLetterSets = allWords
    .map((word) => getLettersFromWord(word))
    .filter((letters) => letters.length === 7)
    .filter((letters) => !isRestrictedLetterSet(letters));

  // get unique letter sets for each main letter
  const chunks = potentialLetterSets.reduce(
    (acc, letters) => {
      const mainLetter = letters[0];
      acc[mainLetter] = [...(acc[mainLetter] || []), new Set(letters.slice(1))];
      return acc;
    },
    {} as Record<string, Set<string>[]>,
  );
  const letterSetsUnique = Object.entries(chunks)
    .map(([mainLetter, otherLetterSets]) => {
      const letterSetsUnique: Set<string>[] = [];
      for (const letterSet of otherLetterSets) {
        if (
          !letterSetsUnique.find((set) => set.difference(letterSet).size === 0)
        ) {
          letterSetsUnique.push(new Set(letterSet));
        }
      }
      return {
        mainLetter,
        otherLetterSets: letterSetsUnique.map((set) =>
          [...set.values()].join(""),
        ),
      };
    })
    .reduce((acc, { mainLetter, otherLetterSets }) => {
      for (const letters of otherLetterSets) {
        acc.push(mainLetter + letters);
      }
      return acc;
    }, [] as string[]);

  console.log({ letterSetsUniqueCount: letterSetsUnique.length });

  await writeUniqueLetterSetsFile(wordsHash, letterSetsUnique);
  return letterSetsUnique;
};

const getAllGames = async (allWords: string[], wordsHash: string) => {
  try {
    const allGames = (await readGamesFile(wordsHash)) as GameSource[];
    console.log({ allGamesCount: allGames.length });
    return allGames;
  } catch {
    console.log("No games found, generating...");
  }

  const uniqueLetterSets = await getUniqueLetterSets(allWords, wordsHash);

  const allGames = uniqueLetterSets.map((letterSet, index) => {
    const letters = letterSet.split("");
    const possibleWords = allWords.filter((word) =>
      isPossibleWord(word, letters),
    );
    const winningScore = getWinningScore(possibleWords);
    return {
      index,
      letterSet,
      winningScore,
      possibleWords,
    };
  });

  console.log({ allGamesCount: allGames.length });

  await writeGamesFile(wordsHash, allGames);
  return allGames;
};

export const getScoreTable = (games: GameSource[]) => {
  return Object.fromEntries(
    Object.entries(
      games.reduce(
        (acc, { winningScore }) => {
          const scoreGroup = Math.floor(winningScore / 10) * 10;
          acc[scoreGroup] = (acc[scoreGroup] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>,
      ),
    ).map(([score, count]) => [
      score,
      Array(Math.round(count / 10))
        .fill("*")
        .join(""),
    ]),
  );
};

export const generateGames = async (
  allWords: string[],
  wordsHash: string,
  filterGames: (game: GameSource) => boolean = ({
    possibleWords,
    winningScore,
  }) => possibleWords.length > 20 && winningScore > 90 && winningScore < 150,
) => {
  const allGames = await getAllGames(allWords, wordsHash);

  const validGames = allGames.filter(filterGames);
  const scoreTable = getScoreTable(validGames);

  console.log({
    validGameCount: validGames.length,
    scoreTable,
  });

  return shuffle(validGames);
};

const main = async () => {
  const words = await readWordsFile();
  const removedWords = await readRemovedWordsFile();
  const allWords = words.filter((word) => !removedWords.includes(word));
  const wordsHash = await getWordsHash(allWords);
  await generateGames(allWords, wordsHash);
};

if (require.main === module) {
  main();
}
