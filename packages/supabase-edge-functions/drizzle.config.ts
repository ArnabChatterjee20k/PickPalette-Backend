import type { Config } from "drizzle-kit";
import "dotenv/config";
if (!process.env.DB_URL) {
  throw new Error("DB_URL is missing");
}

export default {
  schema: "./db/models/*",
  out: "./supabase/migrations",
  dbCredentials:{
    connectionString: process.env.DB_URL
  }
} satisfies Config;