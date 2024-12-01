"use client";
import React, { useState } from "react";
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
import { useSaveState, SaveState } from "./useSaveState";
import { WordSuggestions } from "./WordSuggestions";
import { decodeGameData } from "./encodeGame";

export const Game = ({
  gameData,
  isLoggedIn,
  savedGame,
  downvotes,
}: {
  gameData: string;
  isLoggedIn: boolean;
  savedGame: SaveState | null;
  downvotes: string[];
}) => {
  const { date, letterSet, possibleWords, winningScore } =
    decodeGameData(gameData);

  const { foundWords, solutionsRevealed, setFoundWords } = useSaveState({
    date,
    isLoggedIn,
    savedGame,
  });

  const [message, setMessage] = useState<Message | null>(null);
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [showWinningDialog, setShowWinningDialog] = useState(false);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);

  const flashMessage = async ({
    type,
    score,
    callback,
  }: {
    type: MessageType;
    score?: number;
    callback?: () => void;
  }) => {
    setMessage({ ...messages[type], score });
    return new Promise<void>((resolve) => {
      setMessageTimeout(
        setTimeout(() => {
          callback?.();
          setMessageTimeout(null);
          setMessage(null);
          resolve();
        }, 1000),
      );
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

  const submitWord = async (word: string, callback: () => void) => {
    if (message) {
      return;
    }
    if (word.length < 4) {
      return await flashMessage({ type: "tooShort", callback });
    }
    if (!word.includes(letterSet[0])) {
      return await flashMessage({ type: "centerMissing", callback });
    }
    if (foundWords?.includes(word)) {
      return await flashMessage({ type: "duplicate", callback });
    }
    if (!possibleWords.includes(word)) {
      return await flashMessage({ type: "notInWordList", callback });
    }

    const oldFoundWords = foundWords ?? [];
    const newFoundWords = [...oldFoundWords, word];
    if (!solutionsRevealed) {
      setFoundWords(newFoundWords);
    }

    const score = getWordScore(word);
    if (isPangram(word)) {
      await flashMessage({ type: "pangram", score, callback });
    } else {
      await flashMessage({ type: "correct", score, callback });
    }

    const oldScore = getTotalScore(oldFoundWords);
    const newScore = oldScore + score;
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
      <WordSuggestions />
    </div>
  );
};
