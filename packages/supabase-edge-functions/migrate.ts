import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import process from "process";
import * as dotenv from "dotenv"

dotenv.config()
export default async function migrateDB() {
  if (!process.env.DB_URL) throw new Error("DB_URL not present in the env");
  const DB_URL = process.env.DB_URL;
  const sql = postgres(DB_URL, { max: 1 });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: "supabase/migrations/" });
  await sql.end();
}
migrateDB();