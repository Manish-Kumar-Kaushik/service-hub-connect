import {
  Scissors,
  Heart,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Landmark,
  ShoppingCart,
  Building2,
  Home,
  Car,
  Stethoscope,
  PawPrint,
  Users,
  Wrench,
  BookOpen,
  BadgeDollarSign,
} from "lucide-react";

const categories = [
  { name: "Salon & Beauty", icon: Scissors },
  { name: "Barber", icon: Scissors },
  { name: "Spa", icon: Heart },
  { name: "Health & Wellness", icon: Stethoscope },
  { name: "Fitness & Sports", icon: Dumbbell },
  { name: "Professional Services", icon: Briefcase },
  { name: "Tutoring Services", icon: BookOpen },
  { name: "Education & Non-profits", icon: GraduationCap },
  { name: "Banking & Finance", icon: BadgeDollarSign },
  { name: "Retail", icon: ShoppingCart },
  { name: "Real Estate", icon: Building2 },
  { name: "Communities & Facilities", icon: Users },
  { name: "Government & Public Sector", icon: Landmark },
  { name: "Medical Office", icon: Stethoscope },
  { name: "Pet Services", icon: PawPrint },
  { name: "Home Services & Cleaning", icon: Home },
  { name: "Business Operations", icon: Briefcase },
  { name: "Automotive", icon: Car },
];

const CategoriesSection = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            We can serve almost any industry segment
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our appointment booking system is fit for all service-based local businesses, multi-location enterprises, franchises, and more.
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
