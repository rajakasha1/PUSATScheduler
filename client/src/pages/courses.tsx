import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash } from "lucide-react";

export default function Courses() {
  const [newCourseName, setNewCourseName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ["/api/schedules"],
  });

  // Count classes for each course
  const courseClassCounts = courses.reduce((acc: Record<number, number>, course: any) => {
    acc[course.id] = schedules.filter((s: any) => s.courseId === course.id).length;
    return acc;
  }, {});

  const createCourseMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/courses", { name });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course added successfully",
      });
      setNewCourseName("");
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add course",
        variant: "destructive",
      });
    },
  });

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCourseName.trim()) {
      createCourseMutation.mutate(newCourseName);
    }
  };

  return (
    <>
      <header className="bg-white shadow p-4">
        <h2 className="text-xl font-heading font-semibold text-neutral-800">
          Courses
        </h2>
      </header>

      <main className="p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-heading font-semibold">
              Course Management
            </h3>
            <form onSubmit={handleAddCourse} className="flex gap-2">
              <Input
                placeholder="Enter course name"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="w-64"
              />
              <Button type="submit" disabled={createCourseMutation.isPending}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </form>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Scheduled Classes</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No courses found. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course: any, index: number) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{courseClassCounts[course.id] || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </>
  );
}
