"use server";
import { db } from "@/server/db/db";
import {
  getServerSessionUser,
  serverAdminGuard,
  serverSessionGuard,
} from "@/zustand/useServerAuth";
import { wordVotes } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const userGetWordVotes = async () => {
  const userId = (await getServerSessionUser())?.id;
  if (!userId) {
    return [];
  }
  return await db.query.wordVotes.findMany({
    where: eq(wordVotes.userId, userId),
  });
};

export const userAddWordVotes = async (words: string[], vote = -1) => {
  const userId = (await serverSessionGuard()).user.id;
  const inserted = await db
    .insert(wordVotes)
    .values(words.map((word) => ({ userId, word, vote })))
    .onConflictDoUpdate({
      target: [wordVotes.userId, wordVotes.word],
      set: { vote },
    })
    .returning();
  revalidatePath(`/spielen/[date]`, "page");
  return inserted.length > 0;
};

export const userDeleteWordVote = async (word: string) => {
  const userId = (await serverSessionGuard()).user.id;
  const deleted = await db
    .delete(wordVotes)
    .where(and(eq(wordVotes.userId, userId), eq(wordVotes.word, word)))
    .returning();
  revalidatePath(`/spielen/[date]`, "page");
  return deleted.length > 0;
};

export const adminGetWordVotes = async () => {
  await serverAdminGuard();
  return await db.query.wordVotes.findMany({
    with: { user: { columns: { name: true } } },
  });
};
export type WordVote = Awaited<ReturnType<typeof adminGetWordVotes>>[number];
