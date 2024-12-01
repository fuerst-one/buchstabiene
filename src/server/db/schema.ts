import {
  pgTable,
  integer,
  text,
  timestamp,
  varchar,
  serial,
  unique,
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

export const games = pgTable("games", {
  date: varchar("date", { length: 10 }).notNull().primaryKey(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  letterSet: varchar("letter_set", { length: 7 }).unique().notNull(),
  possibleWords: json("possible_words")
    .$type<string[]>()
    .notNull()
    .$defaultFn(() => []),
});
export type Game = typeof games.$inferSelect;
export type GameInsert = typeof games.$inferInsert;
export const gameSchema = createSelectSchema(games);

export const savedGames = pgTable(
  "saved_games",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: varchar("date", { length: 10 })
      .notNull()
      .references(() => games.date),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    foundWords: json("found_words")
      .$type<string[]>()
      .notNull()
      .$defaultFn(() => []),
    solutionsRevealed: boolean("solutions_revealed").notNull().default(false),
  },
  (t) => ({
    unq: unique().on(t.userId, t.date),
  }),
);
export type SavedGame = typeof savedGames.$inferSelect;
export type SavedGameInsert = typeof savedGames.$inferInsert;
export const savedGameSchema = createSelectSchema(savedGames);

export const savedGameRelations = relations(savedGames, ({ one }) => ({
  user: one(users, {
    fields: [savedGames.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [savedGames.date],
    references: [games.date],
  }),
}));

export const wordVotes = pgTable(
  "word_votes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    word: varchar("word", { length: 64 }).notNull(),
    vote: integer("vote").notNull().default(0),
  },
  (t) => ({
    unq: unique().on(t.userId, t.word),
  }),
);
export type WordVote = typeof wordVotes.$inferSelect;
export type WordVoteInsert = typeof wordVotes.$inferInsert;
export const wordVoteSchema = createSelectSchema(wordVotes);

export const wordVoteRelations = relations(wordVotes, ({ one }) => ({
  user: one(users, {
    fields: [wordVotes.userId],
    references: [users.id],
  }),
}));

export const dictionaryAmendments = pgTable("dictionary_amendments", {
  id: serial("id").notNull().primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reason: text("reason").notNull(),
  action: text("action").notNull(),
  words: json("words")
    .$type<string[]>()
    .notNull()
    .$defaultFn(() => []),
  isApplied: boolean("is_applied").notNull().default(false),
});
export type DictionaryAmendment = typeof dictionaryAmendments.$inferSelect;
export type DictionaryAmendmentInsert =
  typeof dictionaryAmendments.$inferInsert;
export const dictionaryAmendmentSchema =
  createSelectSchema(dictionaryAmendments);

export const dictionaryAmendmentAffectedGames = pgTable(
  "dictionary_amendment_affected_games",
  {
    amendmentId: integer("amendment_id")
      .notNull()
      .references(() => dictionaryAmendments.id),
    gameDate: varchar("game_date", { length: 10 })
      .notNull()
      .references(() => games.date),
  },
);

export const dictionaryAmendmentAffectedGamesRelations = relations(
  dictionaryAmendmentAffectedGames,
  ({ one }) => ({
    game: one(games, {
      fields: [dictionaryAmendmentAffectedGames.gameDate],
      references: [games.date],
    }),
    dictionaryAmendment: one(dictionaryAmendments, {
      fields: [dictionaryAmendmentAffectedGames.amendmentId],
      references: [dictionaryAmendments.id],
    }),
  }),
);

export const schema = {
  users,
  userRelations,
  accounts,
  games,
  savedGames,
  savedGameRelations,
  wordVotes,
  wordVoteRelations,
  dictionaryAmendments,
  dictionaryAmendmentAffectedGames,
  dictionaryAmendmentAffectedGamesRelations,
};

export const tables = [
  "users",
  "accounts",
  "games",
  "savedGames",
  "wordVotes",
  "dictionaryAmendments",
  "dictionaryAmendmentAffectedGames",
] as const;
