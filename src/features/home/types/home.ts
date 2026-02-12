import { LucideIcon } from "lucide-react";

export interface Vehicle {
  id: number;
  name: string;
  image: string;
  seats: number;
  fuelType: string;
  transmission: string;
  dailyRentPrice: number;
  purchasePrice: number;
  isAvailable: boolean;
  isFeatured?: boolean;
}

export interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ContactDetailsItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

export interface BookingFormValues {
  name: string;
  contact: string;
  notes: string;
}

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}
