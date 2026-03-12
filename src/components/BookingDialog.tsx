import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Phone, CreditCard, PartyPopper, Banknote, FileText, Home, Store } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CardProvider } from "@/components/ServiceCards";
import type { ServiceMode } from "@/components/sidebar/SidebarData";

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM",
];

const durationOptions = [
  { label: "30 min", minutes: 30, rate: 199 },
  { label: "1 hour", minutes: 60, rate: 349 },
  { label: "1.5 hours", minutes: 90, rate: 499 },
  { label: "2 hours", minutes: 120, rate: 649 },
  { label: "3 hours", minutes: 180, rate: 899 },
  { label: "Full Day", minutes: 480, rate: 1999 },
];

interface BookingDialogProps {
  provider: CardProvider | null;
  serviceName: string;
  serviceMode?: ServiceMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "actions" | "visit-mode" | "description" | "calendar" | "time" | "duration" | "payment-method" | "confirm" | "success";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const BookingDialog = ({ provider, serviceName, serviceMode = "home_only", open, onOpenChange }: BookingDialogProps) => {
  const [step, setStep] = useState<Step>("actions");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState<typeof durationOptions[0] | null>(null);
  const [description, setDescription] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cash">("razorpay");
  const [visitMode, setVisitMode] = useState<"home_visit" | "shop_visit">("home_visit");
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, userId, userName, userEmail, profile } = useAuth();
  const { toast } = useToast();

  const resetState = () => {
    setStep("actions");
    setDate(undefined);
    setTime("");
    setDuration(null);
    setDescription("");
    setCustomerAddress("");
    setCustomerPhone("");
    setPaymentMethod("razorpay");
    setLoading(false);
  };

  const handleClose = (val: boolean) => {
    if (!val) resetState();
    onOpenChange(val);
  };

  const handleContact = () => {
    if (provider) {
      window.open(`tel:${provider.phone.replace(/\s/g, "")}`, "_self");
    }
    toast({ title: "Contact", description: `Calling ${provider?.name}...` });
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  };

  const saveBooking = async (paymentId?: string) => {
    if (!date || !time || !provider || !duration || !userId) return;

    const { data: bookingData, error } = await supabase.from("bookings").insert({
      user_id: userId,
      service_name: serviceName,
      provider_name: provider.name,
      provider_id: provider.isRegistered ? provider.id : null,
      provider_address: provider.address,
      provider_phone: provider.phone,
      booking_date: format(date, "yyyy-MM-dd"),
      booking_time: `${time} (${duration.label})`,
      payment_id: paymentId || null,
      payment_status: paymentMethod === "razorpay" ? "paid" : "pending",
      payment_method: paymentMethod,
      amount: duration.rate,
      status: "confirmed",
      description: description || null,
      customer_address: customerAddress || profile?.address || null,
      customer_phone: customerPhone || profile?.phone || null,
      provider_status: "pending",
    }).select("id").single();

    if (error) throw error;

    // Notify matching providers
    if (bookingData) {
      const { data: providers } = await supabase
        .from("service_providers")
        .select("user_id")
        .contains("services_offered", [serviceName]);

      if (providers && providers.length > 0) {
        const notifications = providers.map((p) => ({
          user_id: p.user_id,
          type: "new_booking",
          title: "New Job Available!",
          message: `New ${serviceName} booking on ${format(date, "dd MMM")} at ${time}. Accept now!`,
          booking_id: bookingData.id,
        }));
        await supabase.from("notifications").insert(notifications);
      }
    }
  };

  const handlePayRazorpay = async () => {
    if (!isAuthenticated || !userId || !date || !time || !provider || !duration) return;
    setLoading(true);

    try {
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            amount: duration.rate,
            currency: "INR",
            receipt: `booking_${Date.now()}`,
            notes: { service: serviceName, provider: provider.name },
          },
        }
      );

      if (orderError || !orderData?.order_id) throw new Error(orderError?.message || "Failed to create order");

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load payment gateway");

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Any Where Door",
        description: `${serviceName} - ${provider.name} (${duration.label})`,
        order_id: orderData.order_id,
        prefill: {
          name: profile?.display_name || userName || "",
          email: profile?.email || userEmail || "",
          contact: profile?.phone || customerPhone || "",
        },
        handler: async (response: any) => {
          await saveBooking(response.razorpay_payment_id);
          setStep("success");
          setLoading(false);
          toast({
            title: "🎉 Your service is booked!",
            description: `${serviceName} with ${provider.name} on ${format(date, "PPP")} at ${time}`,
          });
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const handleCashBooking = async () => {
    if (!isAuthenticated || !userId || !date || !time || !provider || !duration) return;
    setLoading(true);
    try {
      await saveBooking();
      setStep("success");
      toast({
        title: "🎉 Your service is booked!",
        description: `Payment: Cash on Service. ${serviceName} on ${format(date!, "PPP")} at ${time}`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPay = () => {
    if (paymentMethod === "razorpay") handlePayRazorpay();
    else handleCashBooking();
  };

  if (!provider) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{provider.name}</DialogTitle>
        </DialogHeader>

        {/* Step: Actions */}
        {step === "actions" && (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">{provider.address}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> {provider.phone}
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={handleContact}>
                <Phone className="w-4 h-4" /> Contact
              </Button>
              <Button className="flex-1 gap-2" onClick={() => {
                if (!isAuthenticated) {
                  toast({ title: "Login Required", description: "Please login first to book a service.", variant: "destructive" });
                  return;
                }
                setStep("description");
              }}>
                <CreditCard className="w-4 h-4" /> Book
              </Button>
            </div>
          </div>
        )}

        {/* Step: Description & Customer Details */}
        {step === "description" && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5" /> Problem Description
              </label>
              <Textarea
                placeholder="Describe your actual problem in detail so the provider can come fully prepared with the right tools... (e.g. Kitchen sink is leaking, the pipe is old and needs replacement)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Your Address *</label>
              <Textarea
                placeholder="Full address - house number, street, landmark, area..."
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Your Phone Number *</label>
              <Input
                placeholder="+91 XXXXX XXXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={() => {
              if (!customerAddress || !customerPhone) {
                toast({ title: "Required", description: "Please enter your address and phone number.", variant: "destructive" });
                return;
              }
              setStep("calendar");
            }}>
              Continue
            </Button>
          </div>
        )}

        {/* Step: Calendar */}
        {step === "calendar" && (
          <div className="space-y-4 pt-2">
            <label className="text-sm font-medium block">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => { setDate(d); if (d) setStep("time"); }}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Step: Time */}
        {step === "time" && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Date: <span className="font-medium text-foreground">{date && format(date, "PPP")}</span>
            </p>
            <label className="text-sm font-medium block">Select Time</label>
            <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto">
              {timeSlots.map((slot) => (
                <Button key={slot} variant={time === slot ? "default" : "outline"} size="sm" className="text-xs"
                  onClick={() => { setTime(slot); setStep("duration"); }}>
                  {slot}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Duration */}
        {step === "duration" && (
          <div className="space-y-4 pt-2">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Date: <span className="font-medium text-foreground">{date && format(date, "PPP")}</span></p>
              <p>Time: <span className="font-medium text-foreground">{time}</span></p>
            </div>
            <label className="text-sm font-medium block">Select Duration</label>
            <div className="grid grid-cols-2 gap-3">
              {durationOptions.map((opt) => (
                <button key={opt.minutes}
                  onClick={() => { setDuration(opt); setStep("payment-method"); }}
                  className={cn("border rounded-xl p-3 text-left transition-all hover:border-primary hover:bg-primary/5",
                    duration?.minutes === opt.minutes ? "border-primary bg-primary/10" : "border-border")}>
                  <p className="font-semibold text-sm text-foreground">{opt.label}</p>
                  <p className="text-primary font-bold text-lg">₹{opt.rate}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Payment Method */}
        {step === "payment-method" && duration && (
          <div className="space-y-4 pt-2">
            <label className="text-sm font-medium block">Payment Method</label>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => { setPaymentMethod("razorpay"); setStep("confirm"); }}
                className={cn("border rounded-xl p-4 text-left transition-all flex items-center gap-3 hover:border-primary",
                  paymentMethod === "razorpay" ? "border-primary bg-primary/10" : "border-border")}>
                <CreditCard className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Pay Online (Razorpay)</p>
                  <p className="text-xs text-muted-foreground">Pay now via UPI, Card, or Net Banking</p>
                </div>
              </button>
              <button
                onClick={() => { setPaymentMethod("cash"); setStep("confirm"); }}
                className={cn("border rounded-xl p-4 text-left transition-all flex items-center gap-3 hover:border-primary",
                  paymentMethod === "cash" ? "border-primary bg-primary/10" : "border-border")}>
                <Banknote className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-foreground">Cash on Service</p>
                  <p className="text-xs text-muted-foreground">Pay at home after the service is completed</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && duration && (
          <div className="space-y-4 pt-2">
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <p><span className="font-medium">Service:</span> {serviceName}</p>
              <p><span className="font-medium">Provider:</span> {provider.name}</p>
              <p><span className="font-medium">Date:</span> {date && format(date, "PPP")}</p>
              <p><span className="font-medium">Time:</span> {time} ({duration.label})</p>
              <p><span className="font-medium">Payment:</span> {paymentMethod === "razorpay" ? "Online (Razorpay)" : "Cash on Service"}</p>
              {description && <p><span className="font-medium">Problem:</span> {description}</p>}
              <p><span className="font-medium">Address:</span> {customerAddress}</p>
              <p><span className="font-medium">Phone:</span> {customerPhone}</p>
              <div className="border-t border-border pt-2 mt-2">
                <p className="text-lg font-bold text-primary">Total: ₹{duration.rate}</p>
              </div>
            </div>
            <Button className="w-full text-base font-semibold gap-2" size="lg" onClick={handleConfirmPay} disabled={loading}>
              {loading ? "Processing..." : paymentMethod === "razorpay" ? `Pay ₹${duration.rate}` : `Confirm Booking (₹${duration.rate} Cash)`}
            </Button>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="text-center space-y-4 py-6">
            <PartyPopper className="w-16 h-16 text-primary mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-foreground">Your service is booked!</h3>
            <p className="text-sm text-muted-foreground">
              {serviceName} with {provider.name} on {date && format(date, "PPP")} at {time}
            </p>
            {paymentMethod === "cash" && (
              <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
                💰 Cash on Service: Pay ₹{duration?.rate} after service is completed
              </p>
            )}
            <p className="text-xs text-muted-foreground">The service provider has been notified</p>
            <Button onClick={() => handleClose(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
