import { 
  users, type User, type InsertUser,
  programs, type Program, type InsertProgram,
  teachers, type Teacher, type InsertTeacher,
  courses, type Course, type InsertCourse,
  schedules, type Schedule, type InsertSchedule, type ScheduleWithDetails,
  actions, type Action, type InsertAction,
  PROGRAM_LIST
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private programs: Map<number, Program>;
  private teachers: Map<number, Teacher>;
  private courses: Map<number, Course>;
  private schedules: Map<number, Schedule>;
  private actions: Map<number, Action>;
  
  private userIdCounter: number;
  private programIdCounter: number;
  private teacherIdCounter: number;
  private courseIdCounter: number;
  private scheduleIdCounter: number;
  private actionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.programs = new Map();
    this.teachers = new Map();
    this.courses = new Map();
    this.schedules = new Map();
    this.actions = new Map();
    
    this.userIdCounter = 1;
    this.programIdCounter = 1;
    this.teacherIdCounter = 1;
    this.courseIdCounter = 1;
    this.scheduleIdCounter = 1;
    this.actionIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Program methods
  async getAllPrograms(): Promise<Program[]> {
    return Array.from(this.programs.values());
  }
  
  async getProgram(id: number): Promise<Program | undefined> {
    return this.programs.get(id);
  }
  
  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = this.programIdCounter++;
    const program: Program = { ...insertProgram, id };
    this.programs.set(id, program);
    return program;
  }
  
  // Teacher methods
  async getAllTeachers(): Promise<Teacher[]> {
    return Array.from(this.teachers.values());
  }
  
  async getTeacher(id: number): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }
  
  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const id = this.teacherIdCounter++;
    const teacher: Teacher = { ...insertTeacher, id };
    this.teachers.set(id, teacher);
    return teacher;
  }
  
  async getTeacherCount(): Promise<number> {
    return this.teachers.size;
  }
  
  // Course methods
  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const course: Course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }
  
  async getCourseCount(): Promise<number> {
    return this.courses.size;
  }
  
  // Schedule methods
  async getAllSchedules(): Promise<Schedule[]> {
    return Array.from(this.schedules.values());
  }
  
  async getAllSchedulesWithDetails(): Promise<ScheduleWithDetails[]> {
    return await Promise.all(
      Array.from(this.schedules.values()).map(async (schedule) => {
        const program = await this.getProgram(schedule.programId);
        const course = await this.getCourse(schedule.courseId);
        const teacher = await this.getTeacher(schedule.teacherId);
        
        return {
          ...schedule,
          program: program!,
          course: course!,
          teacher: teacher!,
        };
      })
    );
  }
  
  async getSchedulesByProgram(programId: number): Promise<ScheduleWithDetails[]> {
    const schedules = Array.from(this.schedules.values()).filter(
      (schedule) => schedule.programId === programId
    );
    
    return await Promise.all(
      schedules.map(async (schedule) => {
        const program = await this.getProgram(schedule.programId);
        const course = await this.getCourse(schedule.courseId);
        const teacher = await this.getTeacher(schedule.teacherId);
        
        return {
          ...schedule,
          program: program!,
          course: course!,
          teacher: teacher!,
        };
      })
    );
  }
  
  async getSchedulesByProgramAndSemester(programId: number, semester: number): Promise<ScheduleWithDetails[]> {
    const schedules = Array.from(this.schedules.values()).filter(
      (schedule) => schedule.programId === programId && schedule.semester === semester
    );
    
    return await Promise.all(
      schedules.map(async (schedule) => {
        const program = await this.getProgram(schedule.programId);
        const course = await this.getCourse(schedule.courseId);
        const teacher = await this.getTeacher(schedule.teacherId);
        
        return {
          ...schedule,
          program: program!,
          course: course!,
          teacher: teacher!,
        };
      })
    );
  }
  
  async getScheduleWithDetails(id: number): Promise<ScheduleWithDetails | undefined> {
    const schedule = this.schedules.get(id);
    
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
      teacher,
    };
  }
  
  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = this.scheduleIdCounter++;
    const schedule: Schedule = { ...insertSchedule, id };
    this.schedules.set(id, schedule);
    return schedule;
  }
  
  async updateSchedule(id: number, updateSchedule: InsertSchedule): Promise<Schedule> {
    const existingSchedule = this.schedules.get(id);
    
    if (!existingSchedule) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    
    const updatedSchedule: Schedule = { ...updateSchedule, id };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }
  
  async deleteSchedule(id: number): Promise<void> {
    this.schedules.delete(id);
  }
  
  async checkForTeacherConflict(teacherId: number, day: string, timeSlot: number): Promise<boolean> {
    return Array.from(this.schedules.values()).some(
      (schedule) => 
        schedule.teacherId === teacherId && 
        schedule.day === day && 
        schedule.timeSlot === timeSlot
    );
  }
  
  async checkForTeacherConflictExcluding(
    teacherId: number, 
    day: string, 
    timeSlot: number, 
    excludeId: number
  ): Promise<boolean> {
    return Array.from(this.schedules.values()).some(
      (schedule) => 
        schedule.id !== excludeId &&
        schedule.teacherId === teacherId && 
        schedule.day === day && 
        schedule.timeSlot === timeSlot
    );
  }
  
  async getScheduleCount(): Promise<number> {
    return this.schedules.size;
  }
  
  // Action methods
  async createAction(insertAction: InsertAction): Promise<Action> {
    const id = this.actionIdCounter++;
    const action: Action = { ...insertAction, id };
    this.actions.set(id, action);
    return action;
  }
  
  async getRecentActions(limit: number): Promise<Action[]> {
    return Array.from(this.actions.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  // Initialize with default data
  async initializeDefaultData(): Promise<void> {
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

export const storage = new MemStorage();
