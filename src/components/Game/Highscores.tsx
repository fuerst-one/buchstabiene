"use client";
import { cn } from "@/lib/utils";
import { Highscore } from "@/server/api/game";
import { User } from "@/server/db/schema";
import { Lock } from "lucide-react";
import { stagesByPercentage } from "./Stage";

const getStageByScore = (currentScore: number, maxScore: number) => {
  const stagesByScore = stagesByPercentage.map(({ percentage, label }) => ({
    score: Math.floor(maxScore * (Number(percentage) / 100)),
    label,
  }));
  const currentStageIndex = stagesByScore.findLastIndex(({ score }) => {
    if (currentScore >= score) {
      return true;
    }
  });
  return stagesByScore[currentStageIndex];
};

export const Highscores = ({
  user,
  highscores,
  maxScore,
}: {
  user: User | null;
  highscores: Highscore[];
  maxScore: number;
}) => {
  return (
    <div className="w-full rounded-sm bg-white/10 p-2">
      {highscores.length ? (
        <div className="space-y-1">
          {highscores
            .toSorted((a, b) => b.score - a.score)
            .map((highscore) => (
              <div
                key={highscore.username}
                className={cn(
                  "flex items-center justify-between whitespace-nowrap px-1 leading-7 text-white",
                  {
                    "rounded-sm bg-yellow-500/30 font-bold":
                      highscore.username === user?.name,
                  },
                )}
              >
                <span>
                  {highscore.username}{" "}
                  {highscore.isRevealed && (
                    <Lock className="relative -top-0.5 inline h-4 w-4" />
                  )}
                </span>
                <span className="font-semibold">
                  {getStageByScore(highscore.score, maxScore).label} -{" "}
                  {highscore.score} Wörter - {highscore.score} Punkte
                </span>
              </div>
            ))}
        </div>
      ) : (
        <div className="w-full text-center">
          Noch keine Highscores vorhanden
        </div>
      )}
    </div>
  );
};
