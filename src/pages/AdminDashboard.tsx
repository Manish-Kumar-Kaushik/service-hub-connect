import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Users, Wrench, Calendar, DollarSign, BarChart3, CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, Download } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import EarningsAnalytics from "@/components/EarningsAnalytics";

interface Provider {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  category: string | null;
  services_offered: string[] | null;
  is_active: boolean | null;
  is_verified: boolean | null;
  verification_status: string | null;
  experience_years: number | null;
  created_at: string;
}

interface BookingRow {
  id: string;
  service_name: string;
  provider_name: string;
  user_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  provider_status: string | null;
  payment_method: string | null;
  payment_status: string | null;
  amount: number | null;
  created_at: string;
}

interface ProfileRow {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [customers, setCustomers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = sessionStorage.getItem("admin_authenticated");
    if (adminAuth === "true") {
      setIsAdmin(true);
      setChecking(false);
      fetchAll();
    } else {
      setIsAdmin(false);
      setChecking(false);
      navigate("/admin-login");
    }
  }, []);

  // Realtime: auto-refresh when bookings change
  useEffect(() => {
    const channel = supabase
      .channel("admin-bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        fetchAll();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [provRes, bookRes, custRes] = await Promise.all([
      supabase.from("service_providers").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    setProviders((provRes.data as Provider[]) || []);
    setBookings((bookRes.data as BookingRow[]) || []);
    setCustomers((custRes.data as ProfileRow[]) || []);
    setLoading(false);
  };

  const handleVerifyProvider = async (id: string, approve: boolean) => {
    // Find the provider to get user_id
    const provider = providers.find((p) => p.id === id);
    
    await supabase
      .from("service_providers")
      .update({
        is_verified: approve,
        is_active: approve,
        verification_status: approve ? "approved" : "rejected",
      })
      .eq("id", id);

    // Send notification to provider
    if (provider) {
      await supabase.from("notifications").insert({
        user_id: provider.user_id,
        type: approve ? "verification_approved" : "verification_rejected",
        title: approve ? "✅ Account Verified!" : "❌ Account Rejected",
        message: approve
          ? "Congratulations! Aapka account verify ho gaya hai. Ab aap customers se bookings receive kar sakte ho."
          : "Aapka account verification reject ho gaya hai. Kripya apni details check karke dobara register karo ya Admin se contact karo.",
      });
    }

    toast({ title: approve ? "✅ Provider Approved & Activated" : "❌ Provider Rejected" });
    fetchAll();
  };

  const totalRevenue = bookings
    .filter((b) => b.status === "completed" || b.payment_status === "paid")
    .reduce((sum, b) => sum + (b.amount || 0), 0);


  const providerEarnings = useMemo(() => {
    const paidBookings = bookings.filter((b) => b.status === "completed" || b.payment_status === "paid");
    const map: Record<string, { name: string; revenue: number; jobs: number }> = {};
    paidBookings.forEach((b) => {
      const key = b.provider_name;
      if (!map[key]) map[key] = { name: key, revenue: 0, jobs: 0 };
      map[key].revenue += b.amount || 0;
      map[key].jobs += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [bookings]);

  const pendingProviders = providers.filter((p) => p.verification_status === "pending");
  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportBookingsCSV = () => {
    const headers = ["Service", "Provider", "Date", "Time", "Status", "Payment Method", "Payment Status", "Amount"];
    const rows = bookings.map((b) => [
      b.service_name, b.provider_name, b.booking_date, b.booking_time,
      b.status, b.payment_method || "N/A", b.payment_status || "pending", String(b.amount || 0),
    ]);
    downloadCSV("bookings_export.csv", headers, rows);
    toast({ title: "✅ Bookings CSV downloaded!" });
  };

  const exportRevenueCSV = () => {
    const headers = ["Provider", "Completed Jobs", "Total Revenue (₹)"];
    const rows = providerEarnings.map((p) => [p.name, String(p.jobs), String(p.revenue)]);
    rows.push(["TOTAL", String(providerEarnings.reduce((s, p) => s + p.jobs, 0)), String(totalRevenue)]);
    downloadCSV("revenue_export.csv", headers, rows);
    toast({ title: "✅ Revenue CSV downloaded!" });
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center space-y-4">
          <Shield className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">You don't have admin privileges.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 max-w-6xl mx-auto pb-12">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <Users className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{customers.length}</p>
            <p className="text-xs text-muted-foreground">Customers</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <Wrench className="w-5 h-5 text-accent mb-2" />
            <p className="text-2xl font-bold text-foreground">{providers.length}</p>
            <p className="text-xs text-muted-foreground">Providers</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <Calendar className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <DollarSign className="w-5 h-5 text-accent mb-2" />
            <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
        </div>

        {pendingProviders.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800 font-medium">
              {pendingProviders.length} provider(s) awaiting verification
            </p>
          </div>
        )}

        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-4 mt-4">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : providers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No providers registered yet.</p>
            ) : (
              providers.map((p) => (
                <div key={p.id} className="border border-border rounded-xl p-4 bg-card space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{p.name}</h3>
                      <p className="text-sm text-muted-foreground">{p.phone} • {p.email || "No email"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        p.verification_status === "approved"
                          ? "bg-green-100 text-green-700"
                          : p.verification_status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }>
                        {p.verification_status || "pending"}
                      </Badge>
                      {p.is_active && <Badge className="bg-blue-100 text-blue-700">Active</Badge>}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Category: <span className="text-foreground">{p.category || "N/A"}</span></p>
                    <p>Services: <span className="text-foreground">{p.services_offered?.join(", ") || "N/A"}</span></p>
                    <p>Experience: <span className="text-foreground">{p.experience_years || 0} years</span></p>
                    <p>Registered: <span className="text-foreground">{format(new Date(p.created_at), "dd MMM yyyy")}</span></p>
                  </div>
                  {/* Show approve/reject for pending AND rejected (so admin can re-approve) */}
                  {(!p.verification_status || p.verification_status === "pending" || p.verification_status === "rejected") && (
                    <div className="flex gap-3 pt-2">
                      <Button size="sm" className="gap-1" onClick={() => handleVerifyProvider(p.id, true)}>
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </Button>
                      {p.verification_status !== "rejected" && (
                        <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => handleVerifyProvider(p.id, false)}>
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                      )}
                    </div>
                  )}
                  {p.verification_status === "approved" && (
                    <div className="flex gap-3 pt-2">
                      <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => handleVerifyProvider(p.id, false)}>
                        <XCircle className="w-3.5 h-3.5" /> Reject / Delist
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="gap-2" onClick={exportBookingsCSV} disabled={bookings.length === 0}>
                <Download className="w-4 h-4" /> Export Bookings CSV
              </Button>
            </div>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No bookings yet.</p>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="border border-border rounded-xl p-4 bg-card">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <h3 className="font-semibold text-foreground text-sm">{b.service_name}</h3>
                    <div className="flex gap-2">
                      <Badge className={
                        b.status === "completed" ? "bg-green-100 text-green-700" :
                        b.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }>{b.status}</Badge>
                      <Badge className={
                        b.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }>{b.payment_status || "pending"}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                    <p>Provider: <span className="text-foreground">{b.provider_name}</span></p>
                    <p>Date: <span className="text-foreground">{b.booking_date}</span></p>
                    <p>Amount: <span className="text-foreground">₹{b.amount || 0}</span></p>
                    <p>Method: <span className="text-foreground">{b.payment_method || "N/A"}</span></p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="customers" className="space-y-4 mt-4">
            {customers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No customers yet.</p>
            ) : (
              customers.map((c) => (
                <div key={c.id} className="border border-border rounded-xl p-4 bg-card flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{c.display_name || "Unknown"}</h3>
                    <p className="text-xs text-muted-foreground">{c.email || "No email"} • {c.phone || "No phone"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{format(new Date(c.created_at), "dd MMM yyyy")}</p>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" className="gap-2" onClick={exportRevenueCSV} disabled={providerEarnings.length === 0}>
                <Download className="w-4 h-4" /> Export Revenue CSV
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* Unified Earnings & Services Analytics */}
              <EarningsAnalytics bookings={bookings} title="Earnings & Services Analytics" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-border rounded-xl p-6 bg-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Booking Status Breakdown
                </h3>
                <div className="space-y-3">
                  {["pending", "confirmed", "accepted", "in_progress", "completed", "cancelled"].map((status) => {
                    const count = bookings.filter((b) => b.status === status).length;
                    const pct = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-foreground">{status.replace("_", " ")}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-border rounded-xl p-6 bg-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-accent" /> Payment Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <span className="font-bold text-foreground">₹{totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Online Payments</span>
                    <span className="font-medium text-foreground">
                      {bookings.filter((b) => b.payment_method === "razorpay").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cash Payments</span>
                    <span className="font-medium text-foreground">
                      {bookings.filter((b) => b.payment_method === "cash").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pending Payments</span>
                    <span className="font-medium text-yellow-600">
                      {bookings.filter((b) => b.payment_status !== "paid").length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-xl p-6 bg-card md:col-span-2">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary" /> Top Services
                </h3>
                <div className="space-y-3">
                  {Object.entries(
                    bookings.reduce((acc, b) => {
                      acc[b.service_name] = (acc[b.service_name] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center">
                        <span className="text-sm text-foreground">{name}</span>
                        <Badge variant="secondary">{count} bookings</Badge>
                      </div>
                    ))}
                  {bookings.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
                </div>
              </div>
            </div>

              {/* Provider-wise Earnings */}
              <div className="border border-border rounded-xl p-6 bg-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" /> Provider-wise Earnings
                </h3>
                {providerEarnings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No earnings data yet.</p>
                ) : (
                  <>
                    <div className="h-64 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={providerEarnings} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} className="text-muted-foreground" />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} className="text-muted-foreground" />
                          <Tooltip
                            contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                            formatter={(value: number, name: string) => [
                              name === "revenue" ? `₹${value}` : value,
                              name === "revenue" ? "Revenue" : "Jobs"
                            ]}
                          />
                          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {providerEarnings.map((p, i) => (
                        <div key={p.name} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                            <div>
                              <p className="text-sm font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.jobs} completed job{p.jobs > 1 ? "s" : ""}</p>
                            </div>
                          </div>
                          <span className="font-bold text-primary">₹{p.revenue.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
