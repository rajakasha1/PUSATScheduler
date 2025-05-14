import { useEffect, useState } from "react";
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

export default function Teachers() {
  const [newTeacherName, setNewTeacherName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["/api/teachers"],
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ["/api/schedules"],
  });

  // Count classes taught by each teacher
  const teacherClassCounts = teachers.reduce((acc: Record<number, number>, teacher: any) => {
    acc[teacher.id] = schedules.filter((s: any) => s.teacherId === teacher.id).length;
    return acc;
  }, {});

  const createTeacherMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/teachers", { name });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Teacher added successfully",
      });
      setNewTeacherName("");
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add teacher",
        variant: "destructive",
      });
    },
  });

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeacherName.trim()) {
      createTeacherMutation.mutate(newTeacherName);
    }
  };

  return (
    <>
      <header className="bg-white shadow p-4">
        <h2 className="text-xl font-heading font-semibold text-neutral-800">
          Teachers
        </h2>
      </header>

      <main className="p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-heading font-semibold">
              Teacher Management
            </h3>
            <form onSubmit={handleAddTeacher} className="flex gap-2">
              <Input
                placeholder="Enter teacher name"
                value={newTeacherName}
                onChange={(e) => setNewTeacherName(e.target.value)}
                className="w-64"
              />
              <Button type="submit" disabled={createTeacherMutation.isPending}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
            </form>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Classes Teaching</TableHead>
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
                ) : teachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No teachers found. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  teachers.map((teacher: any, index: number) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacherClassCounts[teacher.id] || 0}</TableCell>
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
