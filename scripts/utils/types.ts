export type GameSource = {
  letterSet: string;
  winningScore: number;
  totalScore: number;
  possibleWords: string[];
};

export type AmendmentAffectedGames = {
  amendmentId: number;
  dates: string[];
};

export type LetterSetFilterOptions = {
  letters?: string[];
  maxCount?: number;
};

export type GameFilterOptions = {
  minWords?: number;
  maxWords?: number;
  minScore?: number;
  maxScore?: number;
};

export type GameGenOptions = {
  letterSetFilter?: LetterSetFilterOptions;
  gameFilter?: GameFilterOptions;
};
