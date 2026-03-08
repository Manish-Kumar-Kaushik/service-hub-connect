import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Wrench, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

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
  const [textIndex, setTextIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Pinterest-style grid background */}
      <div className="absolute inset-0 flex justify-center">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 opacity-40 w-full max-w-7xl">
          {serviceImages.map((img, i) => (
            <div key={i} className={`rounded-2xl overflow-hidden ${i % 3 === 0 ? "row-span-2" : ""}`}>
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
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
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary leading-tight mb-6 transition-all duration-500">
          {rotatingTexts[textIndex]}
        </h2>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {rotatingTexts.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === textIndex ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <p className="text-muted-foreground text-lg mb-8">
          Explore categories to find the best services near you
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="gap-2 px-8 text-base" onClick={() => navigate("/categories")}>
            Browse Services <ArrowRight className="w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" className="gap-2 px-8 text-base" onClick={() => navigate("/provider-signup")}>
            <Wrench className="w-5 h-5" /> Register as Provider
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
