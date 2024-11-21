"use server";
import { signOut } from "@/auth";
import { db } from "@/server/db/db";
import { users } from "@/server/db/schema";
import bcrypt from "bcrypt";
import { InvalidCredentialsError, UserNotFoundError } from "@/lib/errors";
import { SignupFormValues } from "@/zod/auth";
import { redirect } from "next/navigation";
import { useServerAuth } from "@/zustand/useServerAuth";

export const checkCredentials = async (email: string, password: string) => {
  const users = await db.query.users.findMany({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (users.length === 0) {
    throw new UserNotFoundError();
  }

  const user = users[0];
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new InvalidCredentialsError();
  }

  return user;
};

export const signUp = async ({
  email,
  username,
  password,
  passwordRepeat,
}: SignupFormValues) => {
  if (password !== passwordRepeat) {
    throw new Error("Passwords do not match.");
  }

  // Check if the user already exists
  const existingEmails = await db.query.users.findMany({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (existingEmails.length > 0) {
    throw new Error("E-Mail already exists.");
  }

  const existingNames = await db.query.users.findMany({
    where: (users, { eq }) => eq(users.name, username),
  });

  if (existingNames.length > 0) {
    throw new Error("Username already exists.");
  }

  // Hash the password using a secure hashing algorithm
  const hashedPassword = await hashPassword(password);

  await db.insert(users).values({
    email,
    name: username,
    password: hashedPassword,
  });

  redirect("/login");
};

export const logOut = async () => {
  await useServerAuth.getState().endSession();
  return await signOut({ redirect: true, redirectTo: "/login" });
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};
