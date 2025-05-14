import { 
  users, type User, type InsertUser,
  programs, type Program, type InsertProgram,
  teachers, type Teacher, type InsertTeacher,
  courses, type Course, type InsertCourse,
  schedules, type Schedule, type InsertSchedule, type ScheduleWithDetails,
  actions, type Action, type InsertAction,
  PROGRAM_LIST
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Program methods
  getAllPrograms(): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  
  // Teacher methods
  getAllTeachers(): Promise<Teacher[]>;
  getTeacher(id: number): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  getTeacherCount(): Promise<number>;
  
  // Course methods
  getAllCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  getCourseCount(): Promise<number>;
  
  // Schedule methods
  getAllSchedules(): Promise<Schedule[]>;
  getAllSchedulesWithDetails(): Promise<ScheduleWithDetails[]>;
  getSchedulesByProgram(programId: number): Promise<ScheduleWithDetails[]>;
  getSchedulesByProgramAndSemester(programId: number, semester: number): Promise<ScheduleWithDetails[]>;
  getScheduleWithDetails(id: number): Promise<ScheduleWithDetails | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: InsertSchedule): Promise<Schedule>;
  deleteSchedule(id: number): Promise<void>;
  checkForTeacherConflict(teacherId: number, day: string, timeSlot: number): Promise<boolean>;
  checkForTeacherConflictExcluding(teacherId: number, day: string, timeSlot: number, excludeId: number): Promise<boolean>;
  getScheduleCount(): Promise<number>;
  
  // Action methods
  createAction(action: InsertAction): Promise<Action>;
  getRecentActions(limit: number): Promise<Action[]>;
  
  // Init method
  initializeDefaultData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Program methods
  async getAllPrograms(): Promise<Program[]> {
    return await db.select().from(programs);
  }
  
  async getProgram(id: number): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program || undefined;
  }
  
  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const [program] = await db.insert(programs).values(insertProgram).returning();
    return program;
  }
  
  // Teacher methods
  async getAllTeachers(): Promise<Teacher[]> {
    return await db.select().from(teachers);
  }
  
  async getTeacher(id: number): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher || undefined;
  }
  
  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const [teacher] = await db.insert(teachers).values(insertTeacher).returning();
    return teacher;
  }
  
  async getTeacherCount(): Promise<number> {
    const results = await db.select().from(teachers);
    return results.length;
  }
  
  // Course methods
  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }
  
  async getCourseCount(): Promise<number> {
    const results = await db.select().from(courses);
    return results.length;
  }
  
  // Schedule methods
  async getAllSchedules(): Promise<Schedule[]> {
    return await db.select().from(schedules);
  }
  
  async getAllSchedulesWithDetails(): Promise<ScheduleWithDetails[]> {
    const allSchedules = await db.select().from(schedules);
    const result: ScheduleWithDetails[] = [];
    
    for (const schedule of allSchedules) {
      const program = await this.getProgram(schedule.programId);
      const course = await this.getCourse(schedule.courseId);
      const teacher = await this.getTeacher(schedule.teacherId);
      
      if (program && course && teacher) {
        result.push({
          ...schedule,
          program,
          course,
          teacher
        });
      }
    }
    
    return result;
  }
  
  async getSchedulesByProgram(programId: number): Promise<ScheduleWithDetails[]> {
    const filteredSchedules = await db.select()
      .from(schedules)
      .where(eq(schedules.programId, programId));
    
    const result: ScheduleWithDetails[] = [];
    
    for (const schedule of filteredSchedules) {
      const program = await this.getProgram(schedule.programId);
      const course = await this.getCourse(schedule.courseId);
      const teacher = await this.getTeacher(schedule.teacherId);
      
      if (program && course && teacher) {
        result.push({
          ...schedule,
          program,
          course,
          teacher
        });
      }
    }
    
    return result;
  }
  
  async getSchedulesByProgramAndSemester(programId: number, semester: number): Promise<ScheduleWithDetails[]> {
    const filteredSchedules = await db.select()
      .from(schedules)
      .where(
        and(
          eq(schedules.programId, programId),
          eq(schedules.semester, semester)
        )
      );
    
    const result: ScheduleWithDetails[] = [];
    
    for (const schedule of filteredSchedules) {
      const program = await this.getProgram(schedule.programId);
      const course = await this.getCourse(schedule.courseId);
      const teacher = await this.getTeacher(schedule.teacherId);
      
      if (program && course && teacher) {
        result.push({
          ...schedule,
          program,
          course,
          teacher
        });
      }
    }
    
    return result;
  }
  
  async getScheduleWithDetails(id: number): Promise<ScheduleWithDetails | undefined> {
    const [schedule] = await db.select()
      .from(schedules)
      .where(eq(schedules.id, id));
    
    if (!schedule) {
      return undefined;
    }
    
    const program = await this.getProgram(schedule.programId);
    const course = await this.getCourse(schedule.courseId);
    const teacher = await this.getTeacher(schedule.teacherId);
    
    if (!program || !course || !teacher) {
      return undefined;
    }
    
    return {
      ...schedule,
      program,
      course,
      teacher
    };
  }
  
  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const [schedule] = await db.insert(schedules)
      .values(insertSchedule)
      .returning();
    return schedule;
  }
  
  async updateSchedule(id: number, updateSchedule: InsertSchedule): Promise<Schedule> {
    const [updatedSchedule] = await db.update(schedules)
      .set(updateSchedule)
      .where(eq(schedules.id, id))
      .returning();
    
    if (!updatedSchedule) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    
    return updatedSchedule;
  }
  
  async deleteSchedule(id: number): Promise<void> {
    await db.delete(schedules).where(eq(schedules.id, id));
  }
  
  async checkForTeacherConflict(teacherId: number, day: string, timeSlot: number): Promise<boolean> {
    const conflicts = await db.select()
      .from(schedules)
      .where(
        and(
          eq(schedules.teacherId, teacherId),
          eq(schedules.day, day),
          eq(schedules.timeSlot, timeSlot)
        )
      );
    
    return conflicts.length > 0;
  }
  
  async checkForTeacherConflictExcluding(
    teacherId: number, 
    day: string, 
    timeSlot: number, 
    excludeId: number
  ): Promise<boolean> {
    const conflicts = await db.select()
      .from(schedules)
      .where(
        and(
          eq(schedules.teacherId, teacherId),
          eq(schedules.day, day),
          eq(schedules.timeSlot, timeSlot)
        )
      );
    
    return conflicts.some(schedule => schedule.id !== excludeId);
  }
  
  async getScheduleCount(): Promise<number> {
    const results = await db.select().from(schedules);
    return results.length;
  }
  
  // Action methods
  async createAction(insertAction: InsertAction): Promise<Action> {
    const [action] = await db.insert(actions)
      .values(insertAction)
      .returning();
    return action;
  }
  
  async getRecentActions(limit: number): Promise<Action[]> {
    return await db.select()
      .from(actions)
      .orderBy(desc(actions.timestamp))
      .limit(limit);
  }
  
  // Initialize with default data
  async initializeDefaultData(): Promise<void> {
    // Check if we already have data
    const existingPrograms = await db.select().from(programs);
    if (existingPrograms.length > 0) {
      return; // Data already exists, no need to initialize
    }

    // Add default programs
    for (const program of PROGRAM_LIST) {
      await this.createProgram({ name: program.name });
    }
    
    // Add default teachers
    const defaultTeachers = [
      { name: "Dr. Smith" },
      { name: "Dr. Johnson" },
      { name: "Prof. Williams" },
      { name: "Dr. Martinez" },
      { name: "Dr. Wilson" },
      { name: "Prof. Davis" },
    ];
    
    for (const teacher of defaultTeachers) {
      await this.createTeacher(teacher);
    }
    
    // Add default courses
    const defaultCourses = [
      { name: "Programming Basics" },
      { name: "Discrete Mathematics" },
      { name: "Digital Logic" },
      { name: "English" },
      { name: "Computer Networks" },
      { name: "Statistics" },
      { name: "Programming Lab" },
      { name: "Digital Logic Lab" },
    ];
    
    for (const course of defaultCourses) {
      await this.createCourse(course);
    }
    
    // Add some default schedules for demo
    const defaultSchedules = [
      { programId: 1, semester: 1, courseId: 1, teacherId: 1, day: "monday", timeSlot: 1 },
      { programId: 1, semester: 1, courseId: 2, teacherId: 2, day: "tuesday", timeSlot: 1 },
      { programId: 1, semester: 1, courseId: 3, teacherId: 3, day: "thursday", timeSlot: 1 },
      { programId: 1, semester: 1, courseId: 4, teacherId: 4, day: "tuesday", timeSlot: 2 },
      { programId: 1, semester: 1, courseId: 1, teacherId: 1, day: "wednesday", timeSlot: 2 },
      { programId: 1, semester: 1, courseId: 3, teacherId: 3, day: "friday", timeSlot: 2 },
      { programId: 1, semester: 1, courseId: 2, teacherId: 2, day: "monday", timeSlot: 3 },
      { programId: 1, semester: 1, courseId: 4, teacherId: 4, day: "thursday", timeSlot: 3 },
      { programId: 1, semester: 1, courseId: 1, teacherId: 1, day: "sunday", timeSlot: 3 },
      { programId: 1, semester: 1, courseId: 5, teacherId: 6, day: "tuesday", timeSlot: 4 },
      { programId: 1, semester: 1, courseId: 2, teacherId: 2, day: "wednesday", timeSlot: 4 },
      { programId: 1, semester: 1, courseId: 6, teacherId: 5, day: "friday", timeSlot: 4 },
      { programId: 1, semester: 1, courseId: 6, teacherId: 5, day: "monday", timeSlot: 5 },
      { programId: 1, semester: 1, courseId: 5, teacherId: 6, day: "wednesday", timeSlot: 5 },
      { programId: 1, semester: 1, courseId: 8, teacherId: 3, day: "sunday", timeSlot: 5 },
      { programId: 1, semester: 1, courseId: 5, teacherId: 6, day: "thursday", timeSlot: 6 },
      { programId: 1, semester: 1, courseId: 6, teacherId: 5, day: "friday", timeSlot: 6 },
    ];
    
    for (const schedule of defaultSchedules) {
      await this.createSchedule(schedule);
    }
    
    // Add some default actions
    const defaultActions = [
      { 
        type: "add", 
        description: "Added: Database Management by Dr. Smith (BCA - 3rd)", 
        timestamp: new Date().toISOString() 
      },
      { 
        type: "remove", 
        description: "Removed: AI Principles by Dr. Johnson (B.Tech - 5th)", 
        timestamp: new Date(Date.now() - 5 * 60000).toISOString() 
      },
      { 
        type: "modify", 
        description: "Modified: Changed Web Tech from Tue to Wed", 
        timestamp: new Date(Date.now() - 10 * 60000).toISOString() 
      },
    ];
    
    for (const action of defaultActions) {
      await this.createAction(action);
    }
  }
}

export const storage = new DatabaseStorage();
