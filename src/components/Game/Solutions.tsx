"use client";
import { getSavedGame, revealSolutionsForUser } from "@/server/api/game";
import { isPangram, getWordScore } from "./utils";
import { capitalize, cn } from "@/lib/utils";
import { User } from "@/server/db/schema";
import { useEffect } from "react";
import { useState } from "react";
import { SAVE_STATE_LOCAL_STORAGE_KEY } from "./Game";
import { SaveState } from "./Game";
import { Button } from "../ui/button";
import { TriangleAlert } from "lucide-react";

export const Solutions = ({
  user,
  gameId,
  possibleWords,
}: {
  user: User | null;
  gameId: string;
  possibleWords: string[];
}) => {
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [showSolutions, setShowSolutions] = useState(false);

  useEffect(() => {
    const getSavedState = async () => {
      let savedState: SaveState | null = null;
      if (user) {
        savedState = await getSavedGame(gameId);
      } else {
        const savedStateContent = localStorage.getItem(
          SAVE_STATE_LOCAL_STORAGE_KEY,
        );
        if (!savedStateContent) {
          return;
        }
        savedState = JSON.parse(savedStateContent) as SaveState;
      }
      if (savedState?.gameId !== gameId) {
        return;
      }
      setShowSolutions(savedState.solutionsRevealed);
      setFoundWords(savedState.foundWords);
    };
    getSavedState();
  }, [gameId, user]);

  const revealSolutions = async () => {
    if (user) {
      await revealSolutionsForUser(gameId);
    } else {
      localStorage.setItem(
        SAVE_STATE_LOCAL_STORAGE_KEY,
        JSON.stringify({
          gameId,
          foundWords,
          solutionsRevealed: true,
        }),
      );
    }
    setShowSolutions(true);
  };

  return (
    <div className="w-full rounded-sm bg-white/10 px-2 py-1">
      {!showSolutions ? (
        <div className="mb-8 mt-6 text-center">
          <p className="mb-2 font-semibold">
            <TriangleAlert className="inline size-4" /> Achtung: Das Spiel wird
            damit beendet.
          </p>
          <p className="mb-6 text-sm">
            Du kannst weiterhin Wörter suchen, aber deine Punkte werden nicht
            mehr aktualisiert.
          </p>
          <Button onClick={revealSolutions} size="lg">
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
                  className={cn("whitespace-nowrap px-1 leading-7 text-white", {
                    "font-bold": isPangram(word),
                    "rounded-sm bg-yellow-500/30": foundWords.includes(word),
                  })}
                >
                  {capitalize(word)}{" "}
                  <span className="text-white/50">({getWordScore(word)})</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
