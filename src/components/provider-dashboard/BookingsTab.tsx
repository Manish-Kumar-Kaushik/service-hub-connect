import { useState } from "react";
import { Search, MapPin, Calendar, Clock, CreditCard, Phone, User, Check, X, Send, CheckCircle, Home, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Booking {
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

interface BookingsTabProps {
  bookings: Booking[];
  onAccept: (b: Booking) => void;
  onReject: (b: Booking) => void;
  onSendQuote: (b: Booking) => void;
  onMarkComplete: (b: Booking) => void;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-primary/10 text-primary",
    completed: "bg-accent/10 text-accent",
    cancelled: "bg-destructive/10 text-destructive",
    in_progress: "bg-primary/10 text-primary",
    quote_sent: "bg-purple-100 text-purple-700",
  };
  return map[status] || "bg-muted text-muted-foreground";
};

const BookingsTab = ({ bookings, onAccept, onReject, onSendQuote, onMarkComplete }: BookingsTabProps) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = bookings.filter((b) => {
    const matchSearch = b.service_name.toLowerCase().includes(search.toLowerCase()) ||
      b.provider_name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || b.provider_status === filter || b.status === filter;
    return matchSearch && matchFilter;
  });

  const pending = filtered.filter((b) => !b.provider_status || b.provider_status === "pending");
  const accepted = filtered.filter((b) => b.provider_status === "accepted" && b.status !== "completed");
  const completed = filtered.filter((b) => b.status === "completed");

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search bookings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground text-sm">New Requests ({pending.length})</h3>
          {pending.map((b) => (
            <div key={b.id} className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-card">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{b.service_name}</h4>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Home className="w-3 h-3" /> Home Visit
                  </Badge>
                </div>
                <Badge className={statusBadge("pending")}>Pending</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Customer</p>
                {b.customer_address && <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {b.customer_address}</p>}
                <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {b.booking_date}</p>
                <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {b.booking_time}</p>
                {b.amount && <p className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> ₹{b.amount} (Escrow Hold)</p>}
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 gap-1" onClick={() => onAccept(b)}>
                  <Check className="w-4 h-4" /> Accept
                </Button>
                <Button variant="outline" className="flex-1 gap-1 text-destructive border-destructive/30" onClick={() => onReject(b)}>
                  <X className="w-4 h-4" /> Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accepted / Active */}
      {accepted.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground text-sm">Active Jobs ({accepted.length})</h3>
          {accepted.map((b) => (
            <div key={b.id} className="bg-card border border-primary/20 rounded-xl p-4 space-y-3 shadow-card">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-semibold text-foreground">{b.service_name}</h4>
                <Badge className={statusBadge(b.status)}>{b.status.replace("_", " ")}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                {b.customer_address && <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {b.customer_address}</p>}
                <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {b.booking_date}</p>
                <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {b.booking_time}</p>
                {b.customer_phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {b.customer_phone}</p>}
              </div>
              {b.status === "accepted" && (
                <p className="text-xs text-muted-foreground italic">⏳ Waiting for user confirmation...</p>
              )}
              <div className="flex gap-3 flex-wrap">
                {b.status !== "quote_sent" && b.status !== "in_progress" && (
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => onSendQuote(b)}>
                    <Send className="w-3.5 h-3.5" /> Send Quote
                  </Button>
                )}
                {(b.status === "in_progress" || b.status === "quote_sent") && (
                  <Button size="sm" className="gap-1" onClick={() => onMarkComplete(b)}>
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Table */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground text-sm">Completed ({completed.length})</h3>
          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completed.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.service_name}</TableCell>
                    <TableCell>{b.customer_phone || "—"}</TableCell>
                    <TableCell>{b.booking_date}</TableCell>
                    <TableCell><Badge className={statusBadge("completed")}>Completed</Badge></TableCell>
                    <TableCell>₹{b.amount || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No bookings found.</p>
        </div>
      )}
    </div>
  );
};

export default BookingsTab;
