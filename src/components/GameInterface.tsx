"use client";
import { useState } from "react";
import { isPangram, getWordScore } from "../app/utils";
import { WordInput } from "./WordInput";
import { FoundWords } from "./FoundWords";
import { Stage } from "./Stage";
import { Message, MessageType, messages } from "./utils";

export const GameInterface = ({
  letters,
  possibleWords,
  maxScore,
  foundWords = [],
  onChangeFoundWords,
}: {
  letters: string[];
  possibleWords: string[];
  maxScore: number;
  foundWords: string[];
  onChangeFoundWords: (foundWords: string[]) => void;
}) => {
  const [message, setMessage] = useState<Message | null>(null);
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

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
    if (!word.includes(letters[0])) {
      return await flashMessage("centerMissing");
    }
    if (foundWords.includes(word)) {
      return await flashMessage("duplicate");
    }
    if (!possibleWords.includes(word)) {
      return await flashMessage("notInWordList");
    }
    const newFoundWords = [...foundWords, word];
    onChangeFoundWords(newFoundWords);
    const wordScore = getWordScore(word);
    if (isPangram(word)) {
      return await flashMessage("pangram", wordScore);
    }
    return await flashMessage("correct", wordScore);
  };

  return (
    <div className="flex max-w-xl flex-col gap-4 px-2">
      <Stage foundWords={foundWords} maxScore={maxScore} />
      <FoundWords foundWords={foundWords} />
      <WordInput
        letters={letters}
        message={message}
        onSubmit={submitWord}
        onCancelMessage={cancelMessage}
      />
    </div>
  );
};
