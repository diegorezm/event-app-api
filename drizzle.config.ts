import { defineConfig } from "drizzle-kit";
import { DB_URL } from "./src/env";

if (!DB_URL) {
  throw new Error(
    "DB_URL is not defined. Please set the database URL in the environment variables.",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    url: DB_URL,
  },
  verbose: true,
  strict: true,
});
