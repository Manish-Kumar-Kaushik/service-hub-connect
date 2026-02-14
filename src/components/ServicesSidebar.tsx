import { useState, useMemo } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Home,
  Car,
  Heart,
  Sparkles,
  CalendarDays,
  Banknote,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Wrench,
  Zap,
  TreePine,
  SprayCan,
  Bug,
  Refrigerator,
  Paintbrush,
  Fuel,
  CircleDot,
  Battery,
  Truck,
  Droplets,
  Bike,
  Stethoscope,
  Ambulance,
  Pill,
  FlaskConical,
  Activity,
  SmilePlus,
  Apple,
  Hand,
  Scissors,
  Flower2,
  Wind,
  Gift,
  UserCheck,
  Dumbbell,
  GraduationCap,
  Briefcase,
  Landmark,
  Shield,
  Calculator,
  CreditCard,
  TrendingUp,
  MapPin,
  HelpCircle,
  Phone,
  Flame,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import logo from "@/assets/logo.png";

const serviceCategories = [
  {
    title: "Home Services",
    icon: Home,
    items: [
      { label: "Plumbing", icon: Wrench },
      { label: "Electrician", icon: Zap },
      { label: "Gardener / Maali", icon: TreePine },
      { label: "Cleaning", icon: SprayCan },
      { label: "Pest Control", icon: Bug },
      { label: "Appliance Repair", icon: Refrigerator },
      { label: "Painting & Décor", icon: Paintbrush },
    ],
  },
  {
    title: "Vehicle Services",
    icon: Car,
    items: [
      { label: "Emergency Fuel Delivery", icon: Fuel },
      { label: "Tyre Puncture / Replacement", icon: CircleDot },
      { label: "Battery Jumpstart", icon: Battery },
      { label: "Towing Service", icon: Truck },
      { label: "Car Wash & Detailing", icon: Droplets },
      { label: "Regular Car/Bike Service", icon: Bike },
    ],
  },
  {
    title: "Health Services",
    icon: Heart,
    items: [
      { label: "Doctor Consultation", icon: Stethoscope },
      { label: "Emergency Ambulance", icon: Ambulance },
      { label: "Pharmacy / Medicine Delivery", icon: Pill },
      { label: "Pathology / Lab Tests", icon: FlaskConical },
      { label: "Physiotherapy", icon: Activity },
      { label: "Dentist", icon: SmilePlus },
      { label: "Nutritionist / Dietician", icon: Apple },
    ],
  },
  {
    title: "Spa & Wellness",
    icon: Sparkles,
    items: [
      { label: "Massage Therapy", icon: Hand },
      { label: "Skin Care Treatments", icon: Flower2 },
      { label: "Hair Spa", icon: Scissors },
      { label: "Aromatherapy", icon: Wind },
      { label: "Relaxation Packages", icon: Gift },
    ],
  },
  {
    title: "Appointments",
    icon: CalendarDays,
    items: [
      { label: "Salon Booking", icon: Scissors },
      { label: "Doctor Appointment", icon: Stethoscope },
      { label: "Fitness Trainer Session", icon: Dumbbell },
      { label: "Tutoring / Education", icon: GraduationCap },
      { label: "Business Consultation", icon: Briefcase },
    ],
  },
  {
    title: "Finance Services",
    icon: Banknote,
    items: [
      { label: "Banking", icon: Landmark },
      { label: "Insurance Agents", icon: Shield },
      { label: "Tax Consultants", icon: Calculator },
      { label: "Loan Services", icon: CreditCard },
      { label: "Investment Advisors", icon: TrendingUp },
    ],
  },
  {
    title: "Travel & Emergency",
    icon: AlertTriangle,
    items: [
      { label: "Roadside Assistance", icon: UserCheck },
      { label: "Lost & Found Help", icon: HelpCircle },
      { label: "Police / Emergency Helpline", icon: Phone },
      { label: "Fire Station Locator", icon: Flame },
      { label: "Nearby Services Map", icon: MapPin },
    ],
  },
];

interface ServicesSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ServicesSidebar = ({ open, onOpenChange }: ServicesSidebarProps) => {
  const [search, setSearch] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});

  const toggleCategory = (index: number) => {
    setOpenCategories((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return serviceCategories;
    const q = search.toLowerCase();
    return serviceCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.label.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.items.length > 0 || cat.title.toLowerCase().includes(q));
  }, [search]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] sm:w-[300px] p-0 flex flex-col bg-background border-r border-border">
        {/* Logo */}
        <div className="px-5 pt-5 pb-3">
          <img src={logo} alt="Any Where Door" className="h-10 w-auto" />
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-muted/50 border-none"
            />
          </div>
        </div>

        {/* Categories */}
        <ScrollArea className="flex-1">
          <nav className="px-3 pb-4 space-y-0.5">
            {filtered.map((cat, i) => {
              const isOpen = search.trim() ? true : !!openCategories[i];
              const CatIcon = cat.icon;
              return (
                <Collapsible key={cat.title} open={isOpen} onOpenChange={() => toggleCategory(i)}>
                  <CollapsibleTrigger className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors text-left group">
                    <CatIcon className="w-[18px] h-[18px] text-foreground shrink-0" />
                    <span className="flex-1 text-sm font-medium text-foreground">{cat.title}</span>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-4 space-y-0.5 py-0.5">
                      {cat.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <button
                            key={item.label}
                            className="flex items-center gap-3 w-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-colors"
                            onClick={() => onOpenChange(false)}
                          >
                            <ItemIcon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">No services found</p>
            )}
          </nav>
        </ScrollArea>

        {/* Bottom section */}
        <div className="border-t border-border px-3 py-3 space-y-0.5">
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors text-sm text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-[18px] h-[18px]" />
            <span>Support</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ServicesSidebar;
