"use server";
import { db } from "@/server/db/db";
import { serverAdminGuard, serverSessionGuard } from "@/zustand/useServerAuth";
import { wordVotes } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const userGetWordVotes = async () => {
  const userId = (await serverSessionGuard()).user.id;
  return await db.query.wordVotes.findMany({
    where: eq(wordVotes.userId, userId),
  });
};

export const userAddWordVote = async (word: string, vote = -1) => {
  const userId = (await serverSessionGuard()).user.id;
  const inserted = await db
    .insert(wordVotes)
    .values({ userId, word, vote })
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
