export type MessageType =
  | "centerMissing"
  | "tooShort"
  | "notInWordList"
  | "duplicate"
  | "correct"
  | "pangram";

export type Message = { className: string; text: string; score?: number };

export const messages: Record<MessageType, Message> = {
  tooShort: { className: "text-red-500", text: "Zu kurz" },
  centerMissing: { className: "text-red-500", text: "Hauptbuchstabe fehlt" },
  notInWordList: { className: "text-red-500", text: "Kein gesuchtes Wort" },
  duplicate: { className: "text-red-500", text: "Schon gefunden" },
  correct: { className: "text-green-500", text: "Toll!" },
  pangram: {
    className: "bg-yellow-500 text-black font-semibold rounded-sm px-1",
    text: "Pangramm!",
  },
};

export const getLettersFromWord = (word: string) => {
  if (!word) {
    return [];
  }
  return [...new Set(word.split("")).values()];
};

export const isPossibleWord = (word: string, letters: string[]) => {
  if (!word.includes(letters[0])) {
    return false;
  }
  const wordLetters = getLettersFromWord(word);
  for (const wordLetter of wordLetters) {
    if (!letters.includes(wordLetter)) {
      return false;
    }
  }
  return true;
};

export const isPangram = (word: string) => {
  return getLettersFromWord(word).length >= 7;
};

const getWordLengthScore = (word: string) => {
  return word.length === 4 ? 1 : word.length;
};

const getWordPangramScore = (word: string) => {
  return isPangram(word) ? 7 : 0;
};

export const getWordScore = (word: string) => {
  let score = 0;
  score += getWordLengthScore(word);
  score += getWordPangramScore(word);
  return score;
};

export const getTotalScore = (words?: string[] | null) => {
  return words?.reduce((acc, word) => acc + getWordScore(word), 0) ?? 0;
};

export const getWinningScore = (possibleWords: string[]) => {
  const filteredWords = possibleWords.filter((word) => word.length <= 7);
  return getTotalScore(filteredWords);
};
