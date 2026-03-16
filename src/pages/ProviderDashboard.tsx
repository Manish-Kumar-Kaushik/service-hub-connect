import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";

import DashboardHeader from "@/components/provider-dashboard/DashboardHeader";
import StatsCards from "@/components/provider-dashboard/StatsCards";
import { ViewProfileModal, EditProfileModal, ChangePasswordModal } from "@/components/provider-dashboard/ProfileModals";
import BookingsTab from "@/components/provider-dashboard/BookingsTab";
import MyServicesTab from "@/components/provider-dashboard/MyServicesTab";
import WalletTab from "@/components/provider-dashboard/WalletTab";
import QuoteDialog from "@/components/QuoteDialog";

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

interface ProviderProfile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  category: string | null;
  experience_years: number | null;
  avatar_url: string | null;
  shop_name: string | null;
  services_offered: string[] | null;
  is_active: boolean | null;
  is_verified: boolean | null;
}

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  // Modals
  const [viewProfile, setViewProfile] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [changePwd, setChangePwd] = useState(false);
  const [quoteBooking, setQuoteBooking] = useState<ProviderBooking | null>(null);

  const dummyUserId = localStorage.getItem("dummy_provider_id");

  useEffect(() => {
    if (!dummyUserId) {
      navigate("/provider-signup");
      return;
    }
    fetchData();
  }, [dummyUserId]);

  // Realtime
  useEffect(() => {
    if (!dummyUserId) return;
    const channel = supabase
      .channel("provider-dashboard-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchData())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload: any) => {
        if (payload.new.user_id === dummyUserId) {
          toast({ title: "🔔 Notification", description: payload.new.message });
          setNotificationCount((c) => c + 1);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [dummyUserId]);

  const fetchData = async () => {
    if (!dummyUserId) return;
    setLoading(true);

    const { data: prov } = await supabase
      .from("service_providers")
      .select("*")
      .eq("user_id", dummyUserId)
      .maybeSingle();

    if (!prov) {
      setLoading(false);
      navigate("/provider-signup");
      return;
    }
    setProvider(prov as ProviderProfile);

    const { data: bks } = await supabase
      .from("bookings")
      .select("*")
      .eq("provider_id", prov.id)
      .order("created_at", { ascending: false });
    setBookings((bks as ProviderBooking[]) || []);

    // Notification count
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", dummyUserId)
      .eq("is_read", false);
    setNotificationCount(count || 0);

    setLoading(false);
  };

  const handleAccept = async (b: ProviderBooking) => {
    await supabase.from("bookings").update({ provider_status: "accepted", status: "accepted" }).eq("id", b.id);
    await supabase.from("notifications").insert({
      user_id: b.user_id, type: "booking_accepted",
      title: "Service Provider Accepted!",
      message: `Your ${b.service_name} booking has been accepted.`,
      booking_id: b.id,
    });
    toast({ title: "✅ Job Accepted!" });
    fetchData();
  };

  const handleReject = async (b: ProviderBooking) => {
    await supabase.from("bookings").update({ provider_status: "rejected", provider_id: null }).eq("id", b.id);
    const { data: next } = await supabase
      .from("service_providers")
      .select("*")
      .contains("services_offered", [b.service_name])
      .eq("is_active", true)
      .neq("user_id", dummyUserId!)
      .limit(1);

    if (next && next.length > 0) {
      const np = next[0];
      await supabase.from("bookings").update({
        provider_id: np.id, provider_name: np.name, provider_phone: np.phone,
        provider_email: np.email, provider_address: np.address, provider_status: "pending",
      }).eq("id", b.id);
      await supabase.from("notifications").insert({
        user_id: np.user_id, type: "new_job",
        title: "🔔 New Job!", message: `New ${b.service_name} job available.`,
        booking_id: b.id,
      });
    }
    toast({ title: "Job declined" });
    fetchData();
  };

  const handleMarkComplete = async (b: ProviderBooking) => {
    await supabase.from("bookings").update({
      status: "completed",
      payment_status: b.payment_method === "cash" ? "paid" : b.payment_status,
    }).eq("id", b.id);
    await supabase.from("notifications").insert({
      user_id: b.user_id, type: "service_completed",
      title: "Service Completed!",
      message: `Your ${b.service_name} service is completed. Please rate your experience.`,
      booking_id: b.id,
    });

    // Credit wallet
    if (b.amount && provider) {
      await supabase.from("wallet_transactions").insert({
        provider_id: provider.id, type: "credit",
        amount: b.amount, description: `Payment for ${b.service_name}`,
        status: "completed",
      });
      // Update wallet balance
      const { data: w } = await supabase
        .from("provider_wallets")
        .select("*")
        .eq("provider_id", provider.id)
        .maybeSingle();
      if (w) {
        await supabase.from("provider_wallets").update({
          balance: (w as any).balance + b.amount,
          total_earned: (w as any).total_earned + b.amount,
        }).eq("provider_id", provider.id);
      }
    }

    toast({ title: "✅ Service Completed!" });
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem("dummy_provider_id");
    localStorage.removeItem("dummy_provider_name");
    navigate("/provider-signup");
  };

  // Stats
  const today = format(new Date(), "yyyy-MM-dd");
  const newRequests = bookings.filter((b) => !b.provider_status || b.provider_status === "pending").length;
  const todayJobs = bookings.filter((b) => b.booking_date === today).length;
  const completedJobs = bookings.filter((b) => b.status === "completed").length;
  const walletBalance = bookings
    .filter((b) => b.status === "completed" && b.payment_status === "paid")
    .reduce((s, b) => s + (b.amount || 0), 0);

  // Earnings chart (last 7 days)
  const chartData = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() }).map((day) => {
    const dayEarnings = bookings
      .filter((b) => b.status === "completed" && isSameDay(new Date(b.created_at), day))
      .reduce((s, b) => s + (b.amount || 0), 0);
    return { day: format(day, "EEE"), earnings: dayEarnings };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        providerName={provider?.name || "Provider"}
        avatarUrl={provider?.avatar_url}
        notificationCount={notificationCount}
        onViewProfile={() => setViewProfile(true)}
        onEditProfile={() => setEditProfile(true)}
        onChangePassword={() => setChangePwd(true)}
        onNotifications={() => {}}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <StatsCards
          newRequests={newRequests}
          todayJobs={todayJobs}
          walletBalance={walletBalance}
          completedJobs={completedJobs}
        />

        {/* Earnings Chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Earnings - Last 7 Days</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: "12px" }}
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, "Earnings"]}
                />
                <Area type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" fill="url(#earningsGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-12 rounded-xl bg-muted p-1">
            <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              My Services
            </TabsTrigger>
            <TabsTrigger value="wallet" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="mt-4">
            <BookingsTab
              bookings={bookings}
              onAccept={handleAccept}
              onReject={handleReject}
              onSendQuote={(b) => setQuoteBooking(b)}
              onMarkComplete={handleMarkComplete}
            />
          </TabsContent>

          <TabsContent value="services" className="mt-4">
            {provider && <MyServicesTab providerId={provider.id} />}
          </TabsContent>

          <TabsContent value="wallet" className="mt-4">
            {provider && <WalletTab providerId={provider.id} />}
          </TabsContent>
        </Tabs>
      </main>

      {/* Profile Modals */}
      {provider && (
        <>
          <ViewProfileModal
            open={viewProfile}
            onOpenChange={setViewProfile}
            provider={provider}
            onEdit={() => { setViewProfile(false); setEditProfile(true); }}
          />
          <EditProfileModal
            open={editProfile}
            onOpenChange={setEditProfile}
            provider={provider}
            onSaved={fetchData}
          />
          <ChangePasswordModal
            open={changePwd}
            onOpenChange={setChangePwd}
            providerId={provider.id}
          />
        </>
      )}

      {quoteBooking && (
        <QuoteDialog
          bookingId={quoteBooking.id}
          serviceName={quoteBooking.service_name}
          open={!!quoteBooking}
          onOpenChange={(open) => !open && setQuoteBooking(null)}
          onQuoteSent={fetchData}
        />
      )}
    </div>
  );
};

export default ProviderDashboard;
