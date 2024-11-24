"use client";
import { getTotalScore } from "./utils";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

export const stagesByPercentage = [
  { percentage: 0, label: "Anfänger" },
  { percentage: 5, label: "Guter Start" },
  { percentage: 10, label: "Nett" },
  { percentage: 15, label: "Solide" },
  { percentage: 20, label: "Gut" },
  { percentage: 25, label: "Stark" },
  { percentage: 50, label: "Unglaublich" },
  { percentage: 75, label: "Genial" },
  { percentage: 99, label: "Bienenkönig:in" },
];

export const Stage = ({
  foundWords,
  winningScore,
}: {
  foundWords: string[] | null;
  winningScore: number;
}) => {
  const [showDetailedScore, setShowDetailedScore] = useState(false);

  const currentScore = foundWords ? getTotalScore(foundWords) : 0;
  const currentPercentage = currentScore / winningScore;
  const stagesByScore = stagesByPercentage.map(({ percentage, label }) => ({
    score: Math.floor(winningScore * (Number(percentage) / 100)),
    label,
  }));
  const currentStageIndex = stagesByScore.findLastIndex(({ score }) => {
    if (currentScore >= score) {
      return true;
    }
  });
  const currentStageLabel = foundWords
    ? stagesByScore[currentStageIndex]?.label
    : "Lädt...";

  return (
    <div
      className="w-full rounded-sm bg-white/10 px-2 py-1"
      onClick={() => setShowDetailedScore((prev) => !prev)}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn("flex w-24 items-center gap-1", {
            "font-semibold text-yellow-500":
              currentStageIndex >= stagesByScore.length - 2,
          })}
        >
          {currentStageIndex >= stagesByScore.length - 2 && (
            <Star className="size-4" />
          )}
          {currentStageLabel}
        </div>
        <div className="flex h-px flex-grow items-center justify-between bg-white/20">
          {stagesByScore.slice(1).map((stage, idx) => (
            <div
              key={stage.label}
              className={cn("size-2.5 rounded-full md:size-3", {
                "bg-yellow-500": currentStageIndex >= idx,
                "bg-white": !foundWords || currentStageIndex < idx,
              })}
            />
          ))}
        </div>
        <div className="ml-auto mr-0 w-20 whitespace-nowrap text-right text-yellow-500">
          {foundWords
            ? `${currentScore} (${Math.round(currentPercentage * 100)}%)`
            : "..."}
        </div>
      </div>
      {showDetailedScore && (
        <div className="my-1 overflow-y-auto rounded-sm bg-white/10 px-2 py-1">
          {!!foundWords
            ? stagesByScore
                .toReversed()
                .slice(1)
                .map(({ score, label }, idx) => (
                  <div key={label}>
                    <div
                      className={cn("flex items-center justify-between", {
                        "font-semibold text-yellow-500":
                          stagesByScore.length - currentStageIndex - 2 <= idx,
                      })}
                    >
                      <span>{label}</span>
                      <span>{score}</span>
                    </div>
                    {stagesByScore.length - currentStageIndex - 3 === idx && (
                      <p className="border-b border-white/20 pb-1 text-right text-xs">
                        Noch {score - currentScore} Punkte bis zur nächsten
                        Stufe{" "}
                        <span className="text-yellow-500">
                          ({currentScore})
                        </span>
                      </p>
                    )}
                  </div>
                ))
            : "..."}
        </div>
      )}
    </div>
  );
};
