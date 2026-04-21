import { supabase } from "@/integrations/supabase/client";
import { VEHICLES } from "@/features/home/data/vehicles";
import { Vehicle } from "@/features/home/types/home";

type DbCar = {
  code: number | null;
  name: string;
  image_url: string | null;
  seats: number | null;
  fuel_type: string | null;
  transmission: string | null;
  daily_rent_price: number | null;
  purchase_price: number | null;
  featured: boolean | null;
  active: boolean;
};

const fallbackByCode = new Map(VEHICLES.map((vehicle) => [vehicle.id, vehicle]));

const mapDbCarToVehicle = (car: DbCar): Vehicle | null => {
  if (!car.code) {
    return null;
  }

  const fallback = fallbackByCode.get(car.code);

  return {
    id: car.code,
    name: car.name,
    image: car.image_url || fallback?.image || "",
    seats: car.seats ?? fallback?.seats ?? 5,
    fuelType: car.fuel_type || fallback?.fuelType || "Petrol",
    transmission: car.transmission || fallback?.transmission || "Manual",
    dailyRentPrice: Number(car.daily_rent_price ?? fallback?.dailyRentPrice ?? 0),
    purchasePrice: Number(car.purchase_price ?? fallback?.purchasePrice ?? 0),
    isAvailable: car.active,
    isFeatured: car.featured ?? fallback?.isFeatured ?? false,
  };
};

export const fetchPublicCars = async () => {
  const { data, error } = await supabase
    .from("cars")
    .select("code,name,image_url,seats,fuel_type,transmission,daily_rent_price,purchase_price,featured,active")
    .eq("active", true)
    .order("code", { ascending: true });

  if (error) {
    console.error("No se pudieron cargar los coches desde Supabase", error);
    return VEHICLES;
  }

  const cars = (data ?? []).map(mapDbCarToVehicle).filter((car): car is Vehicle => Boolean(car));

  return cars.length > 0 ? cars : VEHICLES;
};
