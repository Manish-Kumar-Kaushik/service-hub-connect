import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Basic",
    price: "Free",
    period: "",
    description: "Get started with essential features",
    features: [
      "Browse all services",
      "Book up to 3 services/month",
      "Basic customer support",
      "Standard notifications",
    ],
    highlighted: false,
  },
  {
    name: "Monthly",
    price: "₹299",
    period: "/month",
    description: "Most popular for regular users",
    features: [
      "Unlimited bookings",
      "Priority customer support",
      "WhatsApp notifications",
      "Exclusive deals & discounts",
      "Booking history & analytics",
    ],
    highlighted: true,
  },
  {
    name: "Yearly",
    price: "₹2,499",
    period: "/year",
    description: "Best value — save 30%",
    features: [
      "Everything in Monthly",
      "Dedicated account manager",
      "Early access to new services",
      "Free cancellation anytime",
      "Premium badge on profile",
      "Cashback rewards",
    ],
    highlighted: false,
  },
];

const MembershipSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Membership <span className="text-gradient">Plans</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose a plan that fits your needs and unlock premium benefits
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-7 transition-all duration-300 border ${
                plan.highlighted
                  ? "bg-gradient-hero text-primary-foreground border-transparent shadow-card-hover scale-105"
                  : "bg-card text-foreground border-border/50 shadow-card hover:shadow-card-hover"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <p className={`text-sm mb-4 ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-accent" : "text-accent"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full rounded-xl ${
                  plan.highlighted
                    ? "bg-background text-foreground hover:bg-background/90"
                    : "bg-gradient-cta text-primary-foreground hover:opacity-90"
                }`}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;
