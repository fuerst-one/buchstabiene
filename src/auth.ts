import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db/db";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/zod/auth";
import { accounts, users } from "@/server/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
  }),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } =
            await signInSchema.parseAsync(credentials);
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_PROTOCOL}${process.env.NEXT_PUBLIC_URL}/api/login`,
            {
              method: "POST",
              body: JSON.stringify({ email, password }),
            },
          );
          const user = await response.json();
          return user;
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
});
