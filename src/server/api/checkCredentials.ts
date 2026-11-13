import { db } from "@/server/db/db";
import bcrypt from "bcrypt";
import { InvalidCredentialsError, UserNotFoundError } from "@/lib/errors";

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
