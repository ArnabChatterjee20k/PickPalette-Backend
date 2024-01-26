import {drizzle} from "drizzle-orm/postgres-js"
import postgres from "postgres"
import process from "process"

if(!process.env.DB_URL) throw new Error("DB_URL not present in the env")
const DB_URL = process.env.DB_URL
const client = postgres(DB_URL)
const db = drizzle(client)
export default db