import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Clock, MapPin } from "lucide-react";
import { searchPlaces, type PlaceResult } from "@/lib/googlePlaces";
import type { ServiceItem } from "@/components/sidebar/SidebarData";
import BookingDialog from "@/components/BookingDialog";

interface ServiceCardsProps {
  selectedService: ServiceItem | null;
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

const PlaceCard = ({ place, index, onClick }: { place: PlaceResult; index: number; onClick: () => void }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  const todayHours = place.openingHours.length > 0
    ? place.openingHours[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
    : null;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl overflow-hidden bg-card shadow-card border border-border hover:shadow-card-hover transition-all duration-300 cursor-pointer group ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="relative h-44 bg-muted overflow-hidden">
        {place.photoUrl ? (
          <img src={place.photoUrl} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <MapPin className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}
        {place.openNow !== null && (
          <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${place.openNow ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"}`}>
            {place.openNow ? "Open" : "Closed"}
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{place.name}</h3>
        <StarRating rating={place.rating} count={place.userRatingsTotal} />
        {todayHours && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{todayHours}</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
          <MapPin className="w-3 h-3 shrink-0" />
          {place.address}
        </p>
      </div>
    </div>
  );
};

const ServiceCards = ({ selectedService }: ServiceCardsProps) => {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!selectedService) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPlaces([]);

    searchPlaces(selectedService.query, 16)
      .then((results) => { if (!cancelled) { setPlaces(results); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [selectedService]);

  if (!selectedService) return null;

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{selectedService.label}</h2>
        <p className="text-muted-foreground mt-1">Top rated services near you</p>
      </div>

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive text-sm">{error}</p>
          <button
            onClick={() => {
              setLoading(true); setError(null);
              searchPlaces(selectedService.query, 16).then(setPlaces).catch((e) => setError(e.message)).finally(() => setLoading(false));
            }}
            className="mt-3 text-sm text-primary hover:underline"
          >Try again</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 16 }).map((_, i) => <CardSkeleton key={i} />)
          : places.map((place, i) => (
              <PlaceCard key={place.id} place={place} index={i} onClick={() => { setSelectedPlace(place); setDialogOpen(true); }} />
            ))}
      </div>

      {!loading && !error && places.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No services found for "{selectedService.label}"</p>
      )}

      <BookingDialog
        place={selectedPlace}
        serviceName={selectedService.label}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
};

export default ServiceCards;
