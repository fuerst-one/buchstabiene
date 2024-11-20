"use client";
import { isPangram, getWordScore } from "@/app/utils";
import { capitalize, cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const FoundWords = ({ foundWords }: { foundWords: string[] }) => {
  const [showAllFoundWords, setShowAllFoundWords] = useState(false);

  return (
    <div
      className="bg-white/10 rounded-sm py-1 px-2 overflow-y-auto"
      onClick={() => setShowAllFoundWords((prev) => !prev)}
    >
      <div className="flex items-center justify-between">
        <div className="text-white px-1 text-ellipsis">
          {foundWords.toReversed().slice(0, 5).map(capitalize).join(", ")}
          <span className="text-white/50">
            {foundWords.length > 5 ? "... " : ""}({foundWords.length})
          </span>
        </div>
        <ChevronDown
          className={cn("w-4 h-4", { "rotate-180": showAllFoundWords })}
        />
      </div>
      {showAllFoundWords && (
        <div className="bg-white/10 rounded-sm py-1 px-2 overflow-y-auto my-1">
          <div className="columns-2">
            {foundWords.toSorted().map((word) => (
              <div
                key={word}
                className={cn("text-white px-1 w-1/2 leading-7", {
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
