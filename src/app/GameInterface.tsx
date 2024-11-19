"use client";

import { cn } from "@/lib/utils";
import { ComponentProps, useEffect, useState } from "react";

const LOCAL_STORAGE_KEY = "spelling-bee-save-state";

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
  const mainLetter = letters[0];
  const [otherLetters, setOtherLetters] = useState(letters.slice(1));

  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [showCorrectWords, setShowCorrectWords] = useState(false);

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

  const shuffleLetters = () => {
    setOtherLetters((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const addLetter = (letter: string) => {
    setSelectedLetters((prev) => [...prev, letter]);
  };

  const deleteLetter = () => {
    setSelectedLetters((prev) => prev.slice(0, -1));
  };

  const enterWord = () => {
    const word = selectedLetters.join("");
    if (possibleWords.includes(word) && !foundWords.includes(word)) {
      setIsCorrect(true);
      setTimeout(() => {
        setIsCorrect(false);
        setSelectedLetters([]);
      }, 1000);
      const newFoundWords = [...foundWords, word];
      setFoundWords(newFoundWords);
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          timestamp,
          foundWords: newFoundWords,
        })
      );
    } else if (foundWords.includes(word)) {
      setSelectedLetters([]);
      setIsDuplicate(true);
      setTimeout(() => {
        setIsDuplicate(false);
      }, 1000);
    } else {
      setSelectedLetters([]);
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col gap-4 container max-w-lg p-4">
      <h1 className="text-xl font-bold text-center w-full">
        Buchstabier-Biene
      </h1>
      {showCorrectWords ? (
        <div
          className="grid grid-cols-2 items-start justify-start flex-wrap bg-white/10 h-[calc(100vh-10rem)] rounded-sm p-1"
          onClick={() => setShowCorrectWords(false)}
        >
          {foundWords.toReversed().map((word) => (
            <div
              key={word}
              className="text-white font-bold px-1 uppercase w-1/2"
            >
              {word}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div
            className="flex items-center bg-white/10 h-8 rounded-sm px-1"
            onClick={() => setShowCorrectWords(true)}
          >
            {foundWords
              .toReversed()
              .slice(0, 5)
              .map((word) => (
                <div key={word} className="text-white font-bold px-1 uppercase">
                  {word}
                </div>
              ))}
          </div>
          <div className="relative">
            <div className="uppercase text-white text-center rounded-md w-64 h-10 flex items-center justify-center text-lg font-bold select-none">
              {selectedLetters.join("")}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2">
              {isCorrect && (
                <div className="text-green-500 text-center">Toll!</div>
              )}
              {isError && (
                <div className="text-red-500 text-center">
                  Kein valides Wort
                </div>
              )}
              {isDuplicate && (
                <div className="text-yellow-500 text-center">
                  Schon gefunden
                </div>
              )}
            </div>
          </div>
          <div className="my-6 flex flex-nowrap justify-center items-center">
            <div className="flex flex-col justify-center items-center gap-2 -mx-1.5">
              <LetterButton onClick={() => addLetter(otherLetters[0])}>
                {otherLetters[0]}
              </LetterButton>
              <LetterButton onClick={() => addLetter(otherLetters[1])}>
                {otherLetters[1]}
              </LetterButton>
            </div>
            <div className="flex flex-col justify-center items-center gap-2 -mx-1.5">
              <LetterButton onClick={() => addLetter(otherLetters[2])}>
                {otherLetters[2]}
              </LetterButton>
              <LetterButton
                onClick={() => addLetter(mainLetter)}
                className="bg-yellow-500 col-span-2 row-span-2"
              >
                {mainLetter}
              </LetterButton>
              <LetterButton onClick={() => addLetter(otherLetters[3])}>
                {otherLetters[3]}
              </LetterButton>
            </div>
            <div className="flex flex-col justify-center items-center gap-2 -mx-1.5">
              <LetterButton onClick={() => addLetter(otherLetters[4])}>
                {otherLetters[4]}
              </LetterButton>
              <LetterButton onClick={() => addLetter(otherLetters[5])}>
                {otherLetters[5]}
              </LetterButton>
            </div>
          </div>
          <div className="flex justify-center items-center gap-3">
            <Button onClick={deleteLetter}>Löschen</Button>
            <Button onClick={shuffleLetters}>Zufall</Button>
            <Button onClick={enterWord}>Prüfen</Button>
          </div>
        </>
      )}
    </div>
  );
};

const LetterButton = (props: ComponentProps<"button">) => {
  return (
    <button
      {...props}
      className={cn(
        "bg-white rounded-sm font-bold h-[4rem] w-[4.5rem] text-black uppercase",
        props.className
      )}
      style={{
        clipPath:
          "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
      }}
    />
  );
};

const Button = (props: ComponentProps<"button">) => {
  return (
    <button
      {...props}
      className="bg-gray-700 rounded-full py-1 px-3 text-white"
    />
  );
};
