import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

import CategoriesSection from "@/components/CategoriesSection";
import PopularServicesSection from "@/components/PopularServicesSection";
import FeaturesSection from "@/components/FeaturesSection";
import BookingFeaturesSection from "@/components/BookingFeaturesSection";
import MembershipSection from "@/components/MembershipSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <RoleSelectionSection />
      <CategoriesSection />
      <PopularServicesSection />
      <FeaturesSection />
      <BookingFeaturesSection />
      <MembershipSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
