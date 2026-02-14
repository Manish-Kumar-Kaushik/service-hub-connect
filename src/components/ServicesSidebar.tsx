import { useState, useMemo } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, HelpCircle } from "lucide-react";
import { serviceCategories, type ServiceItem } from "./sidebar/SidebarData";
import SidebarCategory from "./sidebar/SidebarCategory";
import logo from "@/assets/logo.png";

interface ServicesSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectService?: (item: ServiceItem) => void;
}

const ServicesSidebar = ({ open, onOpenChange, onSelectService }: ServicesSidebarProps) => {
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

  const handleSelectItem = (item: ServiceItem) => {
    onSelectService?.(item);
    onOpenChange(false);
  };

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
            {filtered.map((cat, i) => (
              <SidebarCategory
                key={cat.title}
                category={cat}
                isOpen={search.trim() ? true : !!openCategories[i]}
                onToggle={() => toggleCategory(i)}
                onSelectItem={handleSelectItem}
              />
            ))}
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
