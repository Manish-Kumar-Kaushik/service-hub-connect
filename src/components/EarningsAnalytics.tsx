import { useMemo, useState } from "react";
import { format, subDays, subMonths, eachDayOfInterval, eachMonthOfInterval, isSameDay, isSameMonth, isSameYear, startOfYear, eachYearOfInterval, subYears } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from "recharts";
import { TrendingUp, IndianRupee, Briefcase, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ViewMode = "daily" | "monthly" | "yearly";

interface BookingData {
  created_at: string;
  amount: number | null;
  status: string;
  payment_status: string | null;
  service_name: string;
}

interface EarningsAnalyticsProps {
  bookings: BookingData[];
  title?: string;
}

const EarningsAnalytics = ({ bookings, title = "Earnings & Services Analytics" }: EarningsAnalyticsProps) => {
  const [view, setView] = useState<ViewMode>("daily");

  const paidBookings = useMemo(
    () => bookings.filter((b) => b.status === "completed" || b.payment_status === "paid"),
    [bookings]
  );

  const chartData = useMemo(() => {
    if (view === "daily") {
      const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
      return days.map((day) => {
        const dayPaid = paidBookings.filter((b) => isSameDay(new Date(b.created_at), day));
        const dayAll = bookings.filter((b) => isSameDay(new Date(b.created_at), day));
        return {
          label: format(day, "dd MMM"),
          earnings: dayPaid.reduce((s, b) => s + (b.amount || 0), 0),
          services: dayAll.length,
        };
      });
    }

    if (view === "monthly") {
      const months = eachMonthOfInterval({ start: subMonths(new Date(), 11), end: new Date() });
      return months.map((month) => {
        const mPaid = paidBookings.filter((b) => isSameMonth(new Date(b.created_at), month));
        const mAll = bookings.filter((b) => isSameMonth(new Date(b.created_at), month));
        return {
          label: format(month, "MMM yyyy"),
          earnings: mPaid.reduce((s, b) => s + (b.amount || 0), 0),
          services: mAll.length,
        };
      });
    }

    // yearly
    const years = eachYearOfInterval({ start: subYears(startOfYear(new Date()), 4), end: new Date() });
    return years.map((year) => {
      const yPaid = paidBookings.filter((b) => isSameYear(new Date(b.created_at), year));
      const yAll = bookings.filter((b) => isSameYear(new Date(b.created_at), year));
      return {
        label: format(year, "yyyy"),
        earnings: yPaid.reduce((s, b) => s + (b.amount || 0), 0),
        services: yAll.length,
      };
    });
  }, [bookings, paidBookings, view]);

  const totalEarnings = paidBookings.reduce((s, b) => s + (b.amount || 0), 0);
  const totalServices = bookings.length;
  const avgPerService = totalServices > 0 ? Math.round(totalEarnings / totalServices) : 0;

  // Top services breakdown
  const topServices = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    bookings.forEach((b) => {
      if (!map[b.service_name]) map[b.service_name] = { count: 0, revenue: 0 };
      map[b.service_name].count += 1;
      if (b.status === "completed" || b.payment_status === "paid") {
        map[b.service_name].revenue += b.amount || 0;
      }
    });
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [bookings]);

  const viewButtons: { key: ViewMode; label: string }[] = [
    { key: "daily", label: "Daily" },
    { key: "monthly", label: "Monthly" },
    { key: "yearly", label: "Yearly" },
  ];

  return (
    <div className="border border-border rounded-xl p-5 bg-card space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
          <TrendingUp className="w-5 h-5 text-primary" /> {title}
        </h3>
        <div className="flex bg-muted rounded-lg p-0.5">
          {viewButtons.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                view === v.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-background rounded-lg p-3 text-center border border-border">
          <IndianRupee className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">₹{totalEarnings.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Earnings</p>
        </div>
        <div className="bg-background rounded-lg p-3 text-center border border-border">
          <Briefcase className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{totalServices}</p>
          <p className="text-[10px] text-muted-foreground">Services Attended</p>
        </div>
        <div className="bg-background rounded-lg p-3 text-center border border-border">
          <CalendarDays className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">₹{avgPerService.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Avg / Service</p>
        </div>
      </div>

      {/* Combined Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2}>
            <defs>
              <linearGradient id="earningsBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-muted-foreground" angle={view === "daily" ? -45 : 0} textAnchor={view === "daily" ? "end" : "middle"} height={view === "daily" ? 60 : 30} />
            <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} className="text-muted-foreground" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} allowDecimals={false} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: "12px" }}
              formatter={(value: number, name: string) => [
                name === "earnings" ? `₹${value.toLocaleString()}` : value,
                name === "earnings" ? "Earnings" : "Services",
              ]}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar yAxisId="left" dataKey="earnings" fill="url(#earningsBarGrad)" radius={[4, 4, 0, 0]} name="Earnings (₹)" />
            <Bar yAxisId="right" dataKey="services" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} opacity={0.7} name="Services" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Services Breakdown */}
      {topServices.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Top Services</p>
          <div className="space-y-2">
            {topServices.map((s, i) => {
              const pct = totalEarnings > 0 ? (s.revenue / totalEarnings) * 100 : 0;
              return (
                <div key={s.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">
                      <span className="text-muted-foreground mr-1">#{i + 1}</span> {s.name}
                    </span>
                    <span className="text-muted-foreground">
                      {s.count} jobs • <span className="text-primary font-semibold">₹{s.revenue.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsAnalytics;
