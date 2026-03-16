import { useState, useEffect } from "react";
import { Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WalletData {
  id: string;
  balance: number;
  total_earned: number;
  total_withdrawn: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  status: string;
  created_at: string;
}

interface WalletTabProps {
  providerId: string;
}

const WalletTab = ({ providerId }: WalletTabProps) => {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("otp");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const fetchWallet = async () => {
    // Get or create wallet
    let { data: w } = await supabase
      .from("provider_wallets")
      .select("*")
      .eq("provider_id", providerId)
      .maybeSingle();

    if (!w) {
      const { data: created } = await supabase
        .from("provider_wallets")
        .insert({ provider_id: providerId })
        .select()
        .single();
      w = created;
    }
    setWallet(w as WalletData);

    const { data: txns } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });
    setTransactions((txns as Transaction[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchWallet(); }, [providerId]);

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || amt > (wallet?.balance || 0)) {
      toast({ title: "Error", description: "Invalid amount", variant: "destructive" });
      return;
    }

    // Insert transaction
    await supabase.from("wallet_transactions").insert({
      provider_id: providerId,
      type: "withdrawal",
      amount: amt,
      description: "Wallet withdrawal",
      status: "completed",
    });

    // Update wallet
    await supabase.from("provider_wallets").update({
      balance: (wallet?.balance || 0) - amt,
      total_withdrawn: (wallet?.total_withdrawn || 0) + amt,
    }).eq("provider_id", providerId);

    toast({ title: "₹" + amt + " withdrawn successfully!" });
    setWithdrawOpen(false);
    setStep(1);
    setAmount("");
    setOtp("");
    setPassword("");
    fetchWallet();
  };

  if (loading) return <p className="text-muted-foreground">Loading wallet...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Balance Card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold text-foreground">₹{(wallet?.balance || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-accent/5 rounded-lg p-3">
              <p className="text-muted-foreground text-xs">Total Earned</p>
              <p className="font-bold text-foreground">₹{(wallet?.total_earned || 0).toLocaleString()}</p>
            </div>
            <div className="bg-destructive/5 rounded-lg p-3">
              <p className="text-muted-foreground text-xs">Total Withdrawn</p>
              <p className="font-bold text-foreground">₹{(wallet?.total_withdrawn || 0).toLocaleString()}</p>
            </div>
          </div>
          <Button className="w-full gap-2" onClick={() => { setStep(1); setWithdrawOpen(true); }}>
            <ArrowUpCircle className="w-4 h-4" /> Withdraw Money
          </Button>
        </div>

        {/* Transactions */}
        <div className="bg-card border border-border rounded-xl overflow-x-auto shadow-card">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Transactions</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No transactions yet</TableCell></TableRow>
              ) : transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-xs">{format(new Date(t.created_at), "dd MMM yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {t.type === "credit" ? (
                        <ArrowDownCircle className="w-3.5 h-3.5 text-accent" />
                      ) : (
                        <ArrowUpCircle className="w-3.5 h-3.5 text-destructive" />
                      )}
                      <span className="text-xs capitalize">{t.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`font-medium ${t.type === "credit" ? "text-accent" : "text-destructive"}`}>
                    {t.type === "credit" ? "+" : "-"}₹{t.amount}
                  </TableCell>
                  <TableCell>
                    <Badge className={t.status === "completed" ? "bg-accent/10 text-accent" : "bg-yellow-100 text-yellow-700"} variant="secondary">
                      {t.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Withdraw Modal */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Withdraw Money</DialogTitle>
          </DialogHeader>
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <Label>Amount (₹)</Label>
                <Input type="number" min="1" max={wallet?.balance || 0} value={amount} onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "-" || e.key === "e") e.preventDefault(); }}
                  placeholder="Enter amount" />
                <p className="text-xs text-muted-foreground mt-1">Available: ₹{(wallet?.balance || 0).toLocaleString()}</p>
              </div>
              <div>
                <Label>Verification Method</Label>
                <RadioGroup value={method} onValueChange={setMethod} className="mt-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="otp" id="otp" />
                    <Label htmlFor="otp">OTP Verification</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="password" id="pwd" />
                    <Label htmlFor="pwd">Password</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button className="w-full" onClick={() => setStep(2)}>Continue</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {method === "otp" ? (
                <div>
                  <Label>Enter OTP</Label>
                  <div className="flex justify-center mt-2">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map(i => <InputOTPSlot key={i} index={i} />)}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
              ) : (
                <div>
                  <Label>Enter Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              )}
              <Button className="w-full" onClick={handleWithdraw}>Withdraw ₹{amount}</Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>Back</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletTab;
