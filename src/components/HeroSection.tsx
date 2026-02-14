import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import ServicesSidebar from "./ServicesSidebar";

const serviceImages = [
  { src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=500&fit=crop", alt: "Home cleaning" },
  { src: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=350&fit=crop", alt: "AC repair" },
  { src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=450&fit=crop", alt: "Salon service" },
  { src: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=380&fit=crop", alt: "Electrician" },
  { src: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=500&fit=crop", alt: "Plumbing" },
  { src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=350&fit=crop", alt: "Painting" },
  { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=420&fit=crop", alt: "Real estate" },
  { src: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=480&fit=crop", alt: "Education" },
  { src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=370&fit=crop", alt: "Fitness" },
  { src: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=440&fit=crop", alt: "Health" },
  { src: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=360&fit=crop", alt: "Moving" },
  { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop", alt: "Professional" },
];

const rotatingTexts = ["Home Service", "Health Checkup", "Salon & Spa", "Education"];

const HeroSection = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Pinterest-style grid background */}
      <div className="absolute inset-0 flex justify-center">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 opacity-40 w-full max-w-7xl">
          {serviceImages.map((img, i) => (
            <div
              key={i}
              className={`rounded-2xl overflow-hidden ${i % 3 === 0 ? "row-span-2" : ""}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-2">
          Book your next
        </h1>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary leading-tight mb-6">
          {rotatingTexts[0]}
        </h2>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {rotatingTexts.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === 0 ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Book Now button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-2xl text-lg font-bold shadow-lg transition-all hover:scale-105 inline-flex items-center gap-3"
        >
          <CalendarCheck className="w-6 h-6" />
          Book Now
        </button>
      </div>

      <ServicesSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </section>
  );
};

export default HeroSection;
