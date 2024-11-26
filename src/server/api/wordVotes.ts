"use server";
import { db } from "@/server/db/db";
import { useServerAuth } from "@/zustand/useServerAuth";
import { wordVotes } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const adminGetWordVotes = async () => {
  const session = await useServerAuth.getState().getSession();
  if (!session?.user.isAdmin) {
    return [];
  }
  return await db.query.wordVotes.findMany();
};

export const userGetWordVotes = async () => {
  const session = await useServerAuth.getState().getSession();
  if (!session?.user) {
    return [];
  }
  return await db.query.wordVotes.findMany({
    where: eq(wordVotes.userId, session.user.id),
  });
};

export const userAddWordVote = async (word: string) => {
  const session = await useServerAuth.getState().getSession();
  if (!session?.user) {
    return;
  }
  const inserted = await db
    .insert(wordVotes)
    .values({ userId: session.user.id, word, vote: -1 })
    .returning();
  revalidatePath(`/spielen/[date]`, "page");
  return inserted.length > 0;
};

export const userDeleteWordVote = async (word: string) => {
  const session = await useServerAuth.getState().getSession();
  if (!session?.user) {
    return;
  }
  const deleted = await db
    .delete(wordVotes)
    .where(and(eq(wordVotes.userId, session.user.id), eq(wordVotes.word, word)))
    .returning();
  revalidatePath(`/spielen/[date]`, "page");
  return deleted.length > 0;
};

export const adminDeleteWordVotes = async (word: string) => {
  const session = await useServerAuth.getState().getSession();
  if (!session?.user.isAdmin) {
    return;
  }
  const deleted = await db
    .delete(wordVotes)
    .where(eq(wordVotes.word, word))
    .returning();
  revalidatePath(`/admin`, "page");
  revalidatePath(`/spielen/[date]`, "page");
  return deleted.length > 0;
};
