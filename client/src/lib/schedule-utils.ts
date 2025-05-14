import { TIME_SLOTS, DAYS, PROGRAM_LIST, SEMESTERS } from "@shared/schema";

// Get time slot by ID
export function getTimeSlotById(id: number) {
  return TIME_SLOTS.find(slot => slot.id === id);
}

// Get formatted time slot
export function formatTimeSlot(id: number) {
  const slot = getTimeSlotById(id);
  if (!slot) return '';
  return `${slot.start} - ${slot.end}`;
}

// Format day for display
export function formatDay(day: string) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

// Get program name by ID
export function getProgramNameById(id: number) {
  const program = PROGRAM_LIST.find(p => p.id === id);
  return program ? program.name : '';
}

// Get semester name by ID
export function getSemesterById(id: number) {
  const semester = SEMESTERS.find(s => s.id === id);
  return semester ? semester.name : '';
}

// Get suffix for numbers (1st, 2nd, 3rd, 4th, etc.)
export function getSuffix(num: number): string {
  if (num === 1) return "st";
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
}

// Check if a time slot is during the break period
export function isBreakSlot(time: string) {
  return time === "9:00 - 9:20";
}

// Generate a unique key for a schedule slot
export function getScheduleKey(day: string, timeSlot: number) {
  return `${day}-${timeSlot}`;
}

// Get random color for class cards
export function getRandomColor() {
  const colors = [
    "bg-blue-100 border-blue-200",
    "bg-green-100 border-green-200",
    "bg-purple-100 border-purple-200",
    "bg-yellow-100 border-yellow-200",
    "bg-pink-100 border-pink-200",
    "bg-red-100 border-red-200",
    "bg-indigo-100 border-indigo-200",
    "bg-orange-100 border-orange-200",
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

// Check if two schedule times conflict
export function hasTimeConflict(
  day1: string,
  timeSlot1: number,
  day2: string,
  timeSlot2: number
) {
  return day1 === day2 && timeSlot1 === timeSlot2;
}
