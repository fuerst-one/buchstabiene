import "@/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  migrations: {
    table: "migrations",
    schema: "public",
  },
  verbose: true,
  strict: true,
});
