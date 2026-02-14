import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Home, Car, Heart, Sparkles, CalendarDays, Banknote, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const serviceCategories = [
  {
    title: "Home Services 🏠",
    icon: Home,
    items: [
      "Plumbing (पाइप leak, पानी की समस्या)",
      "Electrician (short circuit, wiring issue)",
      "Gardener / Maali (लॉन, पेड़‑पौधे की देखभाल)",
      "Cleaning (deep cleaning, sofa wash)",
      "Pest Control (cockroach, termite, mosquito control)",
      "Appliance Repair (AC, fridge, washing machine breakdown)",
      "Painting & Décor",
    ],
  },
  {
    title: "Vehicle Services 🚗",
    icon: Car,
    items: [
      "Emergency Fuel Delivery",
      "Tyre Puncture / Replacement",
      "Battery Jumpstart / Replacement",
      "Towing Service",
      "Car Wash & Detailing",
      "Regular Car/Bike Service",
    ],
  },
  {
    title: "Health Services ❤️",
    icon: Heart,
    items: [
      "Doctor Consultation",
      "Emergency Ambulance Service",
      "Pharmacy / Medicine Delivery",
      "Pathology / Lab Tests",
      "Physiotherapy",
      "Dentist",
      "Nutritionist / Dietician",
    ],
  },
  {
    title: "Spa & Wellness 🌸",
    icon: Sparkles,
    items: [
      "Massage Therapy",
      "Skin Care Treatments",
      "Hair Spa",
      "Aromatherapy",
      "Relaxation Packages",
    ],
  },
  {
    title: "Appointments 📅",
    icon: CalendarDays,
    items: [
      "Salon Booking",
      "Doctor Appointment",
      "Fitness Trainer Session",
      "Tutoring / Education Session",
      "Business Consultation",
    ],
  },
  {
    title: "Finance Services 💰",
    icon: Banknote,
    items: [
      "Banking (branch locator, ATM nearby)",
      "Insurance Agents",
      "Tax Consultants",
      "Loan Services",
      "Investment Advisors",
    ],
  },
  {
    title: "Travel & Emergency 🚨",
    icon: AlertTriangle,
    items: [
      "Roadside Assistance (fuel, tyre, towing, mechanic)",
      "Lost & Found Help (documents, luggage support)",
      "Police Station / Emergency Helpline locator",
      "Fire Station locator",
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
        items: cat.items.filter((item) => item.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.items.length > 0 || cat.title.toLowerCase().includes(q));
  }, [search]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[340px] sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="p-5 pb-3 border-b border-border">
          <SheetTitle className="text-lg font-bold text-foreground">Browse Services</SheetTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {filtered.map((cat, i) => {
              const isOpen = search.trim() ? true : !!openCategories[i];
              const Icon = cat.icon;
              return (
                <Collapsible key={cat.title} open={isOpen} onOpenChange={() => toggleCategory(i)}>
                  <CollapsibleTrigger className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-accent/50 transition-colors text-left">
                    <Icon className="w-5 h-5 text-primary shrink-0" />
                    <span className="flex-1 text-sm font-semibold text-foreground">{cat.title}</span>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-8 pl-3 border-l-2 border-primary/20 space-y-0.5 pb-2">
                      {cat.items.map((item) => (
                        <button
                          key={item}
                          className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent/30 rounded-lg transition-colors"
                          onClick={() => onOpenChange(false)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">No services found</p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ServicesSidebar;
