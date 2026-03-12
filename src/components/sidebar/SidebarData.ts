import {
  Home, Car, Heart, Sparkles, CalendarDays,
  Wrench, Zap, TreePine, SprayCan, Bug, Refrigerator, Paintbrush,
  Fuel, CircleDot, Battery, Truck, Droplets, Bike,
  Pill, FlaskConical, Activity,
  Hand, Scissors, Flower2, Wind,
  Dumbbell, GraduationCap,
  type LucideIcon,
} from "lucide-react";

export interface ServiceItem {
  label: string;
  icon: LucideIcon;
  query: string;
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
    title: "Health & Home Care",
    icon: Heart,
    items: [
      { label: "Medicine Delivery", icon: Pill, query: "pharmacy medicine delivery near me" },
      { label: "Lab Test (Home Collection)", icon: FlaskConical, query: "home sample collection lab test near me" },
      { label: "Physiotherapy (Home Visit)", icon: Activity, query: "home visit physiotherapy near me" },
    ],
  },
  {
    title: "Spa & Wellness (At Home)",
    icon: Sparkles,
    items: [
      { label: "Massage Therapy", icon: Hand, query: "home massage therapy near me" },
      { label: "Skin Care Treatment", icon: Flower2, query: "home skin care treatment near me" },
      { label: "Hair Spa & Styling", icon: Scissors, query: "home hair spa styling near me" },
      { label: "Aromatherapy", icon: Wind, query: "home aromatherapy near me" },
    ],
  },
  {
    title: "Beauty & Grooming (At Home)",
    icon: Scissors,
    items: [
      { label: "Salon at Home (Women)", icon: Scissors, query: "home salon service women near me" },
      { label: "Salon at Home (Men)", icon: Scissors, query: "home salon service men near me" },
      { label: "Bridal Makeup", icon: Sparkles, query: "bridal makeup artist home service near me" },
      { label: "Mehendi Artist", icon: Flower2, query: "mehendi artist home service near me" },
    ],
  },
  {
    title: "Tutoring & Fitness (At Home)",
    icon: CalendarDays,
    items: [
      { label: "Home Tutor", icon: GraduationCap, query: "home tutor near me" },
      { label: "Personal Fitness Trainer", icon: Dumbbell, query: "home personal fitness trainer near me" },
      { label: "Yoga Instructor", icon: Activity, query: "home yoga instructor near me" },
    ],
  },
];
