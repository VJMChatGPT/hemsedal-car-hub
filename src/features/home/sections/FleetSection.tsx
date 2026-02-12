import { SectionTitle } from "@/features/home/components/SectionTitle";
import { VEHICLES } from "@/features/home/data/vehicles";
import { VehicleCard } from "@/features/home/components/VehicleCard";
import { SECTION_IDS } from "@/constants/site";

export const FleetSection = () => (
  <section id={SECTION_IDS.fleet} className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <SectionTitle
        eyebrow="Our Premium Selection"
        title="Choose Your Perfect Ride"
        description="From luxurious SUVs to eco-friendly electric vehicles, find the ideal car for your Hemsedal adventure. Rent for your trip or purchase your dream car."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {VEHICLES.map((vehicle, index) => (
          <div key={vehicle.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <VehicleCard vehicle={vehicle} />
          </div>
        ))}
      </div>
    </div>
  </section>
);
