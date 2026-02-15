import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Descope } from "@descope/react-sdk";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate("/");
  }, [isLoading, isAuthenticated]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 max-w-md mx-auto">
        <Descope
          flowId="sign-up-or-in"
          onSuccess={() => navigate("/")}
          onError={(e) => console.error("Descope error:", e)}
        />
      </div>
    </div>
  );
};

export default Login;
