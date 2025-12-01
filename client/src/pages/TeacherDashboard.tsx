import { useState, useMemo } from "react";
import { StatCard } from "@/components/StatCard";
import { FeedbackItem, type Feedback } from "@/components/FeedbackItem";
import { RatingChart } from "@/components/RatingChart";
import { SearchFilter } from "@/components/SearchFilter";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Star, TrendingUp, Users } from "lucide-react";

// todo: remove mock functionality - replace with API data
const MOCK_FEEDBACK: Feedback[] = [
  {
    id: "1",
    studentName: "Alex Johnson",
    rating: 5,
    comment: "Excellent teaching methodology! The concepts were explained very clearly and the practical examples helped a lot.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    subject: "Web Technology",
  },
  {
    id: "2",
    studentName: "Sarah Wilson",
    rating: 4,
    comment: "Good lectures overall. Sometimes the pace is a bit fast but the content is great.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    subject: "Web Technology",
  },
  {
    id: "3",
    studentName: "Mike Chen",
    rating: 5,
    comment: "Best teacher I've had. Very approachable and always willing to help after class.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    subject: "Database Systems",
  },
  {
    id: "4",
    studentName: "Emily Brown",
    rating: 4,
    comment: "Great understanding of the subject. The assignments are challenging but fair.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    subject: "Web Technology",
  },
  {
    id: "5",
    studentName: "David Kim",
    rating: 3,
    comment: "Decent lectures. Would appreciate more hands-on coding sessions.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    subject: "Database Systems",
  },
  {
    id: "6",
    studentName: "Lisa Park",
    rating: 5,
    comment: "Amazing teacher! Makes complex topics easy to understand.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
    subject: "Web Technology",
  },
];

const RATING_DISTRIBUTION = [
  { rating: 1, count: 2 },
  { rating: 2, count: 5 },
  { rating: 3, count: 12 },
  { rating: 4, count: 28 },
  { rating: 5, count: 45 },
];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [feedback] = useState<Feedback[]>(MOCK_FEEDBACK);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const totalFeedback = feedback.length;
  const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback;
  const uniqueStudents = new Set(feedback.map((f) => f.studentName)).size;

  const filteredFeedback = useMemo(() => {
    let result = [...feedback];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.studentName.toLowerCase().includes(query) ||
          f.comment.toLowerCase().includes(query) ||
          f.subject?.toLowerCase().includes(query)
      );
    }

    // Rating filter
    if (filterRating) {
      result = result.filter((f) => f.rating >= filterRating);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "rating-high":
          return b.rating - a.rating;
        case "rating-low":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [feedback, searchQuery, sortBy, filterRating]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user?.name || "Teacher"}</h1>
          <p className="text-muted-foreground mt-1">
            Track your feedback and performance analytics
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Feedback"
            value={totalFeedback}
            subtitle="All time"
            icon={MessageSquare}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Average Rating"
            value={averageRating.toFixed(1)}
            subtitle="Out of 5 stars"
            icon={Star}
          />
          <StatCard
            title="Unique Students"
            value={uniqueStudents}
            subtitle="Who gave feedback"
            icon={Users}
          />
          <StatCard
            title="Response Rate"
            value="94%"
            subtitle="Above average"
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="feedback" className="space-y-6">
          <TabsList>
            <TabsTrigger value="feedback" data-testid="tab-feedback">Feedback</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-6">
            {/* Search and Filter */}
            <SearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterRating={filterRating}
              onFilterRatingChange={setFilterRating}
              placeholder="Search feedback by student or content..."
            />

            {/* Feedback List */}
            <div className="space-y-4">
              {filteredFeedback.map((item) => (
                <FeedbackItem key={item.id} feedback={item} />
              ))}
            </div>

            {filteredFeedback.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No feedback found matching your criteria.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RatingChart data={RATING_DISTRIBUTION} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">5-star ratings</span>
                    <span className="font-medium">45 (49%)</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">4-star ratings</span>
                    <span className="font-medium">28 (30%)</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">3-star ratings</span>
                    <span className="font-medium">12 (13%)</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">2-star ratings</span>
                    <span className="font-medium">5 (5%)</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">1-star ratings</span>
                    <span className="font-medium">2 (2%)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
