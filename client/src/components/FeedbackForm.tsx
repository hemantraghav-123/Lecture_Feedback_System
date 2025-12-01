import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { type Teacher } from "./TeacherCard";
import { BookOpen } from "lucide-react";

interface FeedbackFormProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (teacherId: string, rating: number, comment: string) => void;
}

export function FeedbackForm({ teacher, open, onOpenChange, onSubmit }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!teacher || rating === 0) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSubmit(teacher.id, rating, comment);
    setRating(0);
    setComment("");
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    onOpenChange(false);
  };

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>
            Share your experience with this course
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">{teacher.name}</span>
            <Badge variant="secondary">{teacher.department}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{teacher.subject}</span>
          </div>
        </div>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex justify-center py-2">
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onRatingChange={setRating}
              />
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="comment">Your Feedback (Optional)</Label>
              <span className="text-xs text-muted-foreground">
                {comment.length}/500
              </span>
            </div>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about the teaching style, course content, and overall experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              className="min-h-[120px] resize-none"
              data-testid="input-feedback-comment"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel-feedback">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            data-testid="button-submit-feedback"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
