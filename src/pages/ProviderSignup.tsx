import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wrench, Shield, Star, Users, Briefcase, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const ProviderSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const storedId = localStorage.getItem("dummy_provider_id");
    if (storedId) {
      navigate("/provider-dashboard");
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({ title: "Required", description: "Email aur Password daalo.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      // Find provider by email and password
      const { data: provider, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("email", email)
        .eq("password_hash", password)
        .maybeSingle();

      if (error) throw error;

      if (!provider) {
        toast({ title: "Login Failed", description: "Galat email ya password. Check karke dobara try karo.", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Check verification status
      if (provider.verification_status === "pending") {
        toast({
          title: "⏳ Account Under Verification",
          description: "Aapka account abhi verify ho raha hai. 2-3 working days mein approved ho jayega.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (provider.verification_status === "rejected") {
        toast({
          title: "❌ Account Rejected",
          description: "Aapka account Admin ne reject kar diya hai. Kripya details check karo.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Approved - proceed to login
      localStorage.setItem("dummy_provider_id", provider.user_id);
      localStorage.setItem("dummy_provider_name", provider.name);
      toast({ title: `Welcome, ${provider.name}! 🎉`, description: "Login successful. Dashboard pe redirect ho rahe ho..." });
      setTimeout(() => navigate("/provider-dashboard"), 800);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Users, text: "Direct customer connections" },
    { icon: Briefcase, text: "Manage your own schedule" },
    { icon: Star, text: "Build your reputation" },
    { icon: Shield, text: "Verified provider badge" },
  ];

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
                <h1 className="text-2xl md:text-3xl font-bold">Service Provider Portal</h1>
                <p className="text-primary-foreground/80 mt-1">Join our network and grow your business</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                  <b.icon className="w-4 h-4" />
                  {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-card border-border/50">
            <CardContent className="pt-6 pb-6">
              <div className="space-y-5">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <LogIn className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Provider Login</h2>
                  <p className="text-sm text-muted-foreground mt-1">Apne account mein login karo</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
                  <Input
                    placeholder="aapka@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
                  <div className="relative">
                    <Input
                      placeholder="Password daalo"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button className="w-full gap-2 text-base" size="lg" onClick={handleLogin} disabled={loading}>
                  <LogIn className="w-4 h-4" />
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => navigate("/provider-register")}
                >
                  <UserPlus className="w-4 h-4" /> Register Here
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Naya provider hai? Register karo aur apni services list karo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProviderSignup;
