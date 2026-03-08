import { useState, useEffect } from "react";
import { FileText, Check, X, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Quote {
  id: string;
  booking_id: string;
  provider_id: string;
  amount: number;
  description: string | null;
  status: string;
  created_at: string;
}

interface CustomerQuoteViewProps {
  bookingId: string;
  onQuoteAction: () => void;
}

const CustomerQuoteView = ({ bookingId, onQuoteAction }: CustomerQuoteViewProps) => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
    const channel = supabase
      .channel(`quotes-${bookingId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "quotes" }, () => fetchQuotes())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [bookingId]);

  const fetchQuotes = async () => {
    const { data } = await supabase
      .from("quotes")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false });
    setQuotes((data as Quote[]) || []);
    setLoading(false);
  };

  const handleAction = async (quoteId: string, accept: boolean) => {
    await supabase
      .from("quotes")
      .update({ status: accept ? "accepted" : "rejected" })
      .eq("id", quoteId);

    if (accept) {
      const quote = quotes.find((q) => q.id === quoteId);
      await supabase
        .from("bookings")
        .update({
          status: "in_progress",
          amount: quote?.amount,
          quote_id: quoteId,
        })
        .eq("id", bookingId);
    }

    toast({
      title: accept ? "✅ Quote Accepted" : "Quote Rejected",
      description: accept ? "Service will begin now!" : "You rejected the quote.",
    });
    onQuoteAction();
    fetchQuotes();
  };

  if (loading) return null;
  if (quotes.length === 0) return null;

  return (
    <div className="space-y-3">
      {quotes.map((q) => (
        <div key={q.id} className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Inspection Quote
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              q.status === "accepted" ? "bg-green-100 text-green-700" :
              q.status === "rejected" ? "bg-red-100 text-red-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {q.status}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground flex items-center gap-1">
            <DollarSign className="w-5 h-5" /> ₹{q.amount.toLocaleString()}
          </p>
          {q.description && (
            <p className="text-sm text-muted-foreground">{q.description}</p>
          )}
          {q.status === "pending" && (
            <div className="flex gap-3 pt-2">
              <Button size="sm" className="flex-1 gap-1" onClick={() => handleAction(q.id, true)}>
                <Check className="w-3.5 h-3.5" /> Accept
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-1 text-destructive" onClick={() => handleAction(q.id, false)}>
                <X className="w-3.5 h-3.5" /> Reject
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomerQuoteView;
