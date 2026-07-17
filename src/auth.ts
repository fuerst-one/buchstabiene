import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db/db";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/zod/auth";
import { accounts, users } from "@/server/db/schema";
import { checkCredentials } from "@/server/api/checkCredentials";

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
          const user = await checkCredentials(email, password);
          return user;
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
});
