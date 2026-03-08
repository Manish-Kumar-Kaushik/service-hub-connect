import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProviderLocationSharerProps {
  bookingId: string;
}

const ProviderLocationSharer = ({ bookingId }: ProviderLocationSharerProps) => {
  const { toast } = useToast();
  const [sharing, setSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation not supported", variant: "destructive" });
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        await supabase
          .from("bookings")
          .update({
            provider_lat: pos.coords.latitude,
            provider_lng: pos.coords.longitude,
          })
          .eq("id", bookingId);
      },
      (err) => {
        toast({ title: "Location Error", description: err.message, variant: "destructive" });
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    setWatchId(id);
    setSharing(true);
    toast({ title: "📍 Location sharing started" });
  }, [bookingId]);

  const stopSharing = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    setWatchId(null);
    setSharing(false);
    toast({ title: "Location sharing stopped" });
  }, [watchId]);

  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  return (
    <div className="flex gap-2">
      {!sharing ? (
        <Button size="sm" variant="outline" className="gap-1.5" onClick={startSharing}>
          <Navigation className="w-3.5 h-3.5" /> Share Location
        </Button>
      ) : (
        <Button size="sm" variant="outline" className="gap-1.5 text-destructive" onClick={stopSharing}>
          <StopCircle className="w-3.5 h-3.5" /> Stop Sharing
        </Button>
      )}
    </div>
  );
};

export default ProviderLocationSharer;
