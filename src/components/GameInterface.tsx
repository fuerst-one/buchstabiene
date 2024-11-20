"use client";
import { useEffect, useState } from "react";
import { isPangram, getWordScore } from "../app/utils";
import { WordInput } from "./WordInput";
import { FoundWords } from "./FoundWords";
import { Stage } from "./Stage";
import { Message, MessageType, messages } from "./utils";

const LOCAL_STORAGE_KEY = "spelling-bee-save-state";

type SaveState = {
  foundWords: string[];
  timestamp: number;
};

export const GameInterface = ({
  timestamp,
  letters,
  possibleWords,
  maxScore,
}: {
  timestamp: number;
  letters: string[];
  possibleWords: string[];
  maxScore: number;
}) => {
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    const savedStateContent = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedStateContent) {
      return;
    }
    const savedState = JSON.parse(savedStateContent) as SaveState;
    if (savedState.timestamp !== timestamp) {
      return;
    }
    setFoundWords(savedState.foundWords);
  }, [timestamp]);

  const flashMessage = async (messageType: MessageType, score?: number) => {
    return new Promise<void>((resolve) => {
      setMessage({ ...messages[messageType], score });
      setTimeout(() => {
        setMessage(null);
        resolve();
      }, 1000);
    });
  };

  const submitWord = async (word: string) => {
    if (message) {
      return;
    }
    if (word.length < 4) {
      return await flashMessage("short");
    } else if (foundWords.includes(word)) {
      return await flashMessage("duplicate");
    } else if (!possibleWords.includes(word)) {
      return await flashMessage("error");
    }
    const newFoundWords = [...foundWords, word];
    setFoundWords(newFoundWords);
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        timestamp,
        foundWords: newFoundWords,
      })
    );
    const wordScore = getWordScore(word);
    if (isPangram(word)) {
      return await flashMessage("pangram", wordScore);
    } else {
      return await flashMessage("correct", wordScore);
    }
  };

  return (
    <div className="max-w-xl flex flex-col gap-4">
      <Stage foundWords={foundWords} maxScore={maxScore} />
      <FoundWords foundWords={foundWords} />
      <WordInput letters={letters} message={message} onSubmit={submitWord} />
    </div>
  );
};
