import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Edit2, Save, X, MapPin, Phone, CreditCard, Star, TrendingUp } from "lucide-react";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import CustomerQuoteView from "@/components/CustomerQuoteView";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import ReviewDialog from "@/components/ReviewDialog";

interface Booking {
  id: string;
  service_name: string;
  provider_name: string;
  provider_address: string | null;
  provider_phone: string | null;
  provider_id: string | null;
  booking_date: string;
  booking_time: string;
  status: string;
  provider_status: string | null;
  amount: number | null;
  payment_status: string | null;
  payment_id: string | null;
  customer_address: string | null;
  created_at: string;
}

interface Review {
  booking_id: string;
}

const Dashboard = () => {
  const { isAuthenticated, isLoading, userId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/");
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    const [bookRes, revRes] = await Promise.all([
      supabase.from("bookings").select("*").eq("user_id", userId!).order("created_at", { ascending: false }),
      supabase.from("reviews").select("booking_id").eq("user_id", userId!),
    ]);
    setBookings((bookRes.data as Booking[]) || []);
    setReviews((revRes.data as Review[]) || []);
    setLoading(false);
  };

  const handleEdit = (b: Booking) => {
    setEditingId(b.id);
    setEditDate(b.booking_date);
    setEditTime(b.booking_time);
  };

  const handleSave = async (id: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ booking_date: editDate, booking_time: editTime })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated" });
      setEditingId(null);
      fetchData();
    }
  };

  const hasReview = (bookingId: string) => reviews.some((r) => r.booking_id === bookingId);

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "quote_sent": return "bg-purple-100 text-purple-700";
      case "accepted": return "bg-green-100 text-green-700";
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
        <h1 className="text-2xl font-bold text-foreground mb-6">My Bookings</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="border border-border rounded-xl p-5 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-base">{b.service_name}</h3>
                  <Badge className={statusColor(b.status)}>
                    {b.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Provider:</span> {b.provider_name}
                  </p>
                  {b.provider_phone && (
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {b.provider_phone}
                    </p>
                  )}
                  {b.provider_address && (
                    <p className="text-muted-foreground flex items-center gap-1 sm:col-span-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" /> {b.provider_address}
                    </p>
                  )}
                </div>

                {/* Live Tracking for accepted/in_progress bookings */}
                {(b.status === "accepted" || b.status === "on_the_way" || b.status === "in_progress") && (
                  <LiveTrackingMap bookingId={b.id} customerAddress={b.customer_address} />
                )}

                {/* Quote View */}
                {(b.status === "quote_sent" || b.status === "in_progress") && (
                  <CustomerQuoteView bookingId={b.id} onQuoteAction={fetchData} />
                )}

                {editingId === b.id ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-40" />
                    <Input value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-40" placeholder="e.g. 10:00 AM" />
                    <Button size="sm" variant="default" className="gap-1" onClick={() => handleSave(b.id)}>
                      <Save className="w-3 h-3" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" /> {b.booking_date}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" /> {b.booking_time}
                    </span>
                    {b.status !== "completed" && (
                      <Button size="sm" variant="ghost" className="gap-1 ml-auto" onClick={() => handleEdit(b)}>
                        <Edit2 className="w-3 h-3" /> Edit
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-2 flex-wrap">
                  {b.amount && (
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> ₹{b.amount}
                    </span>
                  )}
                  {b.payment_status && (
                    <span className={`px-2 py-0.5 rounded-full ${b.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {b.payment_status}
                    </span>
                  )}
                  <span className="ml-auto">{format(new Date(b.created_at), "dd MMM yyyy")}</span>
                </div>

                {/* Review button for completed bookings */}
                {b.status === "completed" && !hasReview(b.id) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 w-full"
                    onClick={() => setReviewBooking(b)}
                  >
                    <Star className="w-4 h-4 text-yellow-500" /> Rate this service
                  </Button>
                )}
                {b.status === "completed" && hasReview(b.id) && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-green-600" /> Review submitted
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewBooking && (
        <ReviewDialog
          bookingId={reviewBooking.id}
          providerId={reviewBooking.provider_id || reviewBooking.provider_name}
          serviceName={reviewBooking.service_name}
          providerName={reviewBooking.provider_name}
          open={!!reviewBooking}
          onOpenChange={(open) => !open && setReviewBooking(null)}
          onReviewSubmitted={fetchData}
        />
      )}
    </div>
  );
};

export default Dashboard;
