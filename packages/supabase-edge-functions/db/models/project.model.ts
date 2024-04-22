import {
  pgTable,
  uuid,
  timestamp,
  serial,
  text,
  varchar,
  boolean
} from "drizzle-orm/pg-core";
import { authModel } from "./auth.model";

export const projectModel = pgTable("project", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authModel.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  share: boolean("share").default(false)
});
