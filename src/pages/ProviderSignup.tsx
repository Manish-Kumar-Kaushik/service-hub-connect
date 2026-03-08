import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wrench, CheckCircle2, Shield, Star, Users, Briefcase, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { serviceCategories } from "@/components/sidebar/SidebarData";
import { Descope } from "@descope/react-sdk";

const ProviderSignup = () => {
  const { isAuthenticated, isLoading, userId, userName, userEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    category: "",
    services: [] as string[],
    experience: "",
  });

  const handleServiceToggle = (service: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const selectedCategory = serviceCategories.find((c) => c.title === form.category);

  const handleSubmit = async () => {
    if (!isAuthenticated || !userId) {
      toast({ title: "Login Required", description: "Please login first.", variant: "destructive" });
      return;
    }
    if (!form.name || !form.phone || !form.category || form.services.length === 0) {
      toast({ title: "Missing Info", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("service_providers").upsert(
      {
        user_id: userId,
        name: form.name,
        phone: form.phone,
        email: form.email || userEmail || "",
        address: form.address,
        category: form.category,
        services_offered: form.services,
        experience_years: parseInt(form.experience) || 0,
      },
      { onConflict: "user_id" }
    );

    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      toast({ title: "Registration Successful!", description: "You are now a service provider." });
    }
  };

  const benefits = [
    { icon: Users, text: "Direct customer connections" },
    { icon: Briefcase, text: "Manage your own schedule" },
    { icon: Star, text: "Build your reputation" },
    { icon: Shield, text: "Verified provider badge" },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 px-4 max-w-lg mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Registration Complete!</h2>
          <p className="text-muted-foreground">You will now receive notifications for new bookings. Manage jobs from the Provider Dashboard.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/provider-dashboard")}>Go to Dashboard</Button>
            <Button variant="outline" onClick={() => navigate("/")}>Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="pt-20 pb-12">
        {/* Hero Banner */}
        <div className="bg-gradient-hero text-primary-foreground py-12 px-4 mb-8">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center">
                <Wrench className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Service Provider Portal</h1>
                <p className="text-primary-foreground/80 mt-1">Join our network and grow your business</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                  <b.icon className="w-4 h-4" />
                  {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          {!isAuthenticated && !isLoading ? (
            /* Login / Auth Section */
            <div className="max-w-md mx-auto">
              {/* Tabs */}
              <div className="flex rounded-xl bg-muted p-1 mb-6">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all ${
                    activeTab === "login"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all ${
                    activeTab === "register"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  New Registration
                </button>
              </div>

              <Card className="shadow-card border-border/50">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-foreground">
                      {activeTab === "login" ? "Welcome Back, Provider!" : "Create Your Account"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeTab === "login"
                        ? "Login to manage your services and bookings"
                        : "Sign up to start offering your services"}
                    </p>
                  </div>
                  <Descope
                    flowId={activeTab === "login" ? "sign-up-or-in" : "sign-up-or-in"}
                    onSuccess={() => {
                      toast({ title: "Login Successful!", description: "Now complete your provider registration." });
                    }}
                    onError={(e) => console.error("Descope error:", e)}
                  />
                </CardContent>
              </Card>

              <p className="text-center text-xs text-muted-foreground mt-4">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          ) : (
            /* Registration Form */
            <Card className="shadow-card border-border/50">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">
                    2
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Complete Your Profile</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6 ml-11">
                  Fill in your details to start receiving job requests
                </p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Full Name *</label>
                      <Input
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Phone Number *</label>
                      <Input
                        placeholder="+91 XXXXX XXXXX"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
                      <Input
                        placeholder="email@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Experience (Years)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 5"
                        value={form.experience}
                        onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Address *</label>
                    <Textarea
                      placeholder="Your full address - locality, landmark..."
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Service Category *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {serviceCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.title}
                            onClick={() => setForm({ ...form, category: cat.title, services: [] })}
                            className={`border rounded-xl p-3 text-left transition-all flex items-center gap-2 ${
                              form.category === cat.title
                                ? "border-primary bg-primary/10 text-primary shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-primary/5"
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="text-sm font-medium">{cat.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedCategory && (
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">Select Services You Offer *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedCategory.items.map((item) => {
                          const Icon = item.icon;
                          const selected = form.services.includes(item.label);
                          return (
                            <button
                              key={item.label}
                              onClick={() => handleServiceToggle(item.label)}
                              className={`border rounded-lg p-2.5 text-left transition-all flex items-center gap-2 text-sm ${
                                selected
                                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                                  : "border-border hover:border-primary/40 hover:bg-primary/5"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5 shrink-0" />
                              {item.label}
                              {selected && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-accent" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full text-base font-semibold bg-gradient-hero hover:opacity-90 transition-opacity"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register as Service Provider"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderSignup;
