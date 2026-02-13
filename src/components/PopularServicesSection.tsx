import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    name: "AC Repair & Service",
    provider: "CoolTech Solutions",
    rating: 4.8,
    reviews: 234,
    location: "Sector 18, Noida",
    price: "₹499",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop",
  },
  {
    name: "Home Deep Cleaning",
    provider: "SparkleClean Pro",
    rating: 4.9,
    reviews: 512,
    location: "Connaught Place, Delhi",
    price: "₹1,299",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
  },
  {
    name: "Electrician",
    provider: "PowerFix India",
    rating: 4.7,
    reviews: 189,
    location: "MG Road, Gurugram",
    price: "₹299",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
  },
  {
    name: "Salon at Home",
    provider: "GlowUp Studio",
    rating: 4.9,
    reviews: 678,
    location: "Indiranagar, Bangalore",
    price: "₹799",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
  },
];

const PopularServicesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Popular <span className="text-gradient">Services</span>
            </h2>
            <p className="text-muted-foreground">Most booked services this week</p>
          </div>
          <Button variant="outline" className="hidden sm:inline-flex">
            View All
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="group rounded-2xl overflow-hidden bg-card shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50"
            >
              <div className="relative overflow-hidden">
                <img
                  src={svc.image}
                  alt={svc.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {svc.price}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-foreground mb-1">{svc.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{svc.provider}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-foreground">{svc.rating}</span>
                  <span className="text-xs text-muted-foreground">({svc.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs">{svc.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularServicesSection;
