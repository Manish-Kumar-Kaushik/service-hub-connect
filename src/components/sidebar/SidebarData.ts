import {
  Home, Car, Heart, Sparkles, CalendarDays, Banknote, AlertTriangle,
  Wrench, Zap, TreePine, SprayCan, Bug, Refrigerator, Paintbrush,
  Fuel, CircleDot, Battery, Truck, Droplets, Bike,
  Stethoscope, Ambulance, Pill, FlaskConical, Activity, SmilePlus, Apple,
  Hand, Scissors, Flower2, Wind, Gift,
  UserCheck, Dumbbell, GraduationCap, Briefcase,
  Landmark, Shield, Calculator, CreditCard, TrendingUp,
  MapPin, HelpCircle, Phone, Flame,
  type LucideIcon,
} from "lucide-react";

export interface ServiceItem {
  label: string;
  icon: LucideIcon;
  query: string; // Google Maps search query
}

export interface ServiceCategory {
  title: string;
  icon: LucideIcon;
  items: ServiceItem[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    title: "Home Services",
    icon: Home,
    items: [
      { label: "Plumbing", icon: Wrench, query: "plumbing services near me" },
      { label: "Electrician", icon: Zap, query: "electrician services near me" },
      { label: "Gardener / Maali", icon: TreePine, query: "gardener landscaping services near me" },
      { label: "Cleaning", icon: SprayCan, query: "cleaning services near me" },
      { label: "Pest Control", icon: Bug, query: "pest control services near me" },
      { label: "Appliance Repair", icon: Refrigerator, query: "appliance repair services near me" },
      { label: "Painting & Décor", icon: Paintbrush, query: "painting decorator services near me" },
    ],
  },
  {
    title: "Vehicle Services",
    icon: Car,
    items: [
      { label: "Emergency Fuel Delivery", icon: Fuel, query: "fuel delivery service near me" },
      { label: "Tyre Puncture / Replacement", icon: CircleDot, query: "tyre puncture repair near me" },
      { label: "Battery Jumpstart", icon: Battery, query: "car battery jumpstart service near me" },
      { label: "Towing Service", icon: Truck, query: "towing service near me" },
      { label: "Car Wash & Detailing", icon: Droplets, query: "car wash detailing near me" },
      { label: "Regular Car/Bike Service", icon: Bike, query: "car bike service center near me" },
    ],
  },
  {
    title: "Health Services",
    icon: Heart,
    items: [
      { label: "Doctor Consultation", icon: Stethoscope, query: "doctor clinic near me" },
      { label: "Emergency Ambulance", icon: Ambulance, query: "ambulance emergency service near me" },
      { label: "Pharmacy / Medicine Delivery", icon: Pill, query: "pharmacy medical store near me" },
      { label: "Pathology / Lab Tests", icon: FlaskConical, query: "pathology lab test center near me" },
      { label: "Physiotherapy", icon: Activity, query: "physiotherapy center near me" },
      { label: "Dentist", icon: SmilePlus, query: "dentist dental clinic near me" },
      { label: "Nutritionist / Dietician", icon: Apple, query: "nutritionist dietician near me" },
    ],
  },
  {
    title: "Spa & Wellness",
    icon: Sparkles,
    items: [
      { label: "Massage Therapy", icon: Hand, query: "massage therapy spa near me" },
      { label: "Skin Care Treatments", icon: Flower2, query: "skin care treatment near me" },
      { label: "Hair Spa", icon: Scissors, query: "hair spa salon near me" },
      { label: "Aromatherapy", icon: Wind, query: "aromatherapy wellness near me" },
      { label: "Relaxation Packages", icon: Gift, query: "relaxation spa packages near me" },
    ],
  },
  {
    title: "Appointments",
    icon: CalendarDays,
    items: [
      { label: "Salon Booking", icon: Scissors, query: "beauty salon near me" },
      { label: "Doctor Appointment", icon: Stethoscope, query: "doctor appointment clinic near me" },
      { label: "Fitness Trainer Session", icon: Dumbbell, query: "fitness trainer gym near me" },
      { label: "Tutoring / Education", icon: GraduationCap, query: "tutoring education center near me" },
      { label: "Business Consultation", icon: Briefcase, query: "business consultant near me" },
    ],
  },
  {
    title: "Finance Services",
    icon: Banknote,
    items: [
      { label: "Banking", icon: Landmark, query: "bank branch near me" },
      { label: "Insurance Agents", icon: Shield, query: "insurance agent near me" },
      { label: "Tax Consultants", icon: Calculator, query: "tax consultant near me" },
      { label: "Loan Services", icon: CreditCard, query: "loan service near me" },
      { label: "Investment Advisors", icon: TrendingUp, query: "investment advisor near me" },
    ],
  },
  {
    title: "Travel & Emergency",
    icon: AlertTriangle,
    items: [
      { label: "Roadside Assistance", icon: UserCheck, query: "roadside assistance near me" },
      { label: "Lost & Found Help", icon: HelpCircle, query: "lost and found service near me" },
      { label: "Police / Emergency Helpline", icon: Phone, query: "police station near me" },
      { label: "Fire Station Locator", icon: Flame, query: "fire station near me" },
      { label: "Nearby Services Map", icon: MapPin, query: "emergency services near me" },
    ],
  },
];
