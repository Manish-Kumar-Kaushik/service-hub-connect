import { useState } from "react";
import { FileText, Send, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuoteDialogProps {
  bookingId: string;
  serviceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuoteSent: () => void;
}

const QuoteDialog = ({ bookingId, serviceName, open, onOpenChange, onQuoteSent }: QuoteDialogProps) => {
  const { userId: authUserId } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Support both Descope auth and dummy provider login
  const dummyProviderId = localStorage.getItem("dummy_provider_id");
  const effectiveUserId = authUserId || dummyProviderId;

  const handleSendQuote = async () => {
    if (!amount || !effectiveUserId) return;
    setLoading(true);

    const { error } = await supabase.from("quotes").insert({
      booking_id: bookingId,
      provider_id: userId,
      amount: parseFloat(amount),
      description: description || null,
      status: "pending",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Update booking status
    await supabase
      .from("bookings")
      .update({ status: "quote_sent" })
      .eq("id", bookingId);

    // Notify customer
    const { data: booking } = await supabase
      .from("bookings")
      .select("user_id")
      .eq("id", bookingId)
      .single();

    if (booking) {
      await supabase.from("notifications").insert({
        user_id: booking.user_id,
        type: "quote_received",
        title: "Quote Received!",
        message: `Provider sent a quote of ₹${amount} for ${serviceName}. Review and approve it.`,
        booking_id: bookingId,
      });
    }

    toast({ title: "✅ Quote Sent!", description: "Customer has been notified." });
    setLoading(false);
    onOpenChange(false);
    onQuoteSent();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Send Inspection Quote
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">Service: <span className="font-medium text-foreground">{serviceName}</span></p>
          <div>
            <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Quote Amount (₹)
            </label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Details / Breakdown</label>
            <Textarea
              placeholder="Describe what you found during inspection and cost breakdown..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button className="w-full gap-2" onClick={handleSendQuote} disabled={loading || !amount}>
            <Send className="w-4 h-4" /> {loading ? "Sending..." : "Send Quote"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteDialog;
