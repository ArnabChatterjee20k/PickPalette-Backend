import {
  pgTable,
  pgSchema,
  uuid,
  timestamp,
  serial,
  varchar,
  integer,
  boolean
} from "drizzle-orm/pg-core";
import { projectModel } from "./project.model";

export const paletteModel = pgTable("palette", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectModel.id,{
        onDelete:"no action",
        onUpdate:"no action"
    }),
  colors: varchar("colors").default("#000000").array(),
  share: boolean("share").default(false)
});
