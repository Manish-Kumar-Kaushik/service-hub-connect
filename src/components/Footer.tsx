import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-14">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <span className="font-bold text-sm text-primary-foreground">Q</span>
              </div>
              <span className="text-lg font-bold">QuickServe</span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Your one-stop platform for booking trusted local services. Fast, reliable, and hassle-free.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "About Us", "Services", "Contact"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4 text-sm">Services</h4>
            <ul className="space-y-2">
              {["Home Services", "Health", "Education", "Electronics", "Shifting"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4 text-sm">Support</h4>
            <ul className="space-y-2">
              {["Help Center", "Privacy Policy", "Terms of Service", "FAQ"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 text-center">
          <p className="text-sm text-primary-foreground/40">
            © {new Date().getFullYear()} QuickServe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
