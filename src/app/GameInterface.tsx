"use client";

import { cn } from "@/lib/utils";
import { ComponentProps, useState } from "react";

export const GameInterface = ({
  letters,
  possibleWords,
}: {
  letters: string[];
  possibleWords: string[];
}) => {
  console.log({ letters, possibleWords });

  const mainLetter = letters[0];
  const [otherLetters, setOtherLetters] = useState(letters.slice(1));

  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

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
    if (possibleWords.includes(selectedLetters.join(""))) {
      setIsCorrect(true);
      setTimeout(() => {
        setIsCorrect(false);
      }, 1000);
      setFoundWords((prev) => [...prev, selectedLetters.join("")]);
    } else {
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        {foundWords.slice(0, 5).map((word) => (
          <div key={word} className="text-white border border-white">
            {word}
          </div>
        ))}
      </div>
      <div className="bg-gray-800 text-white text-center rounded-md w-64 h-10 flex items-center justify-center text-lg font-bold select-none">
        {selectedLetters.join("")}
      </div>
      {isCorrect && <div className="text-green-500 text-center">Great!</div>}
      {isError && (
        <div className="text-red-500 text-center">Not a valid word</div>
      )}
      <div className="my-6 flex flex-nowrap justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-4">
          <LetterButton onClick={() => addLetter(otherLetters[0])}>
            {otherLetters[0]}
          </LetterButton>
          <LetterButton onClick={() => addLetter(otherLetters[1])}>
            {otherLetters[1]}
          </LetterButton>
        </div>
        <div className="flex flex-col justify-center items-center gap-4">
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
        <div className="flex flex-col justify-center items-center gap-4">
          <LetterButton onClick={() => addLetter(otherLetters[4])}>
            {otherLetters[4]}
          </LetterButton>
          <LetterButton onClick={() => addLetter(otherLetters[5])}>
            {otherLetters[5]}
          </LetterButton>
        </div>
      </div>
      <div className="flex justify-center items-center gap-3">
        <Button onClick={shuffleLetters}>Shuffle</Button>
        <Button onClick={deleteLetter}>Delete</Button>
        <Button onClick={enterWord}>Enter</Button>
      </div>
    </div>
  );
};

const LetterButton = (props: ComponentProps<"button">) => {
  return (
    <button
      {...props}
      className={cn(
        "bg-white rounded-sm font-bold h-12 w-14 text-black uppercase",
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
