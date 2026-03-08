import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Descope } from "@descope/react-sdk";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Shield } from "lucide-react";

const AdminLogin = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        // Not an admin - redirect to home
        navigate("/");
      }
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in with your admin account</p>
        </div>
        <Descope
          flowId="sign-up-or-in"
          onSuccess={() => {
            // Role detection happens in AuthContext, redirect handled by useEffect
          }}
          onError={(e) => console.error("Descope error:", e)}
        />
      </div>
    </div>
  );
};

export default AdminLogin;
