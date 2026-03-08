import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wrench, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { serviceCategories } from "@/components/sidebar/SidebarData";

const ProviderSignup = () => {
  const { isAuthenticated, isLoading, userId, userName, userEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
      toast({ title: "🎉 Registration Successful!", description: "You are now a service provider." });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4 max-w-lg mx-auto text-center space-y-6">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 max-w-2xl mx-auto pb-12">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Service Provider Registration</h1>
            <p className="text-sm text-muted-foreground">Register and get direct jobs from customers</p>
          </div>
        </div>

        {!isAuthenticated && !isLoading ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">Please login first to become a provider</p>
            <Button onClick={() => navigate("/login")}>Login</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Full Name *</label>
                <Input
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Phone Number *</label>
                <Input
                  placeholder="+91 XXXXX XXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Email</label>
                <Input
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Experience (Years)</label>
                <Input
                  type="number"
                  placeholder="e.g. 5"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Address *</label>
              <Textarea
                placeholder="Your full address - locality, landmark..."
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Service Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {serviceCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.title}
                      onClick={() => setForm({ ...form, category: cat.title, services: [] })}
                      className={`border rounded-xl p-3 text-left transition-all flex items-center gap-2 ${
                        form.category === cat.title
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
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
                <label className="text-sm font-medium block mb-2">Select Services You Offer *</label>
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
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {item.label}
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              className="w-full text-base font-semibold"
              size="lg"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register as Service Provider"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderSignup;
