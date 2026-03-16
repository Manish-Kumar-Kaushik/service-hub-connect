import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Bell, User, Edit, Lock, HelpCircle, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  providerName: string;
  avatarUrl?: string | null;
  notificationCount: number;
  onViewProfile: () => void;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onNotifications: () => void;
  onLogout: () => void;
}

const DashboardHeader = ({
  providerName,
  avatarUrl,
  notificationCount,
  onViewProfile,
  onEditProfile,
  onChangePassword,
  onNotifications,
  onLogout,
}: DashboardHeaderProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const initials = providerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-nav">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground hidden sm:block">ServiceHub</span>
        </div>

        {/* Center: Greeting */}
        <p className="hidden md:block text-sm text-muted-foreground font-medium">
          {getGreeting()}, <span className="text-foreground font-semibold">{providerName}</span>
        </p>

        {/* Right: Notification + Profile */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative" onClick={onNotifications}>
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="w-8 h-8">
                  {avatarUrl && <AvatarImage src={avatarUrl} />}
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onViewProfile} className="gap-2">
                <User className="w-4 h-4" /> My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEditProfile} className="gap-2">
                <Edit className="w-4 h-4" /> Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onChangePassword} className="gap-2">
                <Lock className="w-4 h-4" /> Change Password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onNotifications} className="gap-2">
                <Bell className="w-4 h-4" /> Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <HelpCircle className="w-4 h-4" /> Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="gap-2 text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
