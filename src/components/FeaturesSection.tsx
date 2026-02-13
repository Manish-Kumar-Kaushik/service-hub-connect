import {
  CalendarCheck,
  Bell,
  Smartphone,
  CreditCard,
  Plug,
  Users,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Accept Online Booking",
    description: "Customers can book appointments 24/7 from anywhere with real-time availability.",
  },
  {
    icon: Bell,
    title: "Notification via WhatsApp, SMS & Email",
    description: "Automated reminders and updates keep everyone in the loop instantly.",
  },
  {
    icon: Smartphone,
    title: "Client & Admin App",
    description: "Dedicated dashboards for both service providers and customers.",
  },
  {
    icon: CreditCard,
    title: "Accept Payment",
    description: "Secure online payments via Razorpay or cash on service — customer's choice.",
  },
  {
    icon: Plug,
    title: "Integration & API",
    description: "Seamlessly connect with Google Maps, payment gateways, and more.",
  },
  {
    icon: Users,
    title: "Customer Features",
    description: "Profile management, booking history, favorites, and personalized recommendations.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="about" className="py-20 bg-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Our <span className="text-gradient">Features</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Everything you need to manage and grow your service business
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 group border border-border/50"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
