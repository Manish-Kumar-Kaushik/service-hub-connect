import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Professional home services"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-4">
            Book Trusted Local
            <span className="block text-accent">Services Instantly</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-lg">
            From home repairs to health checkups — find, compare & book top-rated professionals near you.
          </p>

          {/* Search Bar */}
          <div className="bg-background rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-card-hover max-w-xl">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search for a service..."
                className="w-full py-3 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 px-3 border-t sm:border-t-0 sm:border-l border-border">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Your location"
                className="w-full py-3 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
              />
            </div>
            <Button className="bg-gradient-cta hover:opacity-90 text-primary-foreground px-8 rounded-xl shrink-0">
              Search
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-10">
            {[
              { value: "10K+", label: "Service Providers" },
              { value: "50K+", label: "Happy Customers" },
              { value: "100+", label: "Cities" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-primary-foreground">{stat.value}</p>
                <p className="text-sm text-primary-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
