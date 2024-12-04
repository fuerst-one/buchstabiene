"use client";
import { gameDateDate } from "@/lib/DateFormat";
import { AmendmentEffect } from "@/server/api/dictionaryAmendments";
import { SavedGame, userUpdateSavedGame } from "@/server/api/game";
import {
  userRevealSolutions,
  userDismissAmendments,
} from "@/server/api/savedGames";
import { useState } from "react";

export type SaveState = {
  date?: string;
  foundWords: string[];
  solutionsRevealedAt: Date | null;
  amendmentsDismissed: boolean;
  amendmentsDismissedAt: Date | null;
};

const isAmendmentsDismissed = (
  amendments: AmendmentEffect[] | undefined,
  amendmentsDismissedAt: Date | null,
) => {
  if (!amendments?.length) {
    return true;
  }
  if (!amendmentsDismissedAt) {
    return false;
  }
  return amendments.every((amendment) =>
    gameDateDate(amendmentsDismissedAt).isAfter(
      gameDateDate(amendment.appliedAt),
    ),
  );
};

export const SAVE_STATE_LOCAL_STORAGE_KEY = "spelling-bee-save-state";

export const getLocalStorageSaveState = () => {
  const savedStateContent = localStorage?.getItem(SAVE_STATE_LOCAL_STORAGE_KEY);
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
  isLoggedIn,
  savedGame,
  amendments,
}: {
  date: string;
  isLoggedIn: boolean;
  savedGame: SavedGame | null;
  amendments?: AmendmentEffect[];
}) => {
  const [gameState, setGameState] = useState<SaveState>(() => {
    if (isLoggedIn && savedGame) {
      return {
        ...savedGame,
        amendmentsDismissed: isAmendmentsDismissed(
          amendments,
          savedGame.amendmentsDismissedAt,
        ),
      };
    }
    const localStorageSaveState = getLocalStorageSaveState();
    if (localStorageSaveState?.date === date) {
      return localStorageSaveState;
    }
    return {
      date,
      foundWords: [],
      solutionsRevealedAt: null,
      amendmentsDismissed: true,
      amendmentsDismissedAt: null,
    };
  });

  const setFoundWords = async (foundWords: string[]) => {
    setGameState({ ...gameState, foundWords });
    if (isLoggedIn) {
      await userUpdateSavedGame(date, foundWords);
    } else {
      setLocalStorageSaveState({ ...gameState, foundWords });
    }
  };

  const setSolutionsRevealed = async () => {
    setGameState({ ...gameState, solutionsRevealedAt: new Date() });
    if (isLoggedIn) {
      await userRevealSolutions(date);
    } else {
      setLocalStorageSaveState({
        ...gameState,
        solutionsRevealedAt: new Date(),
      });
    }
  };

  const setAmendmentsDismissed = async () => {
    setGameState({
      ...gameState,
      amendmentsDismissed: true,
      amendmentsDismissedAt: new Date(),
    });
    if (isLoggedIn) {
      await userDismissAmendments(date);
    } else {
      setLocalStorageSaveState({
        ...gameState,
        amendmentsDismissed: true,
        amendmentsDismissedAt: new Date(),
      });
    }
  };

  return {
    ...gameState,
    setFoundWords,
    setSolutionsRevealed,
    setAmendmentsDismissed,
  } as const;
};
