"use client";
import React, { useEffect, useState } from "react";
import { GameData, updateSavedGame } from "@/server/api/game";
import { getSavedGame } from "@/server/api/game";
import { User } from "@/server/db/schema";
import {
  getTotalScore,
  getWordScore,
  Message,
  messages,
  MessageType,
} from "./utils";
import { Stage } from "./Stage";
import { FoundWords } from "./FoundWords";
import { isPangram } from "./utils";
import { WordInput } from "./WordInput";
import { DialogWinner } from "./DialogWinner";
import { DialogCompleted } from "./DialogCompleted";

export const SAVE_STATE_LOCAL_STORAGE_KEY = "spelling-bee-save-state";

export type SaveState = {
  gameId: string;
  foundWords: string[];
  solutionsRevealed: boolean;
};

export const Game = ({
  user,
  gameData,
}: {
  user: User | null;
  gameData: GameData;
}) => {
  const { gameId, letterSet, possibleWords, winningScore } = gameData;

  const [foundWords, setFoundWords] = useState<string[] | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [showWinningDialog, setShowWinningDialog] = useState(false);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const getSavedState = async () => {
      let savedState: SaveState | null = null;
      if (user) {
        savedState = await getSavedGame(gameId);
      } else {
        const savedStateContent = localStorage.getItem(
          SAVE_STATE_LOCAL_STORAGE_KEY,
        );
        if (!savedStateContent) {
          return;
        }
        savedState = JSON.parse(savedStateContent) as SaveState;
      }
      if (!savedState || savedState.gameId !== gameId) {
        setFoundWords([]);
        return;
      }
      setIsRevealed(savedState.solutionsRevealed);
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
        SAVE_STATE_LOCAL_STORAGE_KEY,
        JSON.stringify({
          gameId,
          foundWords,
          solutionsRevealed: false,
        }),
      );
    }
  };

  const flashMessage = async (messageType: MessageType, score?: number) => {
    return new Promise<void>((resolve) => {
      setMessage({ ...messages[messageType], score });
      const timeout = setTimeout(() => {
        setMessage(null);
        setMessageTimeout(null);
        resolve();
      }, 1000);
      setMessageTimeout(timeout);
    });
  };

  const cancelMessage = () => {
    if (!messageTimeout) {
      return;
    }
    clearTimeout(messageTimeout);
    setMessageTimeout(null);
    setMessage(null);
  };

  const submitWord = async (word: string) => {
    if (message) {
      return;
    }
    if (word.length < 4) {
      return await flashMessage("tooShort");
    }
    if (!word.includes(letterSet[0])) {
      return await flashMessage("centerMissing");
    }
    if (foundWords?.includes(word)) {
      return await flashMessage("duplicate");
    }
    if (!possibleWords.includes(word)) {
      return await flashMessage("notInWordList");
    }
    const newFoundWords = [...(foundWords ?? []), word];
    if (!isRevealed) {
      onChangeFoundWords(newFoundWords);
    }
    const wordScore = getWordScore(word);
    if (isPangram(word)) {
      await flashMessage("pangram", wordScore);
    } else {
      await flashMessage("correct", wordScore);
    }
    if (getTotalScore(newFoundWords) >= winningScore) {
      setTimeout(() => {
        setShowWinningDialog(true);
      }, 1000);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 px-2">
      <DialogWinner
        open={showWinningDialog}
        onOpenChange={setShowWinningDialog}
      />
      <DialogCompleted
        open={showCompletedDialog}
        onOpenChange={setShowCompletedDialog}
      />
      <Stage foundWords={foundWords} winningScore={winningScore} />
      <FoundWords foundWords={foundWords} possibleWords={possibleWords} />
      <WordInput
        letterSet={letterSet}
        message={message}
        isRevealed={isRevealed}
        onSubmit={submitWord}
        onCancelMessage={cancelMessage}
      />
    </div>
  );
};
