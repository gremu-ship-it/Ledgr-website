import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Lazy database access: the pool is only created when getDb() is first
// called. Pages, builds and deploys never crash merely because
// DATABASE_URL is unset — only actual DB operations throw, and every
// caller already handles that gracefully (friendly 500/503 or fallback).

const globalForDb = globalThis as typeof globalThis & {
  __ledgrPool?: Pool;
  __ledgrDb?: NodePgDatabase;
};

function getPool(): Pool {
  if (!globalForDb.__ledgrPool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required");
    }
    globalForDb.__ledgrPool = new Pool({ connectionString: databaseUrl });
  }
  return globalForDb.__ledgrPool;
}

export function getDb(): NodePgDatabase {
  if (!globalForDb.__ledgrDb) {
    globalForDb.__ledgrDb = drizzle(getPool());
  }
  return globalForDb.__ledgrDb;
}
