"use server";
import { savedGames } from "../db/schema";
import { db } from "../db/db";
import { serverSessionGuard } from "@/zustand/useServerAuth";
import { getWinningScore } from "@/components/Game/utils";
import { revalidatePath } from "next/cache";
import { getDataFromGameId, getGameIdFromData } from "./utils";

export const publicGetGameByDate = async (date: string) => {
  const gameDate = await db.query.gameDates.findFirst({
    where: (gameDates, { eq }) => eq(gameDates.date, date),
    with: { game: true },
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
export type GameDataResponse = Awaited<ReturnType<typeof publicGetGameByDate>>;
export type GameData = NonNullable<GameDataResponse>;

export const userGetSavedGame = async (gameId: string) => {
  const userId = (await serverSessionGuard()).user.id;
  const savedGame = await db.query.savedGames.findFirst({
    where: (savedGames, { and, eq }) =>
      and(eq(savedGames.gameId, gameId), eq(savedGames.userId, userId)),
  });

  return savedGame ?? null;
};

export const userGetPlayedGames = async () => {
  const userId = (await serverSessionGuard()).user.id;
  const savedGames = await db.query.savedGames.findMany({
    where: (savedGames, { eq }) => eq(savedGames.userId, userId),
  });
  return savedGames.map((game) => getDataFromGameId(game.gameId));
};

export const userUpdateSavedGame = async (
  gameId: string,
  foundWords: string[],
) => {
  const userId = (await serverSessionGuard()).user.id;
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
