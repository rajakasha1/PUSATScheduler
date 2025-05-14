import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  DAYS, 
  PROGRAM_LIST, 
  SEMESTERS, 
  TIME_SLOTS, 
  type ScheduleWithDetails 
} from "@shared/schema";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

type ClassCardProps = {
  schedule: ScheduleWithDetails;
  index: number;
  onDelete?: (id: number) => void;
  onEdit?: (schedule: ScheduleWithDetails) => void;
};

function getColorForIndex(index: number) {
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
  return colors[index % colors.length];
}

const ClassCard = ({ schedule, index, onDelete, onEdit }: ClassCardProps) => {
  const colorClass = getColorForIndex(index);
  
  console.log("Rendering class card for:", schedule);
  
  return (
    <div 
      className={`class-card ${colorClass} p-2 rounded-md border text-xs cursor-pointer`}
      onClick={() => onEdit && onEdit(schedule)}
    >
      <div className="font-medium">{schedule.course?.name || "Unknown Course"}</div>
      <div className="text-neutral-600">{schedule.teacher?.name || "Unknown Teacher"}</div>
    </div>
  );
};

export function ScheduleView() {
  // Let's deliberately set it to Program 3 (B.Tech in AI) and Semester 2 to see your courses
  const [selectedProgram, setSelectedProgram] = useState<number>(3);
  const [selectedSemester, setSelectedSemester] = useState<number>(2);
  const [debugView, setDebugView] = useState<boolean>(true); // New debug view toggle
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  
  const queryClient = useQueryClient();
  
  // Get schedules based on filters
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["/api/schedules", selectedProgram, selectedSemester],
    queryFn: async () => {
      // Make sure we're explicitly passing program ID and semester as numbers
      const response = await fetch(`/api/schedules?programId=${Number(selectedProgram)}&semester=${Number(selectedSemester)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }
      const data = await response.json();
      console.log("Fetched schedules:", data);
      return data;
    },
    // Ensure the data is always fresh when we change program or semester
    refetchOnWindowFocus: false,
    staleTime: 0
  });
  
  const handleProgramTabClick = (programId: number) => {
    setSelectedProgram(programId);
  };
  
  const handleSemesterClick = (semesterId: number) => {
    setSelectedSemester(semesterId);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  // Function to get schedule for a specific day and time slot
  const getScheduleForSlot = (day: string, timeSlot: number) => {
    console.log(`Looking for schedule on ${day} at time slot ${timeSlot}`);
    const foundSchedule = schedules.find(
      (schedule: ScheduleWithDetails) => 
        schedule.day === day && schedule.timeSlot === timeSlot
    );
    if (foundSchedule) {
      console.log(`Found schedule: `, foundSchedule);
    }
    return foundSchedule;
  };
  
  const scheduleMatrix = DAYS.map(day => {
    return TIME_SLOTS.map(slot => {
      const schedule = getScheduleForSlot(day, slot.id);
      return {
        day,
        timeSlot: slot,
        schedule
      };
    });
  });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-heading font-semibold">Weekly Schedule</h3>
        
        <div className="flex items-center space-x-3">
          <div>
            <Select
              value={programFilter}
              onValueChange={setProgramFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {PROGRAM_LIST.map(program => (
                  <SelectItem key={program.id} value={program.id.toString()}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={semesterFilter}
              onValueChange={setSemesterFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {SEMESTERS.map(semester => (
                  <SelectItem key={semester.id} value={semester.id.toString()}>
                    {semester.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setDebugView(!debugView)}>
            {debugView ? "Show Schedule Matrix" : "Show List View"}
          </Button>
        </div>
      </div>
      
      <div className="border-b border-neutral-300 mb-4">
        <nav className="flex overflow-x-auto">
          {PROGRAM_LIST.map(program => (
            <button
              key={program.id}
              className={cn(
                "px-4 py-2", 
                selectedProgram === program.id 
                  ? "border-b-2 border-primary-500 text-primary-600 font-medium"
                  : "text-neutral-600 hover:text-neutral-800"
              )}
              onClick={() => handleProgramTabClick(program.id)}
            >
              {program.name}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {SEMESTERS.map(semester => (
            <button
              key={semester.id}
              className={cn(
                "px-3 py-1 rounded-full text-sm",
                selectedSemester === semester.id
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              )}
              onClick={() => handleSemesterClick(semester.id)}
            >
              {`${semester.id}${getSuffix(semester.id)} Sem`}
            </button>
          ))}
        </div>
      </div>
      
      {debugView ? (
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <h4 className="font-medium mb-4">Scheduled Classes for {PROGRAM_LIST.find(p => p.id === selectedProgram)?.name} - Semester {selectedSemester}</h4>
          
          {schedules.length === 0 ? (
            <p className="text-neutral-500">No scheduled classes found for this program and semester.</p>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule: ScheduleWithDetails) => (
                <div key={schedule.id} className="p-3 border rounded-md bg-blue-50">
                  <div className="font-medium">{schedule.course.name}</div>
                  <div className="text-sm text-neutral-600">Teacher: {schedule.teacher.name}</div>
                  <div className="text-sm text-neutral-600">Day: {schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1)}</div>
                  <div className="text-sm text-neutral-600">
                    Time: {TIME_SLOTS.find(s => s.id === schedule.timeSlot)?.start} - {TIME_SLOTS.find(s => s.id === schedule.timeSlot)?.end}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-r border-neutral-200 min-w-[100px]">Day / Time</th>
                {TIME_SLOTS.map(slot => (
                  <th 
                    key={slot.id}
                    className="py-3 px-4 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider border-r border-neutral-200 min-w-[130px] last:border-r-0"
                  >
                    {`${slot.start} - ${slot.end}`}
                  </th>
                ))}
                <th className="py-3 px-4 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider border-r border-neutral-200 min-w-[130px] last:border-r-0">
                  9:00 - 9:20
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {/* Day rows */}
              {DAYS.map((day, dayIndex) => (
                <tr key={day}>
                  <td className="py-2 px-4 text-sm font-medium text-neutral-800 border-r border-neutral-200">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </td>
                  
                  {/* Time slots for this day */}
                  {TIME_SLOTS.map((slot, slotIndex) => {
                    const directSchedule = getScheduleForSlot(day, slot.id);
                    
                    return (
                      <td key={`${day}-${slot.id}`} className="p-1 border-r border-neutral-200 last:border-r-0">
                        {directSchedule && (
                          <ClassCard 
                            schedule={directSchedule} 
                            index={(dayIndex * TIME_SLOTS.length) + slotIndex}
                          />
                        )}
                      </td>
                    );
                  })}
                  
                  {/* Break column */}
                  <td className="text-center py-2 text-neutral-500 text-sm italic border-r border-neutral-200 last:border-r-0">
                    Break
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function getSuffix(num: number): string {
  if (num === 1) return "st";
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
}
