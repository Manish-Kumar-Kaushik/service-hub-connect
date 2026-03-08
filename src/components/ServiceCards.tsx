import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MapPin, Phone, BadgeCheck } from "lucide-react";
import { searchPlaces, type PlaceResult } from "@/lib/googlePlaces";
import { generateProviders, type ServiceProvider } from "@/lib/mockIndianData";
import { supabase } from "@/integrations/supabase/client";
import type { ServiceItem } from "@/components/sidebar/SidebarData";
import BookingDialog from "@/components/BookingDialog";

interface ServiceCardsProps {
  selectedService: { item: ServiceItem; categoryTitle: string } | null;
}

// Unified provider type for cards
export interface CardProvider {
  id: string;
  name: string;
  phone: string;
  rating: number;
  reviewCount: number;
  address: string;
  imageUrl: string;
  openNow: boolean;
  isRegistered?: boolean;
}

function placeToCardProvider(place: PlaceResult): CardProvider {
  return {
    id: place.id,
    name: place.name,
    phone: "N/A",
    rating: place.rating,
    reviewCount: place.userRatingsTotal,
    address: place.address,
    imageUrl: place.photoUrl || "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop",
    openNow: place.openNow ?? true,
  };
}

function mockToCardProvider(p: ServiceProvider): CardProvider {
  return p;
}

const CardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-card shadow-card border border-border">
    <Skeleton className="w-full h-44" />
    <div className="p-4 space-y-2.5">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

const StarRating = ({ rating, count }: { rating: number; count: number }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
    <span className="text-xs text-muted-foreground">
      {rating.toFixed(1)} ({count})
    </span>
  </div>
);

const ProviderCard = ({
  provider,
  index,
  onSelect,
}: {
  provider: CardProvider;
  index: number;
  onSelect: () => void;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl overflow-hidden bg-card shadow-card border border-border hover:shadow-card-hover transition-all duration-300 cursor-pointer group ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="relative h-44 bg-muted overflow-hidden">
        <img
          src={provider.imageUrl}
          alt={provider.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
            provider.openNow
              ? "bg-green-500/90 text-white"
              : "bg-red-500/90 text-white"
          }`}
        >
          {provider.openNow ? "Open" : "Closed"}
        </span>
        {provider.isRegistered && (
          <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground flex items-center gap-1">
            <BadgeCheck className="w-3 h-3" /> Verified
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {provider.name}
        </h3>
        <StarRating rating={provider.rating} count={provider.reviewCount} />
        {provider.phone !== "N/A" && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone className="w-3 h-3 shrink-0" />
            {provider.phone}
          </p>
        )}
        <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
          <MapPin className="w-3 h-3 shrink-0" />
          {provider.address}
        </p>
      </div>
    </div>
  );
};

const ServiceCards = ({ selectedService }: ServiceCardsProps) => {
  const [providers, setProviders] = useState<CardProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CardProvider | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!selectedService) return;
    setLoading(true);
    setProviders([]);

    const fetchAll = async () => {
      // 1. Fetch registered providers from DB for this service
      const { data: dbProviders } = await supabase
        .from("service_providers")
        .select("*")
        .eq("is_active", true)
        .contains("services_offered", [selectedService.item.label]);

      const registeredCards: CardProvider[] = (dbProviders || []).map((p) => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        rating: 4.5 + Math.random() * 0.5, // Default rating for new providers
        reviewCount: Math.floor(Math.random() * 20) + 1,
        address: p.address || "Bhilai, Chhattisgarh",
        imageUrl: p.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        openNow: true,
        isRegistered: true,
      }));

      // 2. Fetch from Google Places / mock data
      const query = `${selectedService.item.label} in Bhilai Durg Chhattisgarh`;
      let otherCards: CardProvider[] = [];

      try {
        const places = await searchPlaces(query, 12);
        if (places.length > 0) {
          otherCards = places.map(placeToCardProvider);
        } else {
          const data = generateProviders(selectedService.item.label, selectedService.categoryTitle, 12);
          otherCards = data.map(mockToCardProvider);
        }
      } catch {
        const data = generateProviders(selectedService.item.label, selectedService.categoryTitle, 12);
        otherCards = data.map(mockToCardProvider);
      }

      // Registered providers appear first
      setProviders([...registeredCards, ...otherCards]);
      setLoading(false);
    };

    fetchAll();
  }, [selectedService]);

  if (!selectedService) return null;

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {selectedService.item.label}
        </h2>
        <p className="text-muted-foreground mt-1">Top rated services in Bhilai, Durg, Chhattisgarh</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 16 }).map((_, i) => <CardSkeleton key={i} />)
          : providers.map((provider, i) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                index={i}
                onSelect={() => {
                  setSelectedProvider(provider);
                  setDialogOpen(true);
                }}
              />
            ))}
      </div>

      {!loading && providers.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No services found for "{selectedService.item.label}"
        </p>
      )}

      <BookingDialog
        provider={selectedProvider}
        serviceName={selectedService.item.label}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
};

export default ServiceCards;
