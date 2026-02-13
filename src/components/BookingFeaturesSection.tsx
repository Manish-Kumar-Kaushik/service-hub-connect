import { Clock, ListChecks, ShieldCheck, Users, CalendarCheck } from "lucide-react";

const bookingFeatures = [
  {
    icon: Clock,
    title: "Business Hour Settings",
    description: "You can control business hours at both the staff and service levels giving you the flexibility you need",
  },
  {
    icon: ListChecks,
    title: "Back to Back Bookings",
    description: "Customers selecting multiple services will only be shown times where all chosen services can be availed together",
  },
  {
    icon: ShieldCheck,
    title: "Booking Restrictions",
    description: "Choose how much in advance members can book/cancel, limit the number of bookings by a member, and more",
  },
  {
    icon: Users,
    title: "Group Scheduling",
    description: "Allow customers to schedule and pay for appointments for a group in a single transaction",
  },
  {
    icon: CalendarCheck,
    title: "Recurring Bookings",
    description: "Allow customers to schedule multiple future appointments in one go to ensure repeat business",
  },
];

const BookingFeaturesSection = () => {
  return (
    <section className="py-20 bg-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground max-w-3xl mx-auto leading-snug">
            Flexible booking settings allow you to have complete control over your schedule
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {bookingFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2">{feat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BookingFeaturesSection;
