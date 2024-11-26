"use server";
import { db } from "@/server/db/db";
import { useServerAuth } from "@/zustand/useServerAuth";
import { downvotes } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const adminGetDownvotes = async () => {
  const session = await useServerAuth.getState().getSession();
  if (!session?.user.isAdmin) {
    return [];
  }
  return await db.query.downvotes.findMany();
};

export const userGetDownvotes = async () => {
  const session = await useServerAuth.getState().getSession();
  if (!session?.user) {
    return [];
  }
  return await db.query.downvotes.findMany({
    where: eq(downvotes.userId, session.user.id),
  });
};

export const userAddDownvote = async (word: string) => {
  const session = await useServerAuth.getState().getSession();
  if (!session?.user) {
    return;
  }
  const inserted = await db
    .insert(downvotes)
    .values({ userId: session.user.id, word })
    .returning();
  revalidatePath(`/spielen/[date]`, "page");
  return inserted.length > 0;
};

export const userDeleteDownvote = async (word: string) => {
  const session = await useServerAuth.getState().getSession();
  if (!session?.user) {
    return;
  }
  const deleted = await db
    .delete(downvotes)
    .where(and(eq(downvotes.userId, session.user.id), eq(downvotes.word, word)))
    .returning();
  revalidatePath(`/spielen/[date]`, "page");
  return deleted.length > 0;
};

export const adminDeleteDownvote = async (word: string) => {
  const session = await useServerAuth.getState().getSession();
  if (!session?.user.isAdmin) {
    return;
  }
  const deleted = await db
    .delete(downvotes)
    .where(eq(downvotes.word, word))
    .returning();
  revalidatePath(`/admin`, "page");
  revalidatePath(`/spielen/[date]`, "page");
  return deleted.length > 0;
};
