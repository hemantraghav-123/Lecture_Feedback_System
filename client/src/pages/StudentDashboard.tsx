import { useState, useMemo } from "react";
import { TeacherCard, type Teacher } from "@/components/TeacherCard";
import { FeedbackForm } from "@/components/FeedbackForm";
import { SearchFilter } from "@/components/SearchFilter";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Users, MessageSquare, Star } from "lucide-react";

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

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<Set<string>>(new Set());

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

    // Rating filter
    if (filterRating) {
      result = result.filter((t) => t.averageRating >= filterRating);
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
  }, [teachers, searchQuery, sortBy, filterRating, selectedDepartment]);

  const handleGiveFeedback = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFeedbackDialogOpen(true);
  };

  const handleSubmitFeedback = (teacherId: string, rating: number, comment: string) => {
    console.log("Feedback submitted:", { teacherId, rating, comment });
    setSubmittedFeedback((prev) => new Set(Array.from(prev).concat(teacherId)));
    toast({
      title: "Feedback submitted!",
      description: "Thank you for your feedback.",
    });
  };

  const totalFeedbackGiven = submittedFeedback.size;
  const averageRating = teachers.reduce((sum, t) => sum + t.averageRating, 0) / teachers.length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user?.name || "Student"}</h1>
          <p className="text-muted-foreground mt-1">
            Browse teachers and share your feedback
          </p>
        </div>

        {/* Stats */}
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

        {/* Search and Filter */}
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

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onGiveFeedback={handleGiveFeedback}
              hasGivenFeedback={submittedFeedback.has(teacher.id)}
            />
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No teachers found matching your criteria.</p>
          </div>
        )}

        {/* Feedback Dialog */}
        <FeedbackForm
          teacher={selectedTeacher}
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          onSubmit={handleSubmitFeedback}
        />
      </div>
    </div>
  );
}
