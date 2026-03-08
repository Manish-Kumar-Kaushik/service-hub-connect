import { useNavigate } from "react-router-dom";
import { Users, Wrench, ArrowRight, LayoutDashboard, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const RoleSelectionSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isProvider, isAdmin } = useAuth();

  return (
    <section className="py-16 px-4 bg-muted/30" id="roles">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {isAuthenticated && !isProvider && !isAdmin ? "What would you like to do?" : "Who are you?"}
          </h2>
          <p className="text-muted-foreground mt-2">
            {isAuthenticated && !isProvider && !isAdmin
              ? "Browse services or check your bookings"
              : "Book a service as a Customer or earn money as a Service Provider"}
          </p>
        </div>

        <div className={`grid grid-cols-1 ${!isAuthenticated || isAdmin ? "md:grid-cols-2" : ""} gap-6 max-w-xl ${!isAuthenticated || isAdmin ? "max-w-5xl" : ""} mx-auto`}>
          {/* Customer Card */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-card-hover transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {isAuthenticated && !isProvider ? "Browse & Book Services" : "Customer"}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Book any service from home — Plumbing, Electrician, Cleaning, Car Service and much more.
              Pay via Razorpay or choose Cash on Service.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5 mb-6">
              <li>✅ 100+ services available</li>
              <li>✅ Online payment or Cash on Service</li>
              <li>✅ Real-time tracking & notifications</li>
              <li>✅ Describe your problem in detail</li>
            </ul>
            <div className="flex gap-2">
              <Button className="flex-1 gap-2" onClick={() => navigate("/categories")}>
                Browse Services <ArrowRight className="w-4 h-4" />
              </Button>
              {isAuthenticated && !isProvider && !isAdmin && (
                <Button variant="outline" className="gap-2" onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="w-4 h-4" /> My Bookings
                </Button>
              )}
            </div>
          </div>

          {/* Service Provider Card - only show if not logged in as customer */}
          {(!isAuthenticated || isAdmin) && (
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-card-hover transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-accent/50 flex items-center justify-center mb-4 group-hover:bg-accent/70 transition-colors">
                <Wrench className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Service Provider</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Register and get jobs directly from customers.
                Accept jobs, view customer details and provide your service.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1.5 mb-6">
                <li>✅ Direct customer bookings</li>
                <li>✅ Real-time job notifications</li>
                <li>✅ Customer address & problem details</li>
                <li>✅ Cash on Service option available</li>
              </ul>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/provider-signup")}>
                Register as Provider <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RoleSelectionSection;
