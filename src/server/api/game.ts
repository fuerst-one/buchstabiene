"use server";
import { savedGames } from "../db/schema";
import { db } from "../db/db";
import {
  getServerSessionUser,
  serverSessionGuard,
} from "@/zustand/useServerAuth";
import { getWinningScore } from "@/components/Game/utils";
import { revalidatePath } from "next/cache";

export const publicGetGameByDate = async (date: string) => {
  const game = await db.query.games.findFirst({
    where: (games, { eq }) => eq(games.date, date),
  });
  if (!game) {
    return null;
  }
  const { letterSet, possibleWords } = game;
  return {
    date,
    letterSet: letterSet.split(""),
    possibleWords,
    winningScore: getWinningScore(possibleWords),
  };
};
export type GameDataResponse = Awaited<ReturnType<typeof publicGetGameByDate>>;
export type GameData = NonNullable<GameDataResponse>;

export const userGetSavedGame = async (date: string) => {
  const userId = (await getServerSessionUser())?.id;
  if (!userId) {
    return null;
  }
  const savedGame = await db.query.savedGames.findFirst({
    where: (savedGames, { and, eq }) =>
      and(eq(savedGames.date, date), eq(savedGames.userId, userId)),
  });
  return savedGame ?? null;
};
export type SavedGame = NonNullable<ReturnType<typeof userGetSavedGame>>;

export const userGetPlayedGames = async () => {
  const userId = (await getServerSessionUser())?.id;
  if (!userId) {
    return [];
  }
  const savedGames = await db.query.savedGames.findMany({
    where: (savedGames, { eq }) => eq(savedGames.userId, userId),
  });
  return savedGames.map((game) => game.date);
};

export const userUpdateSavedGame = async (
  date: string,
  foundWords: string[],
) => {
  const userId = (await serverSessionGuard()).user.id;
  const updatedAt = new Date();
  const inserted = await db
    .insert(savedGames)
    .values({
      updatedAt,
      userId,
      date,
      foundWords,
    })
    .onConflictDoUpdate({
      target: [savedGames.date, savedGames.userId],
      set: { updatedAt, foundWords },
    })
    .returning();
  revalidatePath(`/spielen/[date]`, "page");
  return inserted.length > 0;
};
