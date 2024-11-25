"use client";
import { cn } from "@/lib/utils";
import { Highscore } from "@/server/api/game";
import { User } from "@/server/db/schema";
import { Lock, Trophy } from "lucide-react";
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
  winningScore,
}: {
  user: User | null;
  highscores: Highscore[];
  winningScore: number;
}) => {
  const maxScore = Math.max(...highscores.map((highscore) => highscore.score));

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
                  "flex items-center justify-between whitespace-nowrap rounded-sm px-1 leading-7 text-white",
                  highscore.username === user?.name
                    ? "bg-yellow-500/30"
                    : "odd:bg-white/5",
                )}
              >
                <span>
                  {highscore.username}{" "}
                  {highscore.score === maxScore && (
                    <Trophy className="relative -top-0.5 inline size-4" />
                  )}
                  {highscore.isRevealed && (
                    <Lock className="relative -top-0.5 inline size-4" />
                  )}
                </span>
                <span>
                  {getStageByScore(highscore.score, winningScore).label} -{" "}
                  {highscore.foundWords.length} Wörter - {highscore.score}{" "}
                  Punkte
                </span>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-center">Noch keine Highscores vorhanden</p>
      )}
    </div>
  );
};
