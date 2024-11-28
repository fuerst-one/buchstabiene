"use server";
import { getTotalScore } from "@/components/Game/utils";
import { db } from "../db/db";
import { publicGetGameByDate } from "./game";

export const publicGetHighscoresByDate = async (date: string) => {
  const game = await publicGetGameByDate(date);
  if (!game) {
    return [];
  }
  const savedGames = await db.query.savedGames.findMany({
    where: (savedGames, { eq }) => eq(savedGames.date, game.date),
    with: {
      user: true,
    },
  });
  const highscores = savedGames.map((savedGame) => ({
    username: savedGame.user.name,
    foundWords: savedGame.foundWords,
    isRevealed: savedGame.solutionsRevealed,
    score: getTotalScore(savedGame.foundWords),
  }));

  return highscores;
};

export type Highscore = Awaited<
  ReturnType<typeof publicGetHighscoresByDate>
>[number];
