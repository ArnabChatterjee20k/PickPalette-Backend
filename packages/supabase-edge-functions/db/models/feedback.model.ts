import {
  pgTable,
  timestamp,
  uuid,
  numeric,
  text,
  serial,
} from "drizzle-orm/pg-core";
import { authModel } from "./auth.model";

export const paletteModel = pgTable("feedback", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  feedback:text("feedback").notNull(),
  sentimentScore:numeric("sentiment_score").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authModel.id, {
      onDelete: "no action",
      onUpdate: "no action",
    }),
});
