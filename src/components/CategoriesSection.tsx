import {
  Wrench,
  Zap,
  SprayCan,
  Bug,
  Refrigerator,
  Paintbrush,
  Car,
  Droplets,
  Heart,
  Sparkles,
  Scissors,
  Hand,
  Dumbbell,
  GraduationCap,
  TreePine,
  Pill,
  Activity,
  Flower2,
} from "lucide-react";

const categories = [
  { name: "Plumbing", icon: Wrench },
  { name: "Electrician", icon: Zap },
  { name: "Cleaning", icon: SprayCan },
  { name: "Pest Control", icon: Bug },
  { name: "Appliance Repair", icon: Refrigerator },
  { name: "Painting & Décor", icon: Paintbrush },
  { name: "Gardener / Maali", icon: TreePine },
  { name: "Car Wash & Detailing", icon: Droplets },
  { name: "Vehicle Repair", icon: Car },
  { name: "Medicine Delivery", icon: Pill },
  { name: "Physiotherapy", icon: Activity },
  { name: "Home Care", icon: Heart },
  { name: "Spa & Massage", icon: Hand },
  { name: "Skin Care", icon: Sparkles },
  { name: "Salon at Home", icon: Scissors },
  { name: "Mehendi Artist", icon: Flower2 },
  { name: "Fitness Trainer", icon: Dumbbell },
  { name: "Home Tutor", icon: GraduationCap },
];

const CategoriesSection = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Services at Your Doorstep
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Book trusted service providers who come to your location — home repairs, beauty, wellness, tutoring and more.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 max-w-5xl mx-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                className="group flex flex-col items-center gap-3 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs font-medium text-muted-foreground text-center leading-tight group-hover:text-foreground transition-colors">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
