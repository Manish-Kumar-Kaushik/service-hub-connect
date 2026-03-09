import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LayoutDashboard, Settings, LogOut, Wrench, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const ADMIN_UNLOCK_KEY = "admin_unlock";
const ADMIN_SECRET_PARAM = "unlock";
const ADMIN_SECRET_VALUE = "admin123";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(() => localStorage.getItem(ADMIN_UNLOCK_KEY) === "true");
  const { isAuthenticated, isLoading, userName, userAvatar, role, isAdmin, isProvider, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Secret URL: /?unlock=admin123 to enable, /?unlock=remove to disable
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const val = params.get(ADMIN_SECRET_PARAM);
    if (val === ADMIN_SECRET_VALUE) {
      localStorage.setItem(ADMIN_UNLOCK_KEY, "true");
      setAdminUnlocked(true);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (val === "remove") {
      localStorage.removeItem(ADMIN_UNLOCK_KEY);
      setAdminUnlocked(false);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Secret shortcut: Ctrl+Shift+A to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setAdminUnlocked((prev) => {
          const next = !prev;
          if (next) localStorage.setItem(ADMIN_UNLOCK_KEY, "true");
          else localStorage.removeItem(ADMIN_UNLOCK_KEY);
          return next;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const showAdminAccess = adminUnlocked || isAdmin;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    ...(!isAdmin ? [{ label: "Category", href: "/categories" }] : []),
    { label: "Contact", href: "#contact" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleNavClick = (href: string) => {
    if (href === "/categories") {
      navigate("/categories");
      return;
    }
    if (href.startsWith("#") && location.pathname !== "/") {
      navigate("/" + href);
    }
  };

  const getRoleBadge = () => {
    if (isAdmin) return { label: "Admin", color: "bg-red-100 text-red-700" };
    if (isProvider) return { label: "Provider", color: "bg-accent/10 text-accent" };
    return null;
  };

  const roleBadge = getRoleBadge();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-nav">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Any Where Door" className="h-12 w-auto" />
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.href === "/categories" ? (
                  <button
                    onClick={() => navigate("/categories")}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => handleNavClick(link.href)}
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            {isLoading ? null : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    {userAvatar ? (
                      <img src={userAvatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-border" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {userName?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-foreground">{userName}</span>
                    {roleBadge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {/* Admin menu */}
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="gap-2 cursor-pointer">
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}

                  {/* Provider menu */}
                  {isProvider && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/provider-dashboard")} className="gap-2 cursor-pointer">
                        <Wrench className="w-4 h-4" /> Provider Dashboard
                      </DropdownMenuItem>
                    </>
                  )}

                  {/* Customer menu */}
                  {!isAdmin && !isProvider && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/dashboard")} className="gap-2 cursor-pointer">
                        <LayoutDashboard className="w-4 h-4" /> My Bookings
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuItem onClick={() => navigate("/account")} className="gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" /> Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/login")}>
                  <User className="w-4 h-4" /> Login
                </Button>
                {showAdminAccess && (
                  <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground" onClick={() => navigate("/admin-login")}>
                    <Shield className="w-3.5 h-3.5" /> Admin
                  </Button>
                )}
              </div>
            )}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-background border-t border-border px-4 pb-4 animate-in slide-in-from-top-2">
            <ul className="flex flex-col gap-3 pt-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  {link.href === "/categories" ? (
                    <button
                      onClick={() => { navigate("/categories"); setMobileOpen(false); }}
                      className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => { handleNavClick(link.href); setMobileOpen(false); }}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
            {!isLoading && (
              isAuthenticated ? (
                <div className="space-y-1 mt-3 border-t border-border pt-3">
                  {isAdmin && (
                    <button onClick={() => { navigate("/admin"); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-primary">Admin Dashboard</button>
                  )}
                  {isProvider && (
                    <button onClick={() => { navigate("/provider-dashboard"); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-primary">Provider Dashboard</button>
                  )}
                  {!isAdmin && !isProvider && (
                    <button onClick={() => { navigate("/dashboard"); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-primary">My Bookings</button>
                  )}
                  <button onClick={() => { navigate("/account"); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-primary">Account</button>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm text-destructive hover:text-destructive/80">Logout</button>
                </div>
              ) : (
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => { navigate("/login"); setMobileOpen(false); }}>
                    <User className="w-4 h-4" /> Login
                  </Button>
                </div>
              )
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
