import CarCard from "./CarCard";
import volvoXC90 from "@/assets/car-volvo-xc90.jpg";
import teslaY from "@/assets/car-tesla-y.jpg";
import defender from "@/assets/car-defender.jpg";
import audiEtron from "@/assets/car-audi-etron.jpg";
import bmwX5 from "@/assets/car-bmw-x5.jpg";

const cars = [
  {
    id: 1,
    name: "Volvo XC90 T8",
    image: volvoXC90,
    seats: 7,
    fuel: "Hybrid",
    transmission: "Auto",
    rentPrice: 2800,
    salePrice: 1250000,
    available: true,
    featured: true,
  },
  {
    id: 2,
    name: "Tesla Model Y",
    image: teslaY,
    seats: 5,
    fuel: "Electric",
    transmission: "Auto",
    rentPrice: 2200,
    salePrice: 650000,
    available: true,
    featured: false,
  },
  {
    id: 3,
    name: "Land Rover Defender",
    image: defender,
    seats: 5,
    fuel: "Diesel",
    transmission: "Auto",
    rentPrice: 3200,
    salePrice: 1450000,
    available: true,
    featured: true,
  },
  {
    id: 4,
    name: "Audi e-tron GT",
    image: audiEtron,
    seats: 4,
    fuel: "Electric",
    transmission: "Auto",
    rentPrice: 3500,
    salePrice: 1350000,
    available: false,
    featured: false,
  },
  {
    id: 5,
    name: "BMW X5 M50i",
    image: bmwX5,
    seats: 5,
    fuel: "Petrol",
    transmission: "Auto",
    rentPrice: 2900,
    salePrice: 1180000,
    available: true,
    featured: false,
  },
];

const CarGrid = () => {
  return (
    <section id="cars" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-slide-up">
          <p className="text-accent font-medium uppercase tracking-wide mb-2">
            Our Premium Selection
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choose Your Perfect Ride
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From luxurious SUVs to eco-friendly electric vehicles, find the ideal car 
            for your Hemsedal adventure. Rent for your trip or purchase your dream car.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car, index) => (
            <div
              key={car.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CarCard {...car} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarGrid;
