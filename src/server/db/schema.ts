import {
  pgTable,
  integer,
  text,
  timestamp,
  varchar,
  serial,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { primaryKey } from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/pg-core";
import { json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").notNull().primaryKey().$defaultFn(crypto.randomUUID),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  isAdmin: boolean("is_admin").notNull().default(false),
});
export const userSchema = createSelectSchema(users);
export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export const userRelations = relations(users, ({ many }) => ({
  savedGames: many(savedGames),
}));

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);

export const savedGames = pgTable(
  "saved_games",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameId: text("game_id").notNull(),
    foundWords: json("found_words")
      .$type<string[]>()
      .notNull()
      .$defaultFn(() => []),
    solutionsRevealed: boolean("solutions_revealed").notNull().default(false),
  },
  (savedGames) => {
    return {
      pk: primaryKey({ columns: [savedGames.userId, savedGames.gameId] }),
    };
  },
);
export type SavedGame = typeof savedGames.$inferSelect;
export type SavedGameInsert = typeof savedGames.$inferInsert;
export const savedGameSchema = createSelectSchema(savedGames);

export const savedGameRelations = relations(savedGames, ({ one }) => ({
  user: one(users, {
    fields: [savedGames.userId],
    references: [users.id],
  }),
}));

export const games = pgTable("games", {
  index: serial("index").notNull().primaryKey(),
  letterSet: varchar("letter_set", { length: 7 }).unique().notNull(),
  possibleWords: text("possible_words").notNull(),
});
export type Game = typeof games.$inferSelect;
export type GameInsert = typeof games.$inferInsert;
export const gameSchema = createSelectSchema(games);

export const gameDates = pgTable("game_dates", {
  date: varchar("date", { length: 10 }).notNull().primaryKey(),
  gameIndex: integer("game_index")
    .notNull()
    .references(() => games.index),
});
export type GameDate = typeof gameDates.$inferSelect;
export type GameDateInsert = typeof gameDates.$inferInsert;
export const gameDateSchema = createSelectSchema(gameDates);

export const gameDateRelations = relations(gameDates, ({ one }) => ({
  game: one(games, {
    fields: [gameDates.gameIndex],
    references: [games.index],
  }),
}));

export const downvotes = pgTable("downvotes", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  word: varchar("word", { length: 64 }).notNull(),
});

export const schema = {
  users,
  userRelations,
  accounts,
  sessions,
  verificationTokens,
  authenticators,
  savedGames,
  savedGameRelations,
  games,
  gameDates,
  gameDateRelations,
  downvotes,
};

export const tables = [
  "users",
  "accounts",
  "sessions",
  "verificationTokens",
  "authenticators",
  "savedGames",
  "games",
  "gameDates",
  "downvotes",
] as const;
