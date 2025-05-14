import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Program schema
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertProgramSchema = createInsertSchema(programs);
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programs.$inferSelect;

// Teacher schema
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const insertTeacherSchema = createInsertSchema(teachers);
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;

// Course schema
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const insertCourseSchema = createInsertSchema(courses);
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Class schedule schema
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull(),
  semester: integer("semester").notNull(),
  courseId: integer("course_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  day: text("day").notNull(),
  timeSlot: integer("time_slot").notNull(),
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
});

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

// Extended schedule type with related data
export type ScheduleWithDetails = Schedule & {
  program: Program;
  course: Course;
  teacher: Teacher;
};

// Schedule insert data type with string IDs instead of numbers
export const scheduleFormSchema = z.object({
  programId: z.string(),
  semester: z.string(),
  courseId: z.string(),
  teacherId: z.string(),
  day: z.string(),
  timeSlot: z.string(),
});

export type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

// Action record schema for tracking recent changes
export const actions = pgTable("actions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "add", "remove", "modify"
  description: text("description").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertActionSchema = createInsertSchema(actions).omit({
  id: true,
});

export type InsertAction = z.infer<typeof insertActionSchema>;
export type Action = typeof actions.$inferSelect;

// Time slots definition
export const TIME_SLOTS = [
  { id: 1, start: "6:30", end: "7:20" },
  { id: 2, start: "7:20", end: "8:10" },
  { id: 3, start: "8:10", end: "9:00" },
  { id: 4, start: "9:20", end: "10:10" },
  { id: 5, start: "10:10", end: "11:00" },
  { id: 6, start: "11:00", end: "11:50" },
  { id: 7, start: "11:50", end: "12:40" },
];

// Days definition
export const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "sunday"];

// Programs definition
export const PROGRAM_LIST = [
  { id: 1, name: "BCA" },
  { id: 2, name: "BIT" },
  { id: 3, name: "B.Tech in AI" },
];

// Semesters definition
export const SEMESTERS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `${i + 1}${getSuffix(i + 1)} Semester`,
}));

function getSuffix(num: number): string {
  if (num === 1) return "st";
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
}
