import { useState, useMemo } from "react";
import { StatCard } from "@/components/StatCard";
import { SearchFilter } from "@/components/SearchFilter";
import { AddTeacherModal } from "@/components/AddTeacherModal";
import { StarRating } from "@/components/StarRating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, MessageSquare, Star, Trash2, Plus, GraduationCap } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  department: string;
  subject: string;
  averageRating: number;
  totalFeedback: number;
}

// todo: remove mock functionality - replace with API data
const INITIAL_TEACHERS: Teacher[] = [
  { id: "1", name: "Shweta Kaushik", department: "Computer Science", subject: "Web Technology", averageRating: 4.5, totalFeedback: 42 },
  { id: "2", name: "Tripti Pandey", department: "Computer Science", subject: "Machine Learning Techniques", averageRating: 4.7, totalFeedback: 38 },
  { id: "3", name: "Ayush Aggarwal", department: "Computer Science", subject: "DBMS", averageRating: 4.3, totalFeedback: 35 },
  { id: "4", name: "Shaili Gupta", department: "Computer Science", subject: "OOSD", averageRating: 4.6, totalFeedback: 29 },
  { id: "5", name: "Shalini Singh", department: "Computer Science", subject: "DAA", averageRating: 4.4, totalFeedback: 33 },
  { id: "6", name: "Bharat Bhardwaj", department: "Computer Science", subject: "COA", averageRating: 4.2, totalFeedback: 27 },
  { id: "7", name: "Sanjeev Soni", department: "Computer Science", subject: "FSD", averageRating: 4.8, totalFeedback: 45 },
  { id: "8", name: "Pratik Singh", department: "Computer Science", subject: "DSA", averageRating: 4.5, totalFeedback: 40 },
  { id: "9", name: "Meenakshi Vishnoi", department: "Computer Science", subject: "OOPs with Java", averageRating: 4.4, totalFeedback: 31 },
];

export default function AdminPanel() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const departments = useMemo(() => 
    Array.from(new Set(teachers.map((t) => t.department))),
    [teachers]
  );

  const filteredTeachers = useMemo(() => {
    let result = [...teachers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.subject.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (selectedDepartment && selectedDepartment !== "all") {
      result = result.filter((t) => t.department === selectedDepartment);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "rating-high":
          return b.averageRating - a.averageRating;
        case "rating-low":
          return a.averageRating - b.averageRating;
        case "feedback-most":
          return b.totalFeedback - a.totalFeedback;
        default:
          return 0;
      }
    });

    return result;
  }, [teachers, searchQuery, sortBy, selectedDepartment]);

  const totalFeedback = teachers.reduce((sum, t) => sum + t.totalFeedback, 0);
  const averageRating = teachers.reduce((sum, t) => sum + t.averageRating, 0) / teachers.length;

  const handleAddTeacher = (data: { name: string; department: string; subject: string }) => {
    const newTeacher: Teacher = {
      id: `teacher-${Date.now()}`,
      name: data.name,
      department: data.department,
      subject: data.subject,
      averageRating: 0,
      totalFeedback: 0,
    };
    setTeachers((prev) => [...prev, newTeacher]);
    toast({
      title: "Teacher added",
      description: `${data.name} has been added successfully.`,
    });
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (teacherToDelete) {
      setTeachers((prev) => prev.filter((t) => t.id !== teacherToDelete.id));
      toast({
        title: "Teacher removed",
        description: `${teacherToDelete.name} has been removed from the system.`,
      });
    }
    setDeleteDialogOpen(false);
    setTeacherToDelete(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage teachers and monitor feedback
            </p>
          </div>
          <Button onClick={() => setAddModalOpen(true)} data-testid="button-add-teacher">
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Teachers"
            value={teachers.length}
            subtitle="Active in system"
            icon={GraduationCap}
          />
          <StatCard
            title="Total Feedback"
            value={totalFeedback}
            subtitle="All time"
            icon={MessageSquare}
          />
          <StatCard
            title="Avg. Rating"
            value={averageRating.toFixed(1)}
            subtitle="Across all teachers"
            icon={Star}
          />
          <StatCard
            title="Departments"
            value={departments.length}
            subtitle="Active"
            icon={Users}
          />
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            placeholder="Search teachers by name or subject..."
          />
        </div>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-center">Feedback</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id} data-testid={`row-teacher-${teacher.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {teacher.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{teacher.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{teacher.subject}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{teacher.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <StarRating rating={teacher.averageRating} size="sm" showValue />
                      </TableCell>
                      <TableCell className="text-center">{teacher.totalFeedback}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(teacher)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-${teacher.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredTeachers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No teachers found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Teacher Modal */}
        <AddTeacherModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          onSubmit={handleAddTeacher}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Teacher</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {teacherToDelete?.name} from the system? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
