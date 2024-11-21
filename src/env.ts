import dotenv from "dotenv";
import { expand } from "dotenv-expand";
import { loadEnvConfig } from "@next/env";

if (process !== undefined) {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);
} else {
  dotenv.config();
  expand(dotenv.config());
}
