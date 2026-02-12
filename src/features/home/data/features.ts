import { Award, Clock, MapPin, Shield } from "lucide-react";
import { FeatureCard } from "@/features/home/types/home";

export const COMPANY_FEATURES: FeatureCard[] = [
  {
    icon: Shield,
    title: "Fully Insured",
    description: "All our vehicles come with comprehensive insurance coverage for your peace of mind.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock assistance available for any issues during your rental period.",
  },
  {
    icon: MapPin,
    title: "Local Experts",
    description: "We know Hemsedal inside out and can recommend the best routes and destinations.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Every car in our fleet is meticulously maintained to the highest standards.",
  },
];
