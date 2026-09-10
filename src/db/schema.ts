import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

// Captured leads from the "Get Started / Join Waitlist" forms on the site.
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 60 }),
  businessName: varchar("business_name", { length: 200 }),
  businessType: varchar("business_type", { length: 80 }),
  message: text("message"),
  source: varchar("source", { length: 60 }).notNull().default("waitlist"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
