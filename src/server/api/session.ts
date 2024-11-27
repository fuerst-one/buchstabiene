"use server";
import { auth } from "@/auth";
import { AuthSession } from "@/zustand/useServerAuth";
import { db } from "../db/db";

export const getSessionData = async (): Promise<AuthSession | null> => {
  const session = await auth();
  const username = session?.user?.email;
  if (!username) {
    return null;
  }
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, username),
  });
  if (!user) {
    return null;
  }
  return { user };
};
