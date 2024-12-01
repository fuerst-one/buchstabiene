"use client";
import { isPangram, getWordScore } from "./utils";
import { capitalize, cn } from "@/lib/utils";
import { userAddWordVotes, userDeleteWordVote } from "@/server/api/wordVotes";
import { ChevronDown, ThumbsDown } from "lucide-react";
import { useState } from "react";

export const FoundWords = ({
  isLoggedIn,
  foundWords,
  possibleWords,
  downvotes,
}: {
  isLoggedIn: boolean;
  foundWords: string[] | null;
  possibleWords: string[];
  downvotes: string[];
}) => {
  const [showAllFoundWords, setShowAllFoundWords] = useState(false);
  const wordsLeft = possibleWords.length - (foundWords?.length ?? 0);

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
                  "flex w-1/2 items-center gap-1 whitespace-nowrap px-1 leading-7 text-white",
                  {
                    "font-bold": isPangram(word),
                  },
                )}
              >
                <span>{capitalize(word)}</span>
                <span className="text-white/50">({getWordScore(word)})</span>
                {isLoggedIn && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={cn(
                      downvotes.includes(word)
                        ? "text-red-500"
                        : "text-red-500/50",
                    )}
                  >
                    <ThumbsDown
                      className="size-4"
                      onClick={() =>
                        downvotes.includes(word)
                          ? userDeleteWordVote(word)
                          : userAddWordVotes([word], -1)
                      }
                    />
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-1 text-center text-xs">
            {wordsLeft ? (
              <>Noch {wordsLeft} Wörter möglich</>
            ) : (
              <>Alle Wörter für heute gefunden, Gratulation!</>
            )}{" "}
            / Benutze
            <ThumbsDown className="mx-1 inline size-3 text-white/80" />
            um Wörter zu downvoten.
          </p>
        </div>
      )}
    </div>
  );
};
