import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LiveTrackingMapProps {
  bookingId: string;
  customerAddress?: string | null;
}

const LiveTrackingMap = ({ bookingId, customerAddress }: LiveTrackingMapProps) => {
  const [providerLocation, setProviderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<string>("Waiting for provider location...");
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for realtime location updates on booking
    const channel = supabase
      .channel(`tracking-${bookingId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings", filter: `id=eq.${bookingId}` },
        (payload: any) => {
          const { provider_lat, provider_lng, status: bookingStatus } = payload.new;
          if (provider_lat && provider_lng) {
            setProviderLocation({ lat: provider_lat, lng: provider_lng });
            setStatus("Provider is on the way!");
          }
          if (bookingStatus === "completed") {
            setStatus("Service completed!");
          }
        }
      )
      .subscribe();

    // Also fetch initial location
    fetchLocation();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  const fetchLocation = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("provider_lat, provider_lng, status")
      .eq("id", bookingId)
      .single();

    if (data?.provider_lat && data?.provider_lng) {
      setProviderLocation({ lat: data.provider_lat, lng: data.provider_lng });
      setStatus("Provider is on the way!");
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary animate-pulse" />
          <p className="text-sm font-medium text-foreground">Live Tracking</p>
        </div>
        <span className="text-xs text-muted-foreground">{status}</span>
      </div>

      <div ref={mapRef} className="h-48 bg-muted relative flex items-center justify-center">
        {providerLocation ? (
          <div className="text-center space-y-2">
            <div className="relative inline-block">
              <MapPin className="w-10 h-10 text-primary animate-bounce" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary/30 rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground">
              Provider at: {providerLocation.lat.toFixed(4)}, {providerLocation.lng.toFixed(4)}
            </p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p className="text-xs text-muted-foreground">
              Waiting for provider to share location...
            </p>
          </div>
        )}
      </div>

      {customerAddress && (
        <div className="p-3 border-t border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Destination: {customerAddress}
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;
