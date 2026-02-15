import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Edit2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

interface Booking {
  id: string;
  service_name: string;
  provider_name: string;
  provider_address: string | null;
  booking_date: string;
  booking_time: string;
  status: string;
  amount: number | null;
  payment_status: string | null;
}

const Dashboard = () => {
  const { isAuthenticated, isLoading, userId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/");
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (userId) fetchBookings();
  }, [userId]);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false });
    setBookings((data as Booking[]) || []);
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
      toast({ title: "Updated", description: "Booking updated successfully." });
      setEditingId(null);
      fetchBookings();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 max-w-4xl mx-auto">
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
              <div key={b.id} className="border border-border rounded-xl p-4 bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{b.service_name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${b.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {b.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Provider: {b.provider_name}</p>
                {b.provider_address && <p className="text-xs text-muted-foreground">{b.provider_address}</p>}

                {editingId === b.id ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-40" />
                    <Input value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-32" placeholder="e.g. 10:00 AM" />
                    <Button size="sm" variant="default" className="gap-1" onClick={() => handleSave(b.id)}>
                      <Save className="w-3 h-3" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" /> {b.booking_date}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" /> {b.booking_time}
                    </span>
                    <Button size="sm" variant="ghost" className="gap-1 ml-auto" onClick={() => handleEdit(b)}>
                      <Edit2 className="w-3 h-3" /> Edit
                    </Button>
                  </div>
                )}

                {b.amount && (
                  <p className="text-xs text-muted-foreground">Amount: ₹{b.amount} • Payment: {b.payment_status}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
