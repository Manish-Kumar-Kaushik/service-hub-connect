import { useNavigate } from "react-router-dom";
import { Users, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const RoleSelectionSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 bg-muted/30" id="roles">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Aap kaun hain?
          </h2>
          <p className="text-muted-foreground mt-2">
            Customer ke roop mein service book karein ya Service Provider ban kar kamayein
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Card */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-card-hover transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Customer</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Ghar baithe koi bhi service book karein — Plumbing, Electrician, Cleaning, Car Service aur bahut kuch. 
              Razorpay se pay karein ya Cash on Service choose karein.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5 mb-6">
              <li>✅ 100+ services available</li>
              <li>✅ Online payment ya Cash on Service</li>
              <li>✅ Real-time tracking & notifications</li>
              <li>✅ Problem description likh kar bhejein</li>
            </ul>
            <Button className="w-full gap-2" onClick={() => navigate("/categories")}>
              Browse Services <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Service Provider Card */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-card-hover transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-accent/50 flex items-center justify-center mb-4 group-hover:bg-accent/70 transition-colors">
              <Wrench className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Service Provider</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Register karein aur directly customers se jobs paayein. 
              Job accept karein, customer details dekhein aur service provide karein.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5 mb-6">
              <li>✅ Direct customer bookings</li>
              <li>✅ Real-time job notifications</li>
              <li>✅ Customer ka address & problem details</li>
              <li>✅ Cash on Service option available</li>
            </ul>
            <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/provider-signup")}>
              Register as Provider <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleSelectionSection;
