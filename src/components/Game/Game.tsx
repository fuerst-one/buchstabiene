"use client";
import React, { useEffect, useState } from "react";
import { GameInterface } from "./GameInterface";
import { updateSavedGame } from "@/server/api/game";
import { getSavedGame } from "@/server/api/game";
import { User } from "@/server/db/schema";

const LOCAL_STORAGE_KEY = "spelling-bee-save-state";

type SaveState = {
  gameId: string;
  foundWords: string[];
};

export const Game = ({
  user,
  gameId,
  letterSet,
  possibleWords,
  maxScore,
}: {
  user: User | null;
  gameId: string;
  letterSet: string[];
  possibleWords: string[];
  maxScore: number;
}) => {
  const [foundWords, setFoundWords] = useState<string[]>([]);

  useEffect(() => {
    const getSavedState = async () => {
      let savedState: SaveState | null = null;
      if (user) {
        savedState = await getSavedGame(gameId);
      } else {
        const savedStateContent = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!savedStateContent) {
          return;
        }
        savedState = JSON.parse(savedStateContent) as SaveState;
      }
      if (savedState?.gameId !== gameId) {
        return;
      }
      console.log(savedState);
      setFoundWords(savedState.foundWords);
    };
    getSavedState();
  }, [gameId, user]);

  const onChangeFoundWords = async (foundWords: string[]) => {
    setFoundWords(foundWords);
    if (user) {
      await updateSavedGame(gameId, foundWords);
    } else {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          gameId,
          foundWords,
        }),
      );
    }
  };

  return (
    <GameInterface
      letterSet={letterSet}
      possibleWords={possibleWords}
      maxScore={maxScore}
      foundWords={foundWords}
      onChangeFoundWords={onChangeFoundWords}
    />
  );
};
