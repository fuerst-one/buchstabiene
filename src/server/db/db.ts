import { drizzle } from "drizzle-orm/node-postgres";
import { client } from "@/db";
import { schema } from "./schema";

export const db = drizzle({ client, schema });
