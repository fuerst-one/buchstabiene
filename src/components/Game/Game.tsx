"use client";
import React, { useState } from "react";
import { GameData } from "@/server/api/game";
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
import { useSaveState } from "./useSaveState";
import { SaveState } from "./useSaveState";

export const Game = ({
  gameData,
  isLoggedIn,
  savedGame,
  downvotes,
}: {
  gameData: GameData;
  isLoggedIn: boolean;
  savedGame: SaveState | null;
  downvotes: string[];
}) => {
  const { date, letterSet, possibleWords, winningScore } = gameData;

  const { foundWords, solutionsRevealed, setFoundWords } = useSaveState({
    date,
    savedGame,
  });

  const [message, setMessage] = useState<Message | null>(null);
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [showWinningDialog, setShowWinningDialog] = useState(false);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);

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

    const oldFoundWords = foundWords ?? [];
    const newFoundWords = [...oldFoundWords, word];
    if (!solutionsRevealed) {
      setFoundWords(newFoundWords);
    }

    const wordScore = getWordScore(word);
    if (isPangram(word)) {
      await flashMessage("pangram", wordScore);
    } else {
      await flashMessage("correct", wordScore);
    }

    const oldScore = getTotalScore(oldFoundWords);
    const newScore = oldScore + wordScore;
    if (oldScore < winningScore && newScore >= winningScore) {
      setShowWinningDialog(true);
    }
    if (newFoundWords.length === possibleWords.length) {
      setShowCompletedDialog(true);
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
      <Stage
        foundWords={foundWords}
        winningScore={winningScore}
        completed={foundWords?.length === possibleWords.length}
      />
      <FoundWords
        isLoggedIn={isLoggedIn}
        foundWords={foundWords}
        possibleWords={possibleWords}
        downvotes={downvotes}
      />
      <WordInput
        letterSet={letterSet}
        message={message}
        isRevealed={solutionsRevealed}
        onSubmit={submitWord}
        onCancelMessage={cancelMessage}
      />
    </div>
  );
};
