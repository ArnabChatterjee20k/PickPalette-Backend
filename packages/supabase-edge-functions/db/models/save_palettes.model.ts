import { pgTable, timestamp, uuid, serial, varchar } from "drizzle-orm/pg-core";
import { authModel } from "./auth.model";

export const paletteModel = pgTable("saved-palettes", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  palette: varchar("palette").notNull().array(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authModel.id, {
      onDelete: "no action",
      onUpdate: "no action",
    }),
});