"use client";

import { cn } from "@/lib/utils";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { isPangram, getWordScore } from "./utils";

const LOCAL_STORAGE_KEY = "spelling-bee-save-state";

type MessageType = "error" | "duplicate" | "correct" | "pangram";
type Message = { className: string; text: string; score?: number };
const messages: Record<MessageType, Message> = {
  error: { className: "text-red-500", text: "Kein valides Wort" },
  duplicate: { className: "text-red-500", text: "Schon gefunden" },
  correct: { className: "text-green-500", text: "Toll!" },
  pangram: {
    className: "bg-yellow-500 text-black font-semibold rounded-sm px-1",
    text: "Pangramm!",
  },
};

type SaveState = {
  foundWords: string[];
  timestamp: number;
};

export const GameInterface = ({
  letters,
  possibleWords,
  timestamp,
}: {
  letters: string[];
  possibleWords: string[];
  timestamp: number;
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
    if (foundWords.includes(word)) {
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
    <>
      <FoundWords foundWords={foundWords} />
      <WordInput letters={letters} message={message} onSubmit={submitWord} />
    </>
  );
};

const FoundWords = ({ foundWords }: { foundWords: string[] }) => {
  const [showAllFoundWords, setShowAllFoundWords] = useState(false);
  const totalScore = foundWords.reduce(
    (acc, word) => acc + getWordScore(word),
    0
  );

  if (showAllFoundWords) {
    return (
      <div
        className="bg-white/10 rounded-sm p-1 overflow-y-auto"
        onClick={() => setShowAllFoundWords(false)}
      >
        <div className="columns-2">
          {foundWords.toSorted().map((word) => (
            <div
              key={word}
              className={cn("text-white px-1 w-1/2 leading-7", {
                "font-bold": isPangram(word),
              })}
            >
              {word}{" "}
              <span className="text-gray-500">({getWordScore(word)})</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="flex items-center bg-white/10 h-8 rounded-sm px-2"
        onClick={() => setShowAllFoundWords(true)}
      >
        <div className="text-white px-1 text-ellipsis">
          {foundWords.toReversed().slice(0, 5).join(", ")}
        </div>
        <div className="text-gray-500">
          {foundWords.length > 5 ? "... " : ""}({foundWords.length})
        </div>
        <div className="mr-0 ml-auto text-yellow-500">{totalScore}</div>
      </div>
    </>
  );
};

const WordInput = ({
  letters,
  message,
  onSubmit,
}: {
  letters: string[];
  message: Message | null;
  onSubmit: (word: string) => Promise<void>;
}) => {
  const mainLetter = letters[0];
  const [otherLetters, setOtherLetters] = useState(letters.slice(1));
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);

  const LetterButton = useCallback(
    ({ letter, className }: { letter: string; className?: string }) => {
      return (
        <HexagonButton
          disabled={!!message}
          className={className}
          onClick={() => {
            setSelectedLetters((prev) => [...prev, letter]);
          }}
        >
          {letter}
        </HexagonButton>
      );
    },
    [message]
  );

  const shuffleLetters = () => {
    setOtherLetters((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const deleteLetter = () => {
    setSelectedLetters((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    await onSubmit(selectedLetters.join(""));
    setSelectedLetters([]);
  };

  return (
    <>
      <div className="relative w-64 h-10 flex justify-center items-start mx-auto text-center">
        <div className="uppercase text-white text-2xl font-semibold select-none">
          {selectedLetters.join("")}
        </div>
        {!!message && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
            <div className={cn("text-center", message.className)}>
              {message.text}
              {message.score && <span> +{message.score}</span>}
            </div>
          </div>
        )}
      </div>
      <div className="mb-6 flex flex-nowrap justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-2 -mx-1.5">
          <LetterButton letter={otherLetters[0]} />
          <LetterButton letter={otherLetters[1]} />
        </div>
        <div className="flex flex-col justify-center items-center gap-2 -mx-1.5">
          <LetterButton letter={otherLetters[2]} />
          <LetterButton letter={mainLetter} className="bg-yellow-400" />
          <LetterButton letter={otherLetters[3]} />
        </div>
        <div className="flex flex-col justify-center items-center gap-2 -mx-1.5">
          <LetterButton letter={otherLetters[4]} />
          <LetterButton letter={otherLetters[5]} />
        </div>
      </div>
      <div className="flex justify-center items-center gap-3">
        <RoundButton onClick={deleteLetter} disabled={!!message}>
          Löschen
        </RoundButton>
        <RoundButton onClick={shuffleLetters} disabled={!!message}>
          Zufall
        </RoundButton>
        <RoundButton onClick={handleSubmit} disabled={!!message}>
          Prüfen
        </RoundButton>
      </div>
    </>
  );
};

const HexagonButton = (props: ComponentProps<"button">) => {
  return (
    <button
      {...props}
      className={cn(
        "bg-gray-200 text-xl rounded-sm font-bold h-[4rem] w-[4.5rem] text-black uppercase",
        props.className
      )}
      style={{
        clipPath:
          "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
        ...props.style,
      }}
    />
  );
};

const RoundButton = (props: ComponentProps<"button">) => {
  return (
    <button
      {...props}
      className={cn(
        "bg-gray-800 rounded-full py-1 px-3 text-white",
        props.className
      )}
    />
  );
};
