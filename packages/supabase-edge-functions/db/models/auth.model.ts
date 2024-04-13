import { pgSchema, uuid } from "drizzle-orm/pg-core";
export const authSchmea = pgSchema("auth");
export const authModel = authSchmea.table("users", {
  id: uuid("id").primaryKey().notNull(),
});
