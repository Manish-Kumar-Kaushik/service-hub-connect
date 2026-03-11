import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Star, MapPin, Phone, BadgeCheck, Clock, Wrench, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingDialog from "@/components/BookingDialog";
import type { CardProvider } from "@/components/ServiceCards";

const ProviderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("service_providers")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setProvider(data);

        const { data: revs } = await supabase
          .from("reviews")
          .select("*")
          .eq("provider_id", data.id);

        if (revs && revs.length > 0) {
          setReviews(revs);
          const avg = revs.reduce((a, r) => a + r.rating, 0) / revs.length;
          setAvgRating(avg);
          setReviewCount(revs.length);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
          <Skeleton className="w-full h-64 rounded-2xl" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground">Provider not found</h2>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/categories")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  const cardProvider: CardProvider = {
    id: provider.id,
    name: provider.name,
    phone: provider.phone,
    rating: avgRating || 4.5,
    reviewCount,
    address: provider.address || "Bhilai, Chhattisgarh",
    imageUrl: provider.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    openNow: true,
    isRegistered: true,
  };

  const servicesOffered = provider.services_offered || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-4 gap-2 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        {/* Hero Image */}
        <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 bg-muted">
          <img
            src={provider.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop"}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
          {provider.is_verified && (
            <span className="absolute top-4 left-4 text-sm font-semibold px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4" /> Verified Provider
            </span>
          )}
          <span className="absolute top-4 right-4 text-sm font-semibold px-3 py-1.5 rounded-full bg-green-500/90 text-white">
            Open Now
          </span>
        </div>

        {/* Info Section */}
        <div className="mt-6 space-y-6">
          {/* Name & Rating */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{provider.name}</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 shrink-0" />
                {provider.address || "Bhilai, Durg, Chhattisgarh"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-xl">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-foreground">{(avgRating || 4.5).toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="border border-border rounded-xl p-4 text-center">
              <Phone className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-sm font-semibold text-foreground">{provider.phone}</p>
              <p className="text-xs text-muted-foreground">Contact</p>
            </div>
            <div className="border border-border rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-sm font-semibold text-foreground">{provider.experience_years || 0} Years</p>
              <p className="text-xs text-muted-foreground">Experience</p>
            </div>
            <div className="border border-border rounded-xl p-4 text-center col-span-2 sm:col-span-1">
              <Wrench className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-sm font-semibold text-foreground">{servicesOffered.length} Services</p>
              <p className="text-xs text-muted-foreground">Offered</p>
            </div>
          </div>

          {/* Services Description */}
          {servicesOffered.length > 0 && (
            <div className="border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground text-lg mb-3 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" /> Services & Specializations
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {provider.name} specializes in the following services. Contact or book to get expert help:
              </p>
              <div className="flex flex-wrap gap-2">
                {servicesOffered.map((service: string, i: number) => (
                  <span
                    key={i}
                    className="bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-full"
                  >
                    {service}
                  </span>
                ))}
              </div>
              {provider.category && (
                <p className="text-xs text-muted-foreground mt-3">
                  Category: <span className="font-medium text-foreground">{provider.category}</span>
                </p>
              )}
            </div>
          )}

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground text-lg mb-3">Customer Reviews</h3>
              <div className="space-y-3">
                {reviews.slice(0, 5).map((rev) => (
                  <div key={rev.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(rev.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    {rev.comment && <p className="text-sm text-muted-foreground">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Book Now Button */}
          <div className="sticky bottom-4 z-10">
            <Button
              size="lg"
              className="w-full text-base font-semibold gap-2 shadow-lg"
              onClick={() => setDialogOpen(true)}
            >
              <CreditCard className="w-5 h-5" /> Book Now
            </Button>
          </div>
        </div>
      </div>

      <Footer />

      <BookingDialog
        provider={cardProvider}
        serviceName={servicesOffered[0] || provider.category || "Service"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default ProviderDetails;
