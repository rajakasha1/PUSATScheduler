import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTeacherSchema, 
  insertCourseSchema, 
  insertScheduleSchema, 
  scheduleFormSchema,
  insertActionSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route("/api");
  
  // Get all programs
  app.get("/api/programs", async (req: Request, res: Response) => {
    const programs = await storage.getAllPrograms();
    res.json(programs);
  });
  
  // Get all teachers
  app.get("/api/teachers", async (req: Request, res: Response) => {
    const teachers = await storage.getAllTeachers();
    res.json(teachers);
  });
  
  // Create a teacher
  app.post("/api/teachers", async (req: Request, res: Response) => {
    try {
      const teacherData = insertTeacherSchema.parse(req.body);
      const teacher = await storage.createTeacher(teacherData);
      res.status(201).json(teacher);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid teacher data", errors: error.format() });
      } else {
        res.status(500).json({ message: "Failed to create teacher" });
      }
    }
  });
  
  // Get all courses
  app.get("/api/courses", async (req: Request, res: Response) => {
    const courses = await storage.getAllCourses();
    res.json(courses);
  });
  
  // Create a course
  app.post("/api/courses", async (req: Request, res: Response) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid course data", errors: error.format() });
      } else {
        res.status(500).json({ message: "Failed to create course" });
      }
    }
  });
  
  // Get all schedules with details
  app.get("/api/schedules", async (req: Request, res: Response) => {
    const { programId, semester } = req.query;
    let schedules;
    
    if (programId && semester) {
      schedules = await storage.getSchedulesByProgramAndSemester(
        Number(programId), 
        Number(semester)
      );
    } else if (programId) {
      schedules = await storage.getSchedulesByProgram(Number(programId));
    } else {
      schedules = await storage.getAllSchedulesWithDetails();
    }
    
    res.json(schedules);
  });
  
  // Create a schedule
  app.post("/api/schedules", async (req: Request, res: Response) => {
    try {
      const formData = scheduleFormSchema.parse(req.body);
      
      // Convert string IDs to numbers
      const scheduleData = {
        programId: Number(formData.programId),
        semester: Number(formData.semester),
        courseId: Number(formData.courseId),
        teacherId: Number(formData.teacherId),
        day: formData.day,
        timeSlot: Number(formData.timeSlot)
      };
      
      // Check for conflicts
      const hasConflict = await storage.checkForTeacherConflict(
        scheduleData.teacherId,
        scheduleData.day,
        scheduleData.timeSlot
      );
      
      if (hasConflict) {
        return res.status(409).json({ 
          message: "Conflict detected! The teacher is already scheduled for this time slot." 
        });
      }
      
      const schedule = await storage.createSchedule(scheduleData);
      
      // Log the action
      const teacher = await storage.getTeacher(scheduleData.teacherId);
      const course = await storage.getCourse(scheduleData.courseId);
      const program = await storage.getProgram(scheduleData.programId);
      
      if (teacher && course && program) {
        await storage.createAction({
          type: "add",
          description: `Added: ${course.name} by ${teacher.name} (${program.name} - ${scheduleData.semester}${getSuffix(scheduleData.semester)})`,
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid schedule data", errors: error.format() });
      } else {
        res.status(500).json({ message: "Failed to create schedule" });
      }
    }
  });
  
  // Delete a schedule
  app.delete("/api/schedules/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Get schedule details before deletion for action logging
      const schedule = await storage.getScheduleWithDetails(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      await storage.deleteSchedule(id);
      
      // Log the action
      if (schedule) {
        await storage.createAction({
          type: "remove",
          description: `Removed: ${schedule.course.name} by ${schedule.teacher.name} (${schedule.program.name} - ${schedule.semester}${getSuffix(schedule.semester)})`,
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(200).json({ message: "Schedule deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete schedule" });
    }
  });
  
  // Update a schedule
  app.put("/api/schedules/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const formData = scheduleFormSchema.parse(req.body);
      
      // Convert string IDs to numbers
      const scheduleData = {
        programId: Number(formData.programId),
        semester: Number(formData.semester),
        courseId: Number(formData.courseId),
        teacherId: Number(formData.teacherId),
        day: formData.day,
        timeSlot: Number(formData.timeSlot)
      };
      
      // Get the old schedule for comparison
      const oldSchedule = await storage.getScheduleWithDetails(id);
      
      if (!oldSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      // Check for conflicts (excluding the current schedule)
      const hasConflict = await storage.checkForTeacherConflictExcluding(
        scheduleData.teacherId,
        scheduleData.day,
        scheduleData.timeSlot,
        id
      );
      
      if (hasConflict) {
        return res.status(409).json({ 
          message: "Conflict detected! The teacher is already scheduled for this time slot." 
        });
      }
      
      const updatedSchedule = await storage.updateSchedule(id, scheduleData);
      
      // Log the action if day or time changed
      if (oldSchedule.day !== scheduleData.day || oldSchedule.timeSlot !== scheduleData.timeSlot) {
        const course = await storage.getCourse(scheduleData.courseId);
        const dayChange = oldSchedule.day !== scheduleData.day 
          ? `from ${capitalizeFirstLetter(oldSchedule.day)} to ${capitalizeFirstLetter(scheduleData.day)}`
          : '';
        
        if (course) {
          await storage.createAction({
            type: "modify",
            description: `Modified: Changed ${course.name} ${dayChange}`,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      res.status(200).json(updatedSchedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid schedule data", errors: error.format() });
      } else {
        res.status(500).json({ message: "Failed to update schedule" });
      }
    }
  });
  
  // Get recent actions
  app.get("/api/actions", async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const actions = await storage.getRecentActions(limit);
    res.json(actions);
  });
  
  // Get stats
  app.get("/api/stats", async (req: Request, res: Response) => {
    const scheduleCount = await storage.getScheduleCount();
    const teacherCount = await storage.getTeacherCount();
    const courseCount = await storage.getCourseCount();
    
    res.json({
      scheduleCount,
      teacherCount,
      courseCount
    });
  });
  
  // Initialize with default data
  app.post("/api/init", async (req: Request, res: Response) => {
    try {
      await storage.initializeDefaultData();
      res.status(200).json({ message: "Default data initialized" });
    } catch (error) {
      res.status(500).json({ message: "Failed to initialize default data" });
    }
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}

function getSuffix(num: number): string {
  if (num === 1) return "st";
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
