import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // Uses the same DATABASE_URL as the app. Never commit real credentials.
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/ledgr",
  },
});
