import {
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authModel } from "./auth.model";

export const paletteModel = pgTable(
  "saved-palettes",
  {
    createdAt: timestamp("created_at").defaultNow(),
    palette: varchar("palette").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authModel.id, {
        onDelete: "no action",
        onUpdate: "no action",
      }),
  },
  (table) => {
    return {
      pk: primaryKey({ name: "id", columns: [table.palette, table.userId] }),
    };
  }
);
