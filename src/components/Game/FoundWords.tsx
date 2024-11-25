"use client";
import { isPangram, getWordScore } from "./utils";
import { capitalize, cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const FoundWords = ({
  foundWords,
  possibleWords,
}: {
  foundWords: string[] | null;
  possibleWords: string[];
}) => {
  const [showAllFoundWords, setShowAllFoundWords] = useState(false);

  return (
    <div
      className="w-full rounded-sm bg-white/10 px-2 py-1"
      onClick={() => setShowAllFoundWords((prev) => !prev)}
    >
      <div className="flex items-center justify-between">
        <div className="max-w-full overflow-hidden text-clip whitespace-nowrap text-white">
          {foundWords
            ?.toReversed()
            .slice(0, 10)
            .map((word) => (
              <span key={word} className={cn({ "font-bold": isPangram(word) })}>
                {capitalize(word)}
                {", "}
              </span>
            ))}
        </div>
        <span className="ml-0 mr-auto whitespace-nowrap text-white/50">
          {foundWords ? (
            <>
              {foundWords && foundWords.length > 5 ? "..." : ""} (
              {foundWords?.length} Wörter)
            </>
          ) : (
            "Lädt..."
          )}
        </span>
        <ChevronDown
          className={cn("ml-1 size-4 shrink-0", {
            "rotate-180": showAllFoundWords,
          })}
        />
      </div>
      {showAllFoundWords && (
        <div className="my-1 overflow-y-auto rounded-sm bg-white/10 px-2 py-1">
          <div className="columns-2">
            {foundWords?.toSorted().map((word) => (
              <div
                key={word}
                className={cn(
                  "w-1/2 whitespace-nowrap px-1 leading-7 text-white",
                  {
                    "font-bold": isPangram(word),
                  },
                )}
              >
                {capitalize(word)}{" "}
                <span className="text-white/50">({getWordScore(word)})</span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-center text-xs">
            Noch {possibleWords.length - (foundWords?.length ?? 0)} Wörter
            möglich
          </p>
        </div>
      )}
    </div>
  );
};
