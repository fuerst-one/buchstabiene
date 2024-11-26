"use server";
import { savedGames } from "../db/schema";
import { db } from "../db/db";
import { NoSessionError } from "@/lib/errors";
import { useServerAuth } from "@/zustand/useServerAuth";
import { gameDateDate, gameDateString } from "@/lib/DateFormat";
import { and, eq } from "drizzle-orm";
import { getTotalScore, getWinningScore } from "@/components/Game/utils";
import { Dayjs } from "dayjs";
import { revalidatePath } from "next/cache";

const getGameTimestamp = (date: Dayjs) => {
  return Math.floor(gameDateDate(date).startOf("day").valueOf() / 1000);
};
const getGameTimestampFromDate = (date: string) => {
  return getGameTimestamp(gameDateDate(date));
};

const getGameIdFromData = ({
  letterSet,
  date,
}: {
  letterSet: string;
  date: string;
}) => {
  const timestamp = getGameTimestampFromDate(date);
  return Buffer.from(letterSet + timestamp).toString("base64");
};
const getDataFromGameId = (gameId: string) => {
  const decoded = Buffer.from(gameId, "base64").toString("utf-8");
  const letterSet = decoded.slice(0, 7);
  const timestamp = gameDateString(Number(decoded.slice(7)) * 1000);
  return { letterSet, timestamp };
};

export const getGameByDate = async (date: string) => {
  const gameDate = await db.query.gameDates.findFirst({
    where: (gameDates, { eq }) => eq(gameDates.date, date),
    with: {
      game: true,
    },
  });

  if (!gameDate) {
    return null;
  }

  const { letterSet, possibleWords } = gameDate.game;

  return {
    date,
    index: gameDate.gameIndex,
    gameId: getGameIdFromData({ letterSet, date }),
    letterSet: letterSet.split(""),
    possibleWords: possibleWords.split(","),
    winningScore: getWinningScore(possibleWords.split(",")),
  };
};
export type GameDataResponse = Awaited<ReturnType<typeof getGameByDate>>;
export type GameData = NonNullable<GameDataResponse>;

export const updateSavedGame = async (gameId: string, foundWords: string[]) => {
  const session = await useServerAuth.getState().getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new NoSessionError();
  }

  const inserted = await db
    .insert(savedGames)
    .values({
      gameId,
      userId,
      foundWords,
    })
    .onConflictDoUpdate({
      target: [savedGames.gameId, savedGames.userId],
      set: { foundWords },
    })
    .returning();
  revalidatePath(`/spielen/[date]`, "page");
  return inserted.length > 0;
};

export const revealSolutionsForUser = async (gameId: string) => {
  const session = await useServerAuth.getState().getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new NoSessionError();
  }

  const updated = await db
    .update(savedGames)
    .set({ solutionsRevealed: true })
    .where(and(eq(savedGames.gameId, gameId), eq(savedGames.userId, userId)))
    .returning();
  revalidatePath(`/spielen/[date]`, "page");
  return updated.length > 0;
};

export const getSavedGame = async (gameId: string) => {
  const session = await useServerAuth.getState().getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new NoSessionError();
  }

  const savedGame = await db.query.savedGames.findFirst({
    where: (savedGames, { and, eq }) =>
      and(eq(savedGames.gameId, gameId), eq(savedGames.userId, userId)),
  });

  return savedGame ?? null;
};

export const getPlayedGames = async () => {
  const session = await useServerAuth.getState().getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return [];
  }

  const savedGames = await db.query.savedGames.findMany({
    where: (savedGames, { eq }) => eq(savedGames.userId, userId),
  });

  return savedGames.map((game) => getDataFromGameId(game.gameId));
};

export const getHighscoresByDate = async (date: string) => {
  const game = await getGameByDate(date);

  if (!game) {
    return [];
  }

  const savedGames = await db.query.savedGames.findMany({
    where: (savedGames, { eq }) => eq(savedGames.gameId, game.gameId),
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

export type Highscore = Awaited<ReturnType<typeof getHighscoresByDate>>[number];
