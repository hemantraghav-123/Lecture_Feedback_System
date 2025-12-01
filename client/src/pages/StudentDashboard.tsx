import { useState, useMemo } from "react";
import { TeacherCard } from "@/components/TeacherCard";
import { FeedbackForm } from "@/components/FeedbackForm";
import { SearchFilter } from "@/components/SearchFilter";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Users, MessageSquare, Star } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Teacher } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const { data: submittedTeacherIds = [] } = useQuery<string[]>({
    queryKey: ["/api/feedback/my-submissions"],
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data: { teacherId: string; rating: number; comment: string }) => {
      const res = await apiRequest("POST", "/api/feedback", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/my-submissions"] });
      setFeedbackDialogOpen(false);
      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const departments = useMemo(() => 
    Array.from(new Set(teachers.map((t) => t.department))),
    [teachers]
  );

  const filteredTeachers = useMemo(() => {
    let result = [...teachers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.subject.toLowerCase().includes(query)
      );
    }

    if (filterRating) {
      result = result.filter((t) => (t.averageRating || 0) >= filterRating);
    }

    if (selectedDepartment && selectedDepartment !== "all") {
      result = result.filter((t) => t.department === selectedDepartment);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "rating-high":
          return (b.averageRating || 0) - (a.averageRating || 0);
        case "rating-low":
          return (a.averageRating || 0) - (b.averageRating || 0);
        case "feedback-most":
          return (b.totalFeedback || 0) - (a.totalFeedback || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [teachers, searchQuery, sortBy, filterRating, selectedDepartment]);

  const handleGiveFeedback = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFeedbackDialogOpen(true);
  };

  const handleSubmitFeedback = (teacherId: string, rating: number, comment: string) => {
    feedbackMutation.mutate({ teacherId, rating, comment });
  };

  const totalFeedbackGiven = submittedTeacherIds.length;
  const averageRating = teachers.length > 0 
    ? teachers.reduce((sum, t) => sum + (t.averageRating || 0), 0) / teachers.length 
    : 0;

  if (teachersLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="container px-4 md:px-6 py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" data-testid="text-welcome">Welcome, {user?.name || "Student"}</h1>
          <p className="text-muted-foreground mt-1">
            Browse teachers and share your feedback
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Teachers"
            value={teachers.length}
            subtitle="Available for feedback"
            icon={Users}
          />
          <StatCard
            title="Feedback Given"
            value={totalFeedbackGiven}
            subtitle="This semester"
            icon={MessageSquare}
          />
          <StatCard
            title="Avg. Rating"
            value={averageRating.toFixed(1)}
            subtitle="Across all teachers"
            icon={Star}
          />
        </div>

        <div className="mb-6">
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterRating={filterRating}
            onFilterRatingChange={setFilterRating}
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            placeholder="Search teachers by name or subject..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={{
                id: teacher.id,
                name: teacher.name,
                department: teacher.department,
                subject: teacher.subject,
                averageRating: teacher.averageRating || 0,
                totalFeedback: teacher.totalFeedback || 0,
              }}
              onGiveFeedback={() => handleGiveFeedback(teacher)}
              hasGivenFeedback={submittedTeacherIds.includes(teacher.id)}
            />
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground" data-testid="text-no-teachers">No teachers found matching your criteria.</p>
          </div>
        )}

        <FeedbackForm
          teacher={selectedTeacher ? {
            id: selectedTeacher.id,
            name: selectedTeacher.name,
            department: selectedTeacher.department,
            subject: selectedTeacher.subject,
            averageRating: selectedTeacher.averageRating || 0,
            totalFeedback: selectedTeacher.totalFeedback || 0,
          } : null}
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          onSubmit={handleSubmitFeedback}
          isSubmitting={feedbackMutation.isPending}
        />
      </div>
    </div>
  );
}
