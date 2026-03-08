import { useState } from "react";
import { Star, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReviewDialogProps {
  bookingId: string;
  providerId: string;
  serviceName: string;
  providerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewSubmitted: () => void;
}

const ReviewDialog = ({ bookingId, providerId, serviceName, providerName, open, onOpenChange, onReviewSubmitted }: ReviewDialogProps) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating || !userId) return;
    setLoading(true);

    const { error } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      user_id: userId,
      provider_id: providerId,
      rating,
      comment: comment || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "⭐ Review Submitted!", description: "Thank you for your feedback." });
    setLoading(false);
    onOpenChange(false);
    onReviewSubmitted();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" /> Rate Your Experience
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Service: <span className="font-medium text-foreground">{serviceName}</span></p>
            <p className="text-sm text-muted-foreground">Provider: <span className="font-medium text-foreground">{providerName}</span></p>
          </div>

          <div className="flex items-center gap-1 justify-center py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {rating === 0 ? "Tap a star to rate" : `${rating} out of 5 stars`}
          </p>

          <Textarea
            placeholder="Share your experience (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />

          <Button className="w-full gap-2" onClick={handleSubmit} disabled={loading || !rating}>
            <Send className="w-4 h-4" /> {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
