import { useQuery } from "@tanstack/react-query";
import { BookOpen, Calendar, Users } from "lucide-react";

export function StatsSummary() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-primary-500">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-neutral-500 text-sm">Total Classes</h4>
            <p className="text-2xl font-semibold mt-1">
              {isLoading ? "..." : stats?.scheduleCount || 0}
            </p>
          </div>
          <div className="bg-primary-100 p-2 rounded-full">
            <Calendar className="h-5 w-5 text-primary-500" />
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Across all programs and semesters
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-secondary-500">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-neutral-500 text-sm">Active Teachers</h4>
            <p className="text-2xl font-semibold mt-1">
              {isLoading ? "..." : stats?.teacherCount || 0}
            </p>
          </div>
          <div className="bg-secondary-100 p-2 rounded-full">
            <Users className="h-5 w-5 text-secondary-500" />
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Teaching across multiple programs
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-neutral-500 text-sm">Courses</h4>
            <p className="text-2xl font-semibold mt-1">
              {isLoading ? "..." : stats?.courseCount || 0}
            </p>
          </div>
          <div className="bg-purple-100 p-2 rounded-full">
            <BookOpen className="h-5 w-5 text-purple-500" />
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Active in current semester
        </p>
      </div>
    </div>
  );
}
