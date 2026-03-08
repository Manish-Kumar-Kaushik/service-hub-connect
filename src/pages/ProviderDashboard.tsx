import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Check, X, MapPin, Phone, FileText, Clock, Calendar, CreditCard, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/");
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (userId) checkProviderAndFetch();
  }, [userId]);

  // Real-time notifications
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

    // Check if user is a provider
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

    // Fetch bookings matching provider's services
    const { data: allBookings } = await supabase
      .from("bookings")
      .select("*")
      .in("service_name", provider.services_offered || [])
      .order("created_at", { ascending: false });

    setBookings((allBookings as ProviderBooking[]) || []);
    setLoading(false);
  };

  const handleAccept = async (booking: ProviderBooking) => {
    const { error } = await supabase
      .from("bookings")
      .update({ provider_status: "accepted", status: "confirmed" })
      .eq("id", booking.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // Notify customer
    await supabase.from("notifications").insert({
      user_id: booking.user_id,
      type: "booking_accepted",
      title: "Service Provider Accepted!",
      message: `Aapki ${booking.service_name} booking accept ho gayi hai. Provider jaldi aapke paas aayega.`,
      booking_id: booking.id,
    });

    toast({ title: "✅ Job Accepted!", description: "Customer ko notify kar diya gaya hai." });
    checkProviderAndFetch();
  };

  const handleReject = async (booking: ProviderBooking) => {
    const { error } = await supabase
      .from("bookings")
      .update({ provider_status: "rejected" })
      .eq("id", booking.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Job Rejected", description: "Aapne yeh job reject kar di." });
    checkProviderAndFetch();
  };

  const statusColor = (status: string | null) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
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

        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Provider Dashboard</h1>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : !providerExists ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground text-lg">Aap abhi registered service provider nahi hain.</p>
            <Button onClick={() => navigate("/provider-signup")}>Register as Provider</Button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Abhi koi naye jobs nahi hain. Jab customer booking karega, yahan dikhega.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="border border-border rounded-xl p-5 bg-card space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold text-foreground text-base">{b.service_name}</h3>
                  <Badge className={statusColor(b.provider_status)}>
                    {b.provider_status === "accepted" ? "Accepted" : b.provider_status === "rejected" ? "Rejected" : "Pending"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium text-foreground">{b.booking_date}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium text-foreground">{b.booking_time}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <CreditCard className="w-3.5 h-3.5" />
                    Payment: <span className="font-medium text-foreground">{b.payment_method === "cash" ? "Cash on Service" : "Razorpay"}</span>
                    {b.amount && <span className="text-primary font-bold ml-1">₹{b.amount}</span>}
                  </p>
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    Status: <span className="font-medium text-foreground">{b.payment_status || "pending"}</span>
                  </p>
                </div>

                {/* Customer details visible only after accepting */}
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
                          <FileText className="w-3.5 h-3.5" /> Problem Description:
                        </p>
                        <p className="text-foreground bg-background rounded p-2 text-sm">{b.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Accept/Reject buttons for pending */}
                {(!b.provider_status || b.provider_status === "pending") && (
                  <div className="flex gap-3 pt-2">
                    <Button className="flex-1 gap-2" onClick={() => handleAccept(b)}>
                      <Check className="w-4 h-4" /> Accept Job
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 text-destructive hover:text-destructive" onClick={() => handleReject(b)}>
                      <X className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground pt-1">
                  Booked: {format(new Date(b.created_at), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
