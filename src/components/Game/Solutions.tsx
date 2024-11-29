"use client";
import { isPangram, getWordScore } from "./utils";
import { capitalize, cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ThumbsDown, TriangleAlert } from "lucide-react";
import { userAddWordVote, userDeleteWordVote } from "@/server/api/wordVotes";
import { SaveState, useSaveState } from "./useSaveState";

export const Solutions = ({
  date,
  isLoggedIn,
  savedGame,
  possibleWords,
  downvotes,
}: {
  date: string;
  isLoggedIn: boolean;
  savedGame: SaveState | null;
  possibleWords: string[];
  downvotes: string[];
}) => {
  const { foundWords, solutionsRevealed, setSolutionsRevealed } = useSaveState({
    date,
    savedGame,
  });

  return (
    <div className="w-full px-2">
      <div className="w-full rounded-sm bg-white/10 px-2 py-1">
        {!solutionsRevealed ? (
          <div className="mb-8 mt-6 text-center">
            <p className="mb-2 font-semibold">
              <TriangleAlert className="inline size-4" /> Achtung: Das Spiel
              wird damit beendet.
            </p>
            <p className="mb-6 text-sm">
              Du kannst weiterhin Wörter suchen, aber deine Punkte werden nicht
              mehr aktualisiert.
            </p>
            <Button onClick={() => setSolutionsRevealed(true)} size="lg">
              Lösungen anzeigen
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="max-w-full overflow-hidden text-clip whitespace-nowrap px-1 text-white">
                {foundWords.toReversed().slice(0, 5).map(capitalize).join(", ")}
              </div>
              <span className="ml-0 mr-auto whitespace-nowrap text-white/50">
                {foundWords.length > 5 ? "..." : ""} ({foundWords.length})
              </span>
            </div>
            <div className="my-1 overflow-y-auto rounded-sm bg-white/10 px-2 pb-3 pt-1">
              <div className="columns-2 space-x-1 space-y-1">
                {possibleWords.toSorted().map((word) => (
                  <div
                    key={word}
                    className={cn(
                      "flex w-1/2 items-center gap-1 whitespace-nowrap px-1 leading-7 text-white",
                      {
                        "font-bold": isPangram(word),
                        "rounded-sm bg-yellow-500/30":
                          foundWords.includes(word),
                      },
                    )}
                  >
                    <span>{capitalize(word)}</span>
                    <span className="text-white/50">
                      ({getWordScore(word)})
                    </span>
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
                              : userAddWordVote(word)
                          }
                        />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
