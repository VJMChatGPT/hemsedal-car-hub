import { useEffect, useState } from "react";
import { SectionTitle } from "@/features/home/components/SectionTitle";
import { VEHICLES } from "@/features/home/data/vehicles";
import { VehicleCard } from "@/features/home/components/VehicleCard";
import { fetchPublicCars } from "@/features/home/services/carService";
import { Vehicle } from "@/features/home/types/home";
import { SECTION_IDS } from "@/constants/site";

export const FleetSection = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES);

  useEffect(() => {
    let isMounted = true;

    fetchPublicCars().then((cars) => {
      if (isMounted) {
        setVehicles(cars);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id={SECTION_IDS.fleet} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <SectionTitle
          eyebrow="Our Premium Selection"
          title="Choose Your Perfect Ride"
          description="From luxurious SUVs to eco-friendly electric vehicles, find the ideal car for your Dal Motorer adventure. Rent for your trip or purchase your dream car."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle, index) => (
            <div key={vehicle.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <VehicleCard vehicle={vehicle} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
