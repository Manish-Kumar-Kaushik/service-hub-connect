import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  service_name: string;
  price: number;
  is_active: boolean;
}

interface MyServicesTabProps {
  providerId: string;
}

const MyServicesTab = ({ providerId }: MyServicesTabProps) => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [form, setForm] = useState({ service_name: "", price: "" });

  const fetchServices = async () => {
    const { data } = await supabase
      .from("provider_services")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });
    setServices((data as Service[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, [providerId]);

  const openAdd = () => {
    setEditService(null);
    setForm({ service_name: "", price: "" });
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditService(s);
    setForm({ service_name: s.service_name, price: String(s.price) });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.service_name || !form.price) {
      toast({ title: "Error", description: "Fill all fields", variant: "destructive" });
      return;
    }
    if (editService) {
      await supabase.from("provider_services").update({
        service_name: form.service_name,
        price: parseFloat(form.price),
      }).eq("id", editService.id);
      toast({ title: "Service updated!" });
    } else {
      await supabase.from("provider_services").insert({
        provider_id: providerId,
        service_name: form.service_name,
        price: parseFloat(form.price),
      });
      toast({ title: "Service added!" });
    }
    setModalOpen(false);
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("provider_services").delete().eq("id", id);
    toast({ title: "Service deleted" });
    fetchServices();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">My Services</h3>
        <Button size="sm" className="gap-1" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : services.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No services added yet</TableCell></TableRow>
            ) : services.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.service_name}</TableCell>
                <TableCell>₹{s.price}</TableCell>
                <TableCell>
                  <Badge className={s.is_active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}>
                    {s.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editService ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Service Name</Label>
              <Input value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} placeholder="e.g. AC Repair" />
            </div>
            <div>
              <Label>Price (₹)</Label>
              <Input type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                onKeyDown={(e) => { if (e.key === "-" || e.key === "e") e.preventDefault(); }}
                placeholder="e.g. 500" />
            </div>
            <Button onClick={handleSave} className="w-full">
              {editService ? "Update Service" : "Add Service"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyServicesTab;
