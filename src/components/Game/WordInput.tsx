"use client";
import { cn } from "@/lib/utils";
import { useState, useCallback, ComponentProps } from "react";
import { Message } from "./utils";
import { useWindowEventListener } from "@/lib/useWindowEventListener";
import { Lock } from "lucide-react";

export const WordInput = ({
  letterSet,
  message,
  isRevealed,
  onSubmit,
  onCancelMessage,
}: {
  letterSet: string[];
  message: Message | null;
  isRevealed: boolean;
  onSubmit: (word: string) => Promise<void>;
  onCancelMessage: () => void;
}) => {
  const mainLetter = letterSet[0];
  const [otherLetters, setOtherLetters] = useState(letterSet.slice(1));
  const [selectedLetters, setSelectedLetters] = useState<string>("");

  const addSelectedLetter = useCallback((letter: string) => {
    setSelectedLetters((prev) => prev + letter);
  }, []);

  const shuffleLetters = useCallback(() => {
    setOtherLetters((prev) => [...prev].sort(() => Math.random() - 0.5));
  }, []);

  const deleteLetter = useCallback(() => {
    setSelectedLetters((prev) => prev.slice(0, -1));
  }, []);

  const handleSubmit = useCallback(async () => {
    await onSubmit(selectedLetters);
    setSelectedLetters("");
  }, [selectedLetters, onSubmit]);

  useWindowEventListener(
    "keydown",
    (event) => {
      if (message) {
        onCancelMessage();
        setSelectedLetters("");
      }
      const key = event.key.toLowerCase();
      if (letterSet.includes(key)) {
        addSelectedLetter(event.key);
      } else if (key === "backspace") {
        if (event.ctrlKey || event.altKey) {
          setSelectedLetters("");
        } else {
          deleteLetter();
        }
      } else if (key === "enter") {
        handleSubmit();
      }
    },
    [addSelectedLetter, deleteLetter, handleSubmit],
  );

  const LetterButton = useCallback(
    ({ letter, className }: { letter: string; className?: string }) => {
      return (
        <HexagonButton
          className={className}
          onPointerDown={() => addSelectedLetter(letter)}
        >
          {letter}
        </HexagonButton>
      );
    },
    [addSelectedLetter],
  );

  return (
    <div className="mt-6 flex flex-col gap-8">
      <div className="relative mx-auto w-64 max-w-full">
        <div className="flex h-12 w-full select-none items-center justify-center rounded-sm bg-white/5 text-center text-2xl font-semibold uppercase text-white">
          {selectedLetters.split("").map((letter, idx) => (
            <span
              key={idx}
              className={cn({ "text-yellow-500": letter === mainLetter })}
            >
              {letter}
            </span>
          ))}
          <span className="relative -top-0.5 animate-blink font-light text-yellow-500">
            |
          </span>
        </div>
        {isRevealed && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Lock className="size-4 text-white" />
          </div>
        )}
        {!!message && (
          <div className="absolute -bottom-6 left-0 w-full">
            <div className={cn("text-center", message.className)}>
              {message.text}
              {message.score && <span> +{message.score}</span>}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-nowrap items-center justify-center">
        <div className="-mx-[9px] flex flex-col items-center justify-center gap-[7px]">
          <LetterButton letter={otherLetters[0]} />
          <LetterButton letter={otherLetters[1]} />
        </div>
        <div className="-mx-[9px] flex flex-col items-center justify-center gap-[7px]">
          <LetterButton letter={otherLetters[2]} />
          <LetterButton
            letter={mainLetter}
            className="bg-yellow-400 text-black"
          />
          <LetterButton letter={otherLetters[3]} />
        </div>
        <div className="-mx-[9px] flex flex-col items-center justify-center gap-[7px]">
          <LetterButton letter={otherLetters[4]} />
          <LetterButton letter={otherLetters[5]} />
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <RoundButton onClick={deleteLetter}>Löschen</RoundButton>
        <RoundButton onClick={shuffleLetters}>Zufall</RoundButton>
        <RoundButton onClick={handleSubmit}>Eingabe</RoundButton>
      </div>
    </div>
  );
};

const HexagonButton = (props: ComponentProps<"button">) => {
  const [isActive, setIsActive] = useState(false);
  return (
    <button
      {...props}
      className={cn(
        "h-[5rem] w-[6rem] select-none rounded-sm bg-white/20 text-2xl font-bold uppercase text-white",
        { "scale-90": isActive },
        props.className,
      )}
      onPointerDown={(event) => {
        setIsActive(true);
        props.onPointerDown?.(event);
      }}
      onPointerUp={(event) => {
        setIsActive(false);
        props.onPointerUp?.(event);
      }}
      onPointerLeave={(event) => {
        setIsActive(false);
        props.onPointerLeave?.(event);
      }}
      onFocus={(event) => {
        event.target.blur();
        props.onFocus?.(event);
      }}
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
        "rounded-full border border-white/50 px-4 py-2 text-white",
        props.className,
      )}
    />
  );
};
