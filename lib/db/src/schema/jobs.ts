import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  category: text("category").notNull(),
  states: jsonb("states").notNull().$type<string[]>().default([]),
  ageMin: integer("age_min"),
  ageMax: integer("age_max"),
  ageRelaxation: text("age_relaxation"),
  qualification: text("qualification"),
  applicationStartDate: text("application_start_date"),
  lastDate: text("last_date"),
  examDate: text("exam_date"),
  applyUrl: text("apply_url"),
  notificationPdfUrl: text("notification_pdf_url"),
  sourceName: text("source_name"),
  sourceUrl: text("source_url"),
  isVerified: boolean("is_verified").notNull().default(false),
  description: text("description"),
  salaryRange: text("salary_range"),
  vacancies: integer("vacancies"),
  photoRequirements: text("photo_requirements"),
  signatureRequirements: text("signature_requirements"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
