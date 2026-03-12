import {
  Home, Car, Heart, Sparkles, CalendarDays,
  Wrench, Zap, TreePine, SprayCan, Bug, Refrigerator, Paintbrush,
  Fuel, CircleDot, Battery, Truck, Droplets, Bike,
  Pill, FlaskConical, Activity,
  Hand, Scissors, Flower2,
  Dumbbell, GraduationCap,
  type LucideIcon,
} from "lucide-react";

export type ServiceMode = "home_only" | "both";

export interface ServiceItem {
  label: string;
  icon: LucideIcon;
  query: string;
  serviceMode: ServiceMode;
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
      { label: "Plumbing", icon: Wrench, query: "plumbing services near me", serviceMode: "home_only" },
      { label: "Electrician", icon: Zap, query: "electrician services near me", serviceMode: "home_only" },
      { label: "Gardener / Maali", icon: TreePine, query: "gardener landscaping services near me", serviceMode: "home_only" },
      { label: "Cleaning", icon: SprayCan, query: "cleaning services near me", serviceMode: "home_only" },
      { label: "Pest Control", icon: Bug, query: "pest control services near me", serviceMode: "home_only" },
      { label: "Appliance Repair", icon: Refrigerator, query: "appliance repair services near me", serviceMode: "home_only" },
      { label: "Painting & Décor", icon: Paintbrush, query: "painting decorator services near me", serviceMode: "home_only" },
    ],
  },
  {
    title: "Vehicle Services",
    icon: Car,
    items: [
      { label: "Emergency Fuel Delivery", icon: Fuel, query: "fuel delivery service near me", serviceMode: "home_only" },
      { label: "Tyre Puncture / Replacement", icon: CircleDot, query: "tyre puncture repair near me", serviceMode: "both" },
      { label: "Battery Jumpstart", icon: Battery, query: "car battery jumpstart service near me", serviceMode: "home_only" },
      { label: "Towing Service", icon: Truck, query: "towing service near me", serviceMode: "home_only" },
      { label: "Car Wash & Detailing", icon: Droplets, query: "car wash detailing near me", serviceMode: "both" },
      { label: "Regular Car/Bike Service", icon: Bike, query: "car bike service center near me", serviceMode: "both" },
    ],
  },
  {
    title: "Health & Home Care",
    icon: Heart,
    items: [
      { label: "Medicine Delivery", icon: Pill, query: "pharmacy medicine delivery near me", serviceMode: "home_only" },
      { label: "Lab Test (Home Collection)", icon: FlaskConical, query: "home sample collection lab test near me", serviceMode: "home_only" },
      { label: "Physiotherapy", icon: Activity, query: "physiotherapy near me", serviceMode: "both" },
    ],
  },
  {
    title: "Spa & Wellness",
    icon: Sparkles,
    items: [
      { label: "Massage Therapy", icon: Hand, query: "massage therapy near me", serviceMode: "both" },
      { label: "Skin Care Treatment", icon: Flower2, query: "skin care treatment near me", serviceMode: "both" },
      { label: "Hair Spa & Styling", icon: Scissors, query: "hair spa styling near me", serviceMode: "both" },
    ],
  },
  {
    title: "Beauty & Grooming",
    icon: Scissors,
    items: [
      { label: "Salon (Women)", icon: Scissors, query: "salon service women near me", serviceMode: "both" },
      { label: "Salon (Men / Barber)", icon: Scissors, query: "barber salon men near me", serviceMode: "both" },
      { label: "Bridal Makeup", icon: Sparkles, query: "bridal makeup artist near me", serviceMode: "both" },
      { label: "Mehendi Artist", icon: Flower2, query: "mehendi artist near me", serviceMode: "home_only" },
    ],
  },
  {
    title: "Tutoring & Fitness",
    icon: CalendarDays,
    items: [
      { label: "Home Tutor", icon: GraduationCap, query: "home tutor near me", serviceMode: "home_only" },
      { label: "Personal Fitness Trainer", icon: Dumbbell, query: "fitness trainer near me", serviceMode: "both" },
      { label: "Yoga Instructor", icon: Activity, query: "yoga instructor near me", serviceMode: "both" },
    ],
  },
];
