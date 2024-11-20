export const getLettersFromWord = (word: string) => {
  if (!word) {
    return [];
  }
  return [...new Set(word.split("")).values()];
};

const restrictedLetters = "enisrt".split("");
const isRestrictedWord = (letters: string[]) => {
  return (
    restrictedLetters.filter((letter) => letters.includes(letter)).length >= 2
  );
};

export const isMainWord = (word: string) => {
  const letters = getLettersFromWord(word);
  if (letters.length < 7) {
    return false;
  }
  if (isRestrictedWord(letters)) {
    return false;
  }
  return true;
};

export const isPossibleWord = (
  word: string,
  mainLetter: string,
  letters: string[]
) => {
  return (
    word.includes(mainLetter) &&
    getLettersFromWord(word).every((letter) => letters.includes(letter))
  );
};

export const isPangram = (word: string) => {
  return getLettersFromWord(word).length >= 7;
};

export const getWordScore = (word: string) => {
  if (word.length === 4) {
    return 4;
  }
  if (isPangram(word)) {
    return word.length + 7;
  }
  return word.length;
};
