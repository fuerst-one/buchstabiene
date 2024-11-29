import { userUpdateSavedGame } from "@/server/api/game";
import { userRevealSolutions } from "@/server/api/solutions";
import { useState } from "react";

export type SaveState = {
  date: string;
  foundWords: string[];
  solutionsRevealed: boolean;
};

export const SAVE_STATE_LOCAL_STORAGE_KEY = "spelling-bee-save-state";

export const getLocalStorageSaveState = () => {
  const savedStateContent = localStorage.getItem(SAVE_STATE_LOCAL_STORAGE_KEY);
  if (!savedStateContent) {
    return;
  }
  return JSON.parse(savedStateContent) as SaveState;
};

export const setLocalStorageSaveState = (saveState: SaveState) => {
  localStorage.setItem(SAVE_STATE_LOCAL_STORAGE_KEY, JSON.stringify(saveState));
};

export const useSaveState = ({
  date,
  savedGame,
}: {
  date: string;
  savedGame: SaveState | null;
}) => {
  const [gameState, setGameState] = useState<SaveState>(() => {
    if (savedGame?.date === date) {
      return savedGame;
    }
    const localStorageSaveState = getLocalStorageSaveState();
    if (localStorageSaveState?.date === date) {
      return localStorageSaveState;
    }
    return {
      date,
      foundWords: [],
      solutionsRevealed: false,
    };
  });

  const setFoundWords = async (foundWords: string[]) => {
    setGameState({ ...gameState, foundWords });
    if (savedGame) {
      await userUpdateSavedGame(date, foundWords);
    } else {
      setLocalStorageSaveState({ ...gameState, foundWords });
    }
  };

  const setSolutionsRevealed = async (solutionsRevealed: boolean) => {
    setGameState({ ...gameState, solutionsRevealed });
    if (savedGame) {
      await userRevealSolutions(date);
    } else {
      setLocalStorageSaveState({ ...gameState, solutionsRevealed });
    }
  };

  return { ...gameState, setFoundWords, setSolutionsRevealed } as const;
};
