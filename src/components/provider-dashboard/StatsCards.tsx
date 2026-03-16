import { Clock, CalendarCheck, Wallet, CheckCircle2 } from "lucide-react";

interface StatsCardsProps {
  newRequests: number;
  todayJobs: number;
  walletBalance: number;
  completedJobs: number;
}

const StatsCards = ({ newRequests, todayJobs, walletBalance, completedJobs }: StatsCardsProps) => {
  const stats = [
    { label: "New Requests", value: newRequests, icon: Clock, color: "text-primary", bg: "bg-primary/10" },
    { label: "Today's Jobs", value: todayJobs, icon: CalendarCheck, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Wallet Balance", value: `₹${walletBalance.toLocaleString()}`, icon: Wallet, color: "text-accent", bg: "bg-accent/10" },
    { label: "Completed Jobs", value: completedJobs, icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-card">
          <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
            <s.icon className={`w-5 h-5 ${s.color}`} />
          </div>
          <p className="text-2xl font-bold text-foreground">{s.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
