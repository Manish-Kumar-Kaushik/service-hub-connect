import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import ServicesSidebar from "@/components/ServicesSidebar";
import ServiceCards from "@/components/ServiceCards";
import type { ServiceItem } from "@/components/sidebar/SidebarData";
import { serviceCategories } from "@/components/sidebar/SidebarData";

const Categories = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedService, setSelectedService] = useState<{ item: ServiceItem; categoryTitle: string } | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const handleSelectService = (item: ServiceItem) => {
    // Find the category title for this item
    const cat = serviceCategories.find((c) => c.items.some((i) => i.label === item.label));
    setSelectedService({ item, categoryTitle: cat?.title || "Services" });
    setTimeout(() => {
      cardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Categories</h1>
            <p className="text-muted-foreground mt-1">Browse all service categories</p>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Open Categories
          </button>
        </div>

        <div ref={cardsRef}>
          <ServiceCards selectedService={selectedService} />
        </div>
      </div>

      <ServicesSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        onSelectService={handleSelectService}
      />
    </div>
  );
};

export default Categories;
