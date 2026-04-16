import { pgTable, serial, text, boolean, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  pesel: text("pesel").notNull(),
  birthDate: text("birth_date").notNull(),
  gender: text("gender").notNull(),
  education: text("education").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  voivodeship: text("voivodeship").notNull(),
  employmentStatus: text("employment_status").notNull(),
  employer: text("employer"),
  programType: text("program_type").notNull(),
  courseDescription: text("course_description"),
  fundingAmount: numeric("funding_amount"),
  nip: text("nip"),
  disabilityStatus: boolean("disability_status").default(false),
  consent: boolean("consent").notNull(),
  consentMarketing: boolean("consent_marketing").default(false),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, submittedAt: true, status: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
