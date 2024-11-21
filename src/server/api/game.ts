"use server";
import dayjs from "@/dayjs";
import { games, savedGames } from "../db/schema";
import { db } from "../db/db";
import { NoSessionError } from "@/lib/errors";
import { useServerAuth } from "@/zustand/useServerAuth";
import { DateFormat, TimezoneDefault } from "@/lib/DateFormat";
import { count } from "drizzle-orm";

export type GameData = {
  gameId: string;
  letterSet: string[];
  possibleWords: string[];
  maxScore: number;
};

const getGameIdFromData = ({
  letterSet,
  date,
}: {
  letterSet: string;
  date: string;
}) => {
  const timestamp = Math.floor(
    dayjs(date, DateFormat.date).tz(TimezoneDefault).startOf("day").valueOf() /
      1000,
  );
  return Buffer.from(letterSet + timestamp).toString("base64");
};
const getDataFromGameId = (gameId: string) => {
  const decoded = Buffer.from(gameId, "base64").toString("utf-8");
  const letterSet = decoded.slice(0, 7);
  const timestamp = dayjs(Number(decoded.slice(7)) * 1000)
    .tz(TimezoneDefault)
    .format(DateFormat.date);
  return { letterSet, timestamp };
};

export const getGameByDate = async (date: string): Promise<GameData> => {
  const timestamp = Math.floor(
    dayjs(date, DateFormat.date).tz(TimezoneDefault).startOf("day").valueOf() /
      1000,
  );

  const gameCount = await db
    .select({ count: count() })
    .from(games)
    .then(([result]) => result.count);

  const todayIndex = timestamp % gameCount;
  const game = await db.query.games.findFirst({
    where: (games, { eq }) => eq(games.index, todayIndex),
  });

  if (!game) {
    throw new Error("No game found");
  }

  const { letterSet, possibleWords, maxScore } = game;

  return {
    gameId: getGameIdFromData({ letterSet, date }),
    letterSet: letterSet.split(""),
    possibleWords: possibleWords.split(","),
    maxScore,
  };
};

export const updateSavedGame = async (gameId: string, foundWords: string[]) => {
  const session = await useServerAuth.getState().getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new NoSessionError();
  }

  await db
    .insert(savedGames)
    .values({
      gameId,
      userId,
      foundWords,
    })
    .onConflictDoUpdate({
      target: [savedGames.gameId, savedGames.userId],
      set: { foundWords },
    });
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
