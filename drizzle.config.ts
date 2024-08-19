import { defineConfig } from "drizzle-kit";
import { DB_URL } from "./src/env";

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
