import {
  Heart,
  GraduationCap,
  Home,
  Smartphone,
  Truck,
  Wrench,
  Scissors,
  ShieldCheck,
  Paintbrush,
  UtensilsCrossed,
} from "lucide-react";

const categories = [
  { name: "Health", icon: Heart, color: "bg-red-50 text-red-500" },
  { name: "Education", icon: GraduationCap, color: "bg-blue-50 text-blue-500" },
  { name: "Home Services", icon: Home, color: "bg-amber-50 text-amber-600" },
  { name: "Electronics", icon: Smartphone, color: "bg-purple-50 text-purple-500" },
  { name: "Shifting", icon: Truck, color: "bg-green-50 text-green-600" },
  { name: "Plumbing", icon: Wrench, color: "bg-cyan-50 text-cyan-600" },
  { name: "Salon & Spa", icon: Scissors, color: "bg-pink-50 text-pink-500" },
  { name: "Security", icon: ShieldCheck, color: "bg-slate-50 text-slate-600" },
  { name: "Painting", icon: Paintbrush, color: "bg-orange-50 text-orange-500" },
  { name: "Catering", icon: UtensilsCrossed, color: "bg-emerald-50 text-emerald-600" },
];

const CategoriesSection = () => {
  return (
    <section id="services" className="py-20 bg-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Browse by <span className="text-gradient">Category</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Explore top-rated services across all categories near you
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-transparent hover:border-primary/10"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-sm font-semibold text-foreground">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
