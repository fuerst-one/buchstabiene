import "@/env";
import { Pool } from "pg";

export const client = new Pool({
  connectionString: process.env.POSTGRES_URL,
});
