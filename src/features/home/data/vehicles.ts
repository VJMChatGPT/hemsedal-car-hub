import volvoXC90Image from "@/assets/car-volvo-xc90.jpg";
import teslaModelYImage from "@/assets/car-tesla-y.jpg";
import defenderImage from "@/assets/car-defender.jpg";
import audiEtronGtImage from "@/assets/car-audi-etron.jpg";
import { Vehicle } from "@/features/home/types/home";

export const VEHICLES: Vehicle[] = [
  {
    id: 1,
    name: "Honda CR-V manual 2003",
    image: volvoXC90Image,
    seats: 5,
    fuelType: "Petrol",
    transmission: "Manual",
    dailyRentPrice: 2800,
    purchasePrice: 1250000,
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: 2,
    name: "Honda CR-V Automático 2004",
    image: teslaModelYImage,
    seats: 5,
    fuelType: "Petrol",
    transmission: "Auto",
    dailyRentPrice: 2200,
    purchasePrice: 650000,
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: 3,
    name: "Volkswagen Passat 2.0 tdi 4motion 2008",
    image: defenderImage,
    seats: 5,
    fuelType: "Diesel",
    transmission: "Manual",
    dailyRentPrice: 3200,
    purchasePrice: 1450000,
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: 4,
    name: "Subaru Forester 2007 Automatico",
    image: audiEtronGtImage,
    seats: 5,
    fuelType: "Petrol",
    transmission: "Auto",
    dailyRentPrice: 3500,
    purchasePrice: 1350000,
    isAvailable: true,
    isFeatured: false,
  },
];
