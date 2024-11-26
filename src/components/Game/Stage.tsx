"use client";
import { getTotalScore } from "./utils";
import { cn } from "@/lib/utils";
import { ChevronDown, Star } from "lucide-react";
import { useState } from "react";

export const stagesByPercentage = [
  { percentage: 0, label: "Anfänger" },
  { percentage: 5, label: "Guter Start" },
  { percentage: 10, label: "Nett" },
  { percentage: 15, label: "Solide" },
  { percentage: 20, label: "Gut" },
  { percentage: 40, label: "Stark" },
  { percentage: 70, label: "Unglaublich" },
  { percentage: 100, label: "Genie" },
];

export const Stage = ({
  foundWords,
  winningScore,
  completed,
}: {
  foundWords: string[] | null;
  winningScore: number;
  completed: boolean;
}) => {
  const [showDetailedScore, setShowDetailedScore] = useState(false);

  const currentScore = getTotalScore(foundWords);
  const stagesByScore = stagesByPercentage.map(({ percentage, label }) => ({
    score: Math.floor(winningScore * (Number(percentage) / 100)),
    label,
  }));
  const currentStageIndex = stagesByScore.findLastIndex(
    ({ score }) => currentScore >= score,
  );
  const currentStageLabel = completed
    ? "Bienenkönig:in"
    : stagesByScore[currentStageIndex]?.label;

  return (
    <div
      className="w-full rounded-sm bg-white/10 px-2 py-1"
      onClick={() => setShowDetailedScore((prev) => !prev)}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn("flex w-28 items-center gap-1", {
            "font-semibold text-yellow-500":
              currentStageIndex >= stagesByScore.length - 1,
          })}
        >
          {currentStageLabel}
          {currentStageIndex >= stagesByScore.length - 1 && (
            <Star className="size-4" />
          )}
        </div>
        <div className="mr-2 flex h-px flex-grow items-center justify-between bg-white/20">
          {stagesByScore.map((stage, idx) => (
            <div
              key={stage.label}
              className={cn(
                {
                  "bg-yellow-500": currentStageIndex >= idx,
                  "bg-white": !foundWords || currentStageIndex < idx,
                  "rounded-full": idx < stagesByScore.length - 1,
                },
                currentStageIndex === idx
                  ? "flex size-[1.6rem] items-center justify-center font-semibold text-black"
                  : "size-2.5 md:size-3",
              )}
            >
              {currentStageIndex === idx && (
                <span className="text-xs">{currentScore}</span>
              )}
            </div>
          ))}
        </div>
        <ChevronDown
          className={cn("ml-1 size-4 shrink-0", {
            "rotate-180": showDetailedScore,
          })}
        />
      </div>
      {showDetailedScore && (
        <div className="my-1 overflow-y-auto rounded-sm bg-white/10 px-2 py-1">
          {!!foundWords
            ? stagesByScore.toReversed().map(({ score, label }, idx) => (
                <div key={label}>
                  <div
                    className={cn("flex items-center justify-between", {
                      "text-yellow-500":
                        stagesByScore.length - currentStageIndex - 1 <= idx,
                    })}
                  >
                    <span>{label}</span>
                    <span>{score}</span>
                  </div>
                  {stagesByScore.length - currentStageIndex - 2 === idx && (
                    <p className="my-1 border-b border-white/20 pb-1 pr-0.5 text-right text-xs font-semibold">
                      Punkte bis zur nächsten Stufe:{" "}
                      <span className="text-yellow-500">
                        {score - currentScore}
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
