"use server";
import { serverSessionGuard } from "@/zustand/useServerAuth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "../db/db";
import { savedGames } from "../db/schema";

export const userRevealSolutions = async (date: string) => {
  const userId = (await serverSessionGuard()).user.id;
  const updated = await db
    .update(savedGames)
    .set({ solutionsRevealedAt: new Date() })
    .where(and(eq(savedGames.date, date), eq(savedGames.userId, userId)))
    .returning();
  revalidatePath(`/spielen/[date]`, "page");
  return updated.length > 0;
};

export const userDismissAmendments = async (date: string) => {
  const userId = (await serverSessionGuard()).user.id;
  const updated = await db
    .update(savedGames)
    .set({ amendmentsDismissedAt: new Date() })
    .where(and(eq(savedGames.date, date), eq(savedGames.userId, userId)))
    .returning();
  revalidatePath(`/spielen/[date]`, "page");
  return updated.length > 0;
};
