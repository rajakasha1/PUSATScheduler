import { AlertCircle, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { type ScheduleWithDetails } from "@shared/schema";

export function ConflictsView() {
  const [conflicts, setConflicts] = useState<{
    hasConflicts: boolean;
    details: string[];
  }>({
    hasConflicts: false,
    details: [],
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ["/api/schedules"],
  });

  useEffect(() => {
    if (schedules.length > 0) {
      const conflictDetails = detectConflicts(schedules);
      setConflicts(conflictDetails);
    }
  }, [schedules]);

  function detectConflicts(schedules: ScheduleWithDetails[]) {
    const conflicts: string[] = [];
    const teacherScheduleMap = new Map<
      string,
      { day: string; timeSlot: number }[]
    >();

    // Group schedules by teacher
    schedules.forEach((schedule) => {
      const teacherId = schedule.teacherId;
      const timeSlotInfo = { day: schedule.day, timeSlot: schedule.timeSlot };

      if (!teacherScheduleMap.has(teacherId.toString())) {
        teacherScheduleMap.set(teacherId.toString(), [timeSlotInfo]);
      } else {
        teacherScheduleMap.get(teacherId.toString())!.push(timeSlotInfo);
      }
    });

    // Check for conflicts
    teacherScheduleMap.forEach((timeSlots, teacherId) => {
      // Check for duplicate day/time slot combinations
      const seen = new Set<string>();
      timeSlots.forEach((slot) => {
        const key = `${slot.day}-${slot.timeSlot}`;
        if (seen.has(key)) {
          const teacher = schedules.find(
            (s) => s.teacherId.toString() === teacherId
          )?.teacher.name;
          conflicts.push(
            `${teacher} is scheduled for multiple classes at the same time (${key})`
          );
        }
        seen.add(key);
      });
    });

    return {
      hasConflicts: conflicts.length > 0,
      details: conflicts,
    };
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-heading font-semibold mb-2">Conflicts</h3>
      <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
        {conflicts.hasConflicts ? (
          <div className="space-y-2">
            <div className="flex items-center text-error text-sm">
              <AlertCircle className="h-5 w-5 text-error mr-2" />
              <span>Scheduling conflicts detected!</span>
            </div>
            <ul className="text-sm text-neutral-700 space-y-1 ml-7 list-disc">
              {conflicts.details.map((conflict, index) => (
                <li key={index}>{conflict}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex items-center text-neutral-600 text-sm">
            <CheckCircle className="h-5 w-5 text-success mr-2" />
            <span>No scheduling conflicts detected for the current view.</span>
          </div>
        )}
      </div>
    </div>
  );
}
