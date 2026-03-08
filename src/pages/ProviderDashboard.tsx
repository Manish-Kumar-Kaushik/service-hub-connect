import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Check, X, MapPin, Phone, FileText, Clock, Calendar, CreditCard, User, Send, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import QuoteDialog from "@/components/QuoteDialog";
import ProviderLocationSharer from "@/components/ProviderLocationSharer";

interface ProviderBooking {
  id: string;
  service_name: string;
  provider_name: string;
  booking_date: string;
  booking_time: string;
  description: string | null;
  customer_address: string | null;
  customer_phone: string | null;
  payment_method: string | null;
  amount: number | null;
  status: string;
  provider_status: string | null;
  payment_status: string | null;
  user_id: string;
  created_at: string;
}

const ProviderDashboard = () => {
  const { isAuthenticated, isLoading, userId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerExists, setProviderExists] = useState(false);
  const [quoteBooking, setQuoteBooking] = useState<ProviderBooking | null>(null);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/");
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (userId) checkProviderAndFetch();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("provider-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: any) => {
          if (payload.new.user_id === userId) {
            toast({ title: "🔔 New Job!", description: payload.new.message });
            checkProviderAndFetch();
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const checkProviderAndFetch = async () => {
    if (!userId) return;
    setLoading(true);

    const { data: provider } = await supabase
      .from("service_providers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!provider) {
      setProviderExists(false);
      setLoading(false);
      return;
    }
    setProviderExists(true);

    // Only show bookings assigned to this provider (by provider_id = provider.id)
    const { data: allBookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("provider_id", provider.id)
      .order("created_at", { ascending: false });

    const bks = (allBookings as ProviderBooking[]) || [];
    setBookings(bks);
    setEarnings(
      bks.filter((b) => b.provider_status === "accepted" && b.payment_status === "paid")
        .reduce((sum, b) => sum + (b.amount || 0), 0)
    );
    setLoading(false);
  };

  const handleAccept = async (booking: ProviderBooking) => {
    const { error } = await supabase
      .from("bookings")
      .update({ provider_status: "accepted", status: "accepted" })
      .eq("id", booking.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.from("notifications").insert({
      user_id: booking.user_id,
      type: "booking_accepted",
      title: "Service Provider Accepted!",
      message: `Your ${booking.service_name} booking has been accepted. The provider will visit you soon.`,
      booking_id: booking.id,
    });

    toast({ title: "✅ Job Accepted!", description: "Customer has been notified." });
    checkProviderAndFetch();
  };

  const handleReject = async (booking: ProviderBooking) => {
    // Mark current provider as rejected
    await supabase.from("bookings").update({ provider_status: "rejected", provider_id: null }).eq("id", booking.id);

    // Find next available provider for this service
    const { data: nextProviders } = await supabase
      .from("service_providers")
      .select("*")
      .contains("services_offered", [booking.service_name])
      .eq("is_active", true)
      .neq("user_id", userId!)
      .limit(1);

    if (nextProviders && nextProviders.length > 0) {
      const next = nextProviders[0];
      // Assign to next provider
      await supabase.from("bookings").update({
        provider_id: next.id,
        provider_name: next.name,
        provider_phone: next.phone,
        provider_email: next.email,
        provider_address: next.address,
        provider_status: "pending",
      }).eq("id", booking.id);

      // Notify next provider
      await supabase.from("notifications").insert({
        user_id: next.user_id,
        type: "new_job",
        title: "🔔 New Job Request!",
        message: `New ${booking.service_name} job available. Check your dashboard.`,
        booking_id: booking.id,
      });

      toast({ title: "Job Rejected", description: "Request forwarded to next available provider." });
    } else {
      // No provider available
      await supabase.from("notifications").insert({
        user_id: booking.user_id,
        type: "no_provider",
        title: "No Provider Available",
        message: `Sorry, no provider is currently available for ${booking.service_name}. Please try again later.`,
        booking_id: booking.id,
      });
      toast({ title: "Job Rejected", description: "No other provider available." });
    }

    checkProviderAndFetch();
  };

  const handleMarkComplete = async (booking: ProviderBooking) => {
    await supabase.from("bookings").update({ status: "completed", payment_status: booking.payment_method === "cash" ? "paid" : booking.payment_status }).eq("id", booking.id);
    await supabase.from("notifications").insert({
      user_id: booking.user_id,
      type: "service_completed",
      title: "Service Completed!",
      message: `Your ${booking.service_name} service is marked as completed. Please rate your experience.`,
      booking_id: booking.id,
    });
    toast({ title: "✅ Service Completed!" });
    checkProviderAndFetch();
  };

  const statusColor = (status: string | null) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const bookingStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "quote_sent": return "bg-purple-100 text-purple-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 max-w-4xl mx-auto pb-12">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Provider Dashboard</h1>
          </div>
          {providerExists && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Earnings</p>
              <p className="text-lg font-bold text-primary">₹{earnings.toLocaleString()}</p>
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : !providerExists ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground text-lg">You are not a registered service provider yet.</p>
            <Button onClick={() => navigate("/provider-signup")}>Register as Provider</Button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No new jobs available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="border border-border rounded-xl p-5 bg-card space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold text-foreground text-base">{b.service_name}</h3>
                  <div className="flex gap-2">
                    <Badge className={statusColor(b.provider_status)}>
                      {b.provider_status === "accepted" ? "Accepted" : b.provider_status === "rejected" ? "Rejected" : "Pending"}
                    </Badge>
                    <Badge className={bookingStatusColor(b.status)}>
                      {b.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> {b.booking_date}
                  </p>
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" /> {b.booking_time}
                  </p>
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <CreditCard className="w-3.5 h-3.5" />
                    {b.payment_method === "cash" ? "Cash on Service" : "Razorpay"}
                    {b.amount && <span className="text-primary font-bold ml-1">₹{b.amount}</span>}
                  </p>
                </div>

                {b.provider_status === "accepted" && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
                      <User className="w-4 h-4" /> Customer Details
                    </p>
                    {b.customer_phone && (
                      <p className="text-sm flex items-center gap-1.5 text-foreground">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {b.customer_phone}
                      </p>
                    )}
                    {b.customer_address && (
                      <p className="text-sm flex items-center gap-1.5 text-foreground">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {b.customer_address}
                      </p>
                    )}
                    {b.description && (
                      <div className="text-sm">
                        <p className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <FileText className="w-3.5 h-3.5" /> Problem:
                        </p>
                        <p className="text-foreground bg-background rounded p-2">{b.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons based on status */}
                <div className="flex gap-3 pt-2 flex-wrap">
                  {(!b.provider_status || b.provider_status === "pending") && (
                    <>
                      <Button className="flex-1 gap-2" onClick={() => handleAccept(b)}>
                        <Check className="w-4 h-4" /> Accept
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2 text-destructive" onClick={() => handleReject(b)}>
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    </>
                  )}

                  {b.provider_status === "accepted" && b.status !== "completed" && b.status !== "quote_sent" && b.status !== "in_progress" && (
                    <>
                      <Button variant="outline" className="gap-2" onClick={() => setQuoteBooking(b)}>
                        <Send className="w-4 h-4" /> Send Quote
                      </Button>
                      <ProviderLocationSharer bookingId={b.id} />
                    </>
                  )}

                  {b.provider_status === "accepted" && (b.status === "in_progress" || b.status === "quote_sent") && (
                    <>
                      <Button className="gap-2" onClick={() => handleMarkComplete(b)}>
                        <CheckCircle className="w-4 h-4" /> Mark Complete
                      </Button>
                      <ProviderLocationSharer bookingId={b.id} />
                    </>
                  )}
                </div>

                <p className="text-xs text-muted-foreground pt-1">
                  Booked: {format(new Date(b.created_at), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {quoteBooking && (
        <QuoteDialog
          bookingId={quoteBooking.id}
          serviceName={quoteBooking.service_name}
          open={!!quoteBooking}
          onOpenChange={(open) => !open && setQuoteBooking(null)}
          onQuoteSent={checkProviderAndFetch}
        />
      )}
    </div>
  );
};

export default ProviderDashboard;
