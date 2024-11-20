"use client";
import { getWordScore } from "@/app/utils";
import { cn } from "@/lib/utils";
import { useState } from "react";

const stagesByPercentage = [
  { percentage: 0, label: "Anfänger" },
  { percentage: 5, label: "Guter Start" },
  { percentage: 10, label: "Solide" },
  { percentage: 15, label: "Nett" },
  { percentage: 20, label: "Gut" },
  { percentage: 25, label: "Stark" },
  { percentage: 50, label: "Unglaublich" },
  { percentage: 75, label: "Genie" },
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
    0
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
      className="bg-white/10 rounded-sm py-1 px-2 overflow-y-auto"
      onClick={() => setShowDetailedScore((prev) => !prev)}
    >
      <div className="flex items-center gap-10">
        <div className="font-semibold">{currentStage?.label}</div>
        <div className="flex flex-grow items-center justify-between h-px bg-white/20">
          {stagesByScore.map((stage, idx) => (
            <div
              key={stage.label}
              className={cn(
                "h-3 w-3 rounded-full",
                currentStageIndex >= idx ? "bg-yellow-500" : "bg-white"
              )}
            />
          ))}
        </div>
        <div className="mr-0 ml-auto text-yellow-500 font-semibold">
          {currentScore} ({Math.round(currentPercentage * 100)}%)
        </div>
      </div>
      {showDetailedScore && (
        <div className="bg-white/10 rounded-sm py-1 px-2 overflow-y-auto my-1">
          {stagesByScore.toReversed().map(({ score, label }) => (
            <div key={label} className="flex justify-between items-center">
              <span>{label}</span>
              <span>{score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
