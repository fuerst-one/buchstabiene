"use server";
import { getTotalScore } from "@/components/Game/utils";
import { db } from "../db/db";

export const publicGetHighscoresByDate = async (date: string) => {
  const savedGames = await db.query.savedGames.findMany({
    where: (savedGames, { eq }) => eq(savedGames.date, date),
    with: {
      user: true,
    },
  });
  const highscores = savedGames.map((savedGame) => ({
    username: savedGame.user.name,
    foundWords: savedGame.foundWords,
    isRevealed: savedGame.solutionsRevealedAt,
    score: getTotalScore(savedGame.foundWords),
  }));

  return highscores;
};

export type Highscore = Awaited<
  ReturnType<typeof publicGetHighscoresByDate>
>[number];
