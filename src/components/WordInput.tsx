"use client";
import { cn } from "@/lib/utils";
import { useState, useCallback, ComponentProps } from "react";
import { Message } from "./utils";
import { useWindowEventListener } from "@/lib/useWindowEventListener";

export const WordInput = ({
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

  const addLetter = useCallback((letter: string) => {
    setSelectedLetters((prev) => [...prev, letter]);
  }, []);

  const shuffleLetters = useCallback(() => {
    setOtherLetters((prev) => [...prev].sort(() => Math.random() - 0.5));
  }, []);

  const deleteLetter = useCallback(() => {
    setSelectedLetters((prev) => prev.slice(0, -1));
  }, []);

  const handleSubmit = useCallback(async () => {
    await onSubmit(selectedLetters.join(""));
    setSelectedLetters([]);
  }, [selectedLetters, onSubmit]);

  useWindowEventListener(
    "keydown",
    (event) => {
      if (message) {
        return;
      }
      const key = event.key.toLowerCase();
      if (letters.includes(key)) {
        addLetter(event.key);
      } else if (key === "backspace") {
        if (event.ctrlKey || event.altKey) {
          setSelectedLetters([]);
        } else {
          deleteLetter();
        }
      } else if (key === "enter") {
        handleSubmit();
      }
    },
    [addLetter, deleteLetter, handleSubmit]
  );

  const LetterButton = useCallback(
    ({ letter, className }: { letter: string; className?: string }) => {
      return (
        <HexagonButton
          disabled={!!message}
          className={className}
          onClick={() => addLetter(letter)}
        >
          {letter}
        </HexagonButton>
      );
    },
    [message, addLetter]
  );

  return (
    <div className="flex flex-col gap-6 mt-6">
      <div className="relative w-64 max-w-full h-10 flex justify-center items-start mx-auto text-center">
        <div className="bg-white/5 w-full rounded-sm uppercase text-white text-2xl font-semibold select-none">
          {selectedLetters.join("")}
          <span className="text-yellow-500 animate-bounce relative -top-0.5">
            |
          </span>
        </div>
        {!!message && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
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
          <LetterButton
            letter={mainLetter}
            className="bg-yellow-400 text-black"
          />
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
    </div>
  );
};

const HexagonButton = (props: ComponentProps<"button">) => {
  return (
    <button
      {...props}
      className={cn(
        "bg-white/20 text-xl rounded-sm font-bold h-[4rem] w-[4.75rem] text-white uppercase",
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
        "border border-white/50 rounded-full py-1 px-3 text-white",
        props.className
      )}
    />
  );
};
