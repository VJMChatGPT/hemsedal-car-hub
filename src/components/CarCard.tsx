import { Users, Fuel, Settings, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CarCardProps {
  name: string;
  image: string;
  seats: number;
  fuel: string;
  transmission: string;
  rentPrice: number;
  salePrice: number;
  available: boolean;
  featured?: boolean;
}

const CarCard = ({
  name,
  image,
  seats,
  fuel,
  transmission,
  rentPrice,
  salePrice,
  available,
  featured,
}: CarCardProps) => {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={`group bg-card rounded-xl overflow-hidden border border-border card-hover ${
        featured ? "ring-2 ring-accent" : ""
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {featured && (
          <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-semibold">
            Featured
          </Badge>
        )}
        {!available && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Currently Rented
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-heading text-xl font-semibold text-card-foreground mb-4">
          {name}
        </h3>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center text-center">
            <Users className="w-5 h-5 text-muted-foreground mb-1" />
            <span className="text-sm text-muted-foreground">{seats} Seats</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Fuel className="w-5 h-5 text-muted-foreground mb-1" />
            <span className="text-sm text-muted-foreground">{fuel}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Settings className="w-5 h-5 text-muted-foreground mb-1" />
            <span className="text-sm text-muted-foreground">{transmission}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Rent per day</span>
            </div>
            <span className="font-semibold text-foreground">
              {rentPrice.toLocaleString()} NOK
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Purchase price</span>
            <span className="font-semibold text-foreground">
              {salePrice.toLocaleString()} NOK
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={scrollToContact}
            disabled={!available}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Rent Now
          </Button>
          <Button
            onClick={scrollToContact}
            variant="outline"
            className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            Buy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
