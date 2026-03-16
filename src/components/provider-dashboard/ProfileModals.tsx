import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Home, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProviderProfile {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  category: string | null;
  experience_years: number | null;
  avatar_url: string | null;
  shop_name: string | null;
  services_offered: string[] | null;
}

interface ViewProfileProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  provider: ProviderProfile;
  onEdit: () => void;
}

export const ViewProfileModal = ({ open, onOpenChange, provider, onEdit }: ViewProfileProps) => {
  const initials = provider.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 pb-2">
          <Avatar className="w-20 h-20">
            {provider.avatar_url && <AvatarImage src={provider.avatar_url} />}
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-bold text-foreground">{provider.name}</h3>
          {provider.category && <Badge variant="secondary">{provider.category}</Badge>}
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1"><Home className="w-3 h-3" /> Home Visit</Badge>
            <Badge variant="outline" className="gap-1"><CalendarDays className="w-3 h-3" /> Appointment</Badge>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          {[
            ["Name", provider.name],
            ["Phone", provider.phone],
            ["Email", provider.email],
            ["City", provider.address],
            ["Category", provider.category],
            ["Experience", provider.experience_years ? `${provider.experience_years} years` : null],
            ["Shop", provider.shop_name],
          ].map(([label, value]) => value && (
            <div key={label as string} className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>
        <Button onClick={onEdit} className="w-full mt-2">Edit Profile</Button>
      </DialogContent>
    </Dialog>
  );
};

interface EditProfileProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  provider: ProviderProfile;
  onSaved: () => void;
}

export const EditProfileModal = ({ open, onOpenChange, provider, onSaved }: EditProfileProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: provider.name,
    phone: provider.phone,
    address: provider.address || "",
    experience_years: provider.experience_years || 0,
    shop_name: provider.shop_name || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("service_providers")
      .update(form)
      .eq("id", provider.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      onSaved();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-16 h-16">
              {provider.avatar_url && <AvatarImage src={provider.avatar_url} />}
              <AvatarFallback className="bg-primary text-primary-foreground">
                {provider.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="gap-1">
              <Camera className="w-4 h-4" /> Upload Image
            </Button>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Email (cannot change)</Label>
            <Input value={provider.email || ""} disabled className="bg-muted" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Category (cannot change)</Label>
            <Input value={provider.category || ""} disabled className="bg-muted" />
          </div>

          <div>
            <Label>Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <Label>Experience (years)</Label>
            <Input type="number" min="0" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>Shop Name</Label>
            <Input value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ChangePasswordProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  providerId: string;
}

export const ChangePasswordModal = ({ open, onOpenChange, providerId }: ChangePasswordProps) => {
  const { toast } = useToast();
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = async () => {
    if (newPwd.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPwd !== confirmPwd) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setSaving(true);

    // For provider local auth, update password_hash in service_providers
    const { error } = await supabase
      .from("service_providers")
      .update({ password_hash: newPwd })
      .eq("id", providerId);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password changed successfully!" });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
          </div>
          <div>
            <Label>New Password</Label>
            <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
          </div>
          <Button onClick={handleChange} disabled={saving} className="w-full">
            {saving ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
