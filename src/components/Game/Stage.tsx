"use client";
import { getWordScore } from "./utils";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

const stagesByPercentage = [
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
  maxScore,
}: {
  foundWords: string[];
  maxScore: number;
}) => {
  const [showDetailedScore, setShowDetailedScore] = useState(false);

  const currentScore = foundWords.reduce(
    (acc, word) => acc + getWordScore(word),
    0,
  );
  const currentPercentage = currentScore / maxScore;
  const stagesByScore = stagesByPercentage.map(({ percentage, label }) => ({
    score: Math.floor(maxScore * (Number(percentage) / 100)),
    label,
  }));
  const currentStageIndex = stagesByScore.findLastIndex(({ score }) => {
    if (currentScore >= score) {
      return true;
    }
  });
  const currentStage = stagesByScore[currentStageIndex];

  return (
    <div
      className="w-full rounded-sm bg-white/10 px-2 py-1"
      onClick={() => setShowDetailedScore((prev) => !prev)}
    >
      <div className="flex items-center gap-10">
        <div
          className={cn("flex items-center gap-1 font-semibold", {
            "font-semibold text-yellow-500":
              currentStageIndex >= stagesByScore.length - 2,
          })}
        >
          {currentStageIndex >= stagesByScore.length - 2 && (
            <Star className="h-4 w-4" />
          )}
          {currentStage?.label}
        </div>
        <div className="flex h-px flex-grow items-center justify-between bg-white/20">
          {stagesByScore.slice(1).map((stage, idx) => (
            <div
              key={stage.label}
              className={cn(
                "h-3 w-3 rounded-full",
                currentStageIndex >= idx ? "bg-yellow-500" : "bg-white",
              )}
            />
          ))}
        </div>
        <div className="ml-auto mr-0 font-semibold text-yellow-500">
          {currentScore} ({Math.round(currentPercentage * 100)}%)
        </div>
      </div>
      {showDetailedScore && (
        <div className="my-1 overflow-y-auto rounded-sm bg-white/10 px-2 py-1">
          {stagesByScore
            .toReversed()
            .slice(1)
            .map(({ score, label }, idx) => (
              <div
                key={label}
                className={cn("flex items-center justify-between", {
                  "font-semibold text-yellow-500":
                    stagesByScore.length - currentStageIndex - 2 <= idx,
                })}
              >
                <span>{label}</span>
                <span>{score}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
