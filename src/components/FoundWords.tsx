"use client";
import { isPangram, getWordScore } from "@/app/utils";
import { capitalize, cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const FoundWords = ({ foundWords }: { foundWords: string[] }) => {
  const [showAllFoundWords, setShowAllFoundWords] = useState(false);

  return (
    <div
      className="overflow-y-auto rounded-sm bg-white/10 px-2 py-1"
      onClick={() => setShowAllFoundWords((prev) => !prev)}
    >
      <div className="flex items-center justify-between">
        <div className="text-ellipsis px-1 text-white">
          {foundWords.toReversed().slice(0, 5).map(capitalize).join(", ")}
          <span className="text-white/50">
            {foundWords.length > 5 ? "..." : ""} ({foundWords.length})
          </span>
        </div>
        <ChevronDown
          className={cn("h-4 w-4", { "rotate-180": showAllFoundWords })}
        />
      </div>
      {showAllFoundWords && (
        <div className="my-1 overflow-y-auto rounded-sm bg-white/10 px-2 py-1">
          <div className="columns-2">
            {foundWords.toSorted().map((word) => (
              <div
                key={word}
                className={cn("w-1/2 px-1 leading-7 text-white", {
                  "font-bold": isPangram(word),
                })}
              >
                {capitalize(word)}{" "}
                <span className="text-white/50">({getWordScore(word)})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
