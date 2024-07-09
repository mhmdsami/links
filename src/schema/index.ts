import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql/sql";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const link = sqliteTable("link", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  url: text("url").notNull(),
  clicks: integer("clicks").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
});

export const insertLinkSchema = createInsertSchema(link, {
  url: z.string().url(),
});

export const updateLinkSchema = z.object({
  url: z.string().url(),
});
