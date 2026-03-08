import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSession, useUser, useDescope } from "@descope/react-sdk";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "customer" | "provider" | "admin";

interface UserProfile {
  display_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userAvatar: string | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isProvider: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  userName: null,
  userEmail: null,
  userAvatar: null,
  profile: null,
  role: "customer",
  isAdmin: false,
  isProvider: false,
  logout: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user } = useUser();
  const { logout: descopeLogout } = useDescope();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>("customer");

  const userId = user?.userId || null;
  const userName = user?.name || user?.email?.split("@")[0] || null;
  const userEmail = user?.email || null;
  const userAvatar = user?.picture || null;

  const refreshProfile = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setProfile({
        display_name: data.display_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        avatar_url: data.avatar_url,
      });
    }
  };

  const detectRole = async () => {
    if (!userId) {
      setRole("customer");
      return;
    }

    // Check admin first
    const { data: adminData } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (adminData) {
      setRole("admin");
      return;
    }

    // Check provider
    const { data: providerData } = await supabase
      .from("service_providers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (providerData) {
      setRole("provider");
      return;
    }

    setRole("customer");
  };

  useEffect(() => {
    if (isAuthenticated && userId) {
      supabase
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            display_name: userName,
            email: userEmail,
            avatar_url: userAvatar,
          },
          { onConflict: "user_id" }
        )
        .then(() => {
          refreshProfile();
          detectRole();
        });
    } else {
      setProfile(null);
      setRole("customer");
    }
  }, [isAuthenticated, userId]);

  const logout = async () => {
    await descopeLogout();
    setProfile(null);
    setRole("customer");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: isSessionLoading,
        userId,
        userName,
        userEmail,
        userAvatar,
        profile,
        role,
        isAdmin: role === "admin",
        isProvider: role === "provider",
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
