import "@/env";
import { migrate } from "drizzle-orm/vercel-postgres/migrator";
import { db } from "@/server/db/db";

const main = async () => {
  console.log("Migrating database...", process.env.POSTGRES_URL);
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Database migrated!");
  process.exit(0);
};

main();
