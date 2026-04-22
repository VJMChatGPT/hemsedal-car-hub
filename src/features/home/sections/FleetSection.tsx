import { useEffect, useState } from "react";
import { SectionTitle } from "@/features/home/components/SectionTitle";
import { VEHICLES } from "@/features/home/data/vehicles";
import { VehicleCard } from "@/features/home/components/VehicleCard";
import { fetchPublicCars } from "@/features/home/services/carService";
import { Vehicle } from "@/features/home/types/home";
import { SECTION_IDS } from "@/constants/site";
import { SiteContentMap, getSiteText } from "@/features/home/content/siteContent";

interface FleetSectionProps {
  content: SiteContentMap;
}

export const FleetSection = ({ content }: FleetSectionProps) => {
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
          eyebrow={getSiteText(content, "fleet.eyebrow")}
          title={getSiteText(content, "fleet.title")}
          description={getSiteText(content, "fleet.description")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle, index) => (
            <div key={vehicle.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <VehicleCard vehicle={vehicle} content={content} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
