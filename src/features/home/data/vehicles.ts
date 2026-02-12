import volvoXC90Image from "@/assets/car-volvo-xc90.jpg";
import teslaModelYImage from "@/assets/car-tesla-y.jpg";
import defenderImage from "@/assets/car-defender.jpg";
import audiEtronGtImage from "@/assets/car-audi-etron.jpg";
import bmwX5Image from "@/assets/car-bmw-x5.jpg";
import { Vehicle } from "@/features/home/types/home";

export const VEHICLES: Vehicle[] = [
  {
    id: 1,
    name: "Volvo XC90 T8",
    image: volvoXC90Image,
    seats: 7,
    fuelType: "Hybrid",
    transmission: "Auto",
    dailyRentPrice: 2800,
    purchasePrice: 1250000,
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: 2,
    name: "Tesla Model Y",
    image: teslaModelYImage,
    seats: 5,
    fuelType: "Electric",
    transmission: "Auto",
    dailyRentPrice: 2200,
    purchasePrice: 650000,
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: 3,
    name: "Land Rover Defender",
    image: defenderImage,
    seats: 5,
    fuelType: "Diesel",
    transmission: "Auto",
    dailyRentPrice: 3200,
    purchasePrice: 1450000,
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: 4,
    name: "Audi e-tron GT",
    image: audiEtronGtImage,
    seats: 4,
    fuelType: "Electric",
    transmission: "Auto",
    dailyRentPrice: 3500,
    purchasePrice: 1350000,
    isAvailable: false,
    isFeatured: false,
  },
  {
    id: 5,
    name: "BMW X5 M50i",
    image: bmwX5Image,
    seats: 5,
    fuelType: "Petrol",
    transmission: "Auto",
    dailyRentPrice: 2900,
    purchasePrice: 1180000,
    isAvailable: true,
    isFeatured: false,
  },
];
