import { Calendar, Fuel, Settings, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SECTION_IDS } from "@/constants/site";
import { SiteContentMap, getSiteText } from "@/features/home/content/siteContent";
import { Vehicle } from "@/features/home/types/home";
import { formatNorwegianCurrency } from "@/utils/format";
import { scrollToSectionById } from "@/utils/scroll";

interface VehicleCardProps {
  vehicle: Vehicle;
  content: SiteContentMap;
}

export const VehicleCard = ({ vehicle, content }: VehicleCardProps) => (
  <div
    className={`group bg-card rounded-xl overflow-hidden border border-border card-hover ${
      vehicle.isFeatured ? "ring-2 ring-accent" : ""
    }`}
  >
    <div className="relative aspect-[4/3] overflow-hidden">
      <img
        src={vehicle.image}
        alt={vehicle.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {vehicle.isFeatured && (
        <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-semibold">
          {getSiteText(content, "vehicle.featured_badge")}
        </Badge>
      )}
      {!vehicle.isAvailable && (
        <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {getSiteText(content, "vehicle.unavailable_badge")}
          </Badge>
        </div>
      )}
    </div>

    <div className="p-6">
      <h3 className="font-heading text-xl font-semibold text-card-foreground mb-4">{vehicle.name}</h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col items-center text-center">
          <Users className="w-5 h-5 text-muted-foreground mb-1" />
          <span className="text-sm text-muted-foreground">{vehicle.seats} {getSiteText(content, "vehicle.seats_label")}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Fuel className="w-5 h-5 text-muted-foreground mb-1" />
          <span className="text-sm text-muted-foreground">{vehicle.fuelType}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Settings className="w-5 h-5 text-muted-foreground mb-1" />
          <span className="text-sm text-muted-foreground">{vehicle.transmission}</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{getSiteText(content, "vehicle.rent_per_day")}</span>
          </div>
          <span className="font-semibold text-foreground">{formatNorwegianCurrency(vehicle.dailyRentPrice)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">{getSiteText(content, "vehicle.purchase_price")}</span>
          <span className="font-semibold text-foreground">{formatNorwegianCurrency(vehicle.purchasePrice)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => scrollToSectionById(SECTION_IDS.contact)}
          disabled={!vehicle.isAvailable}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {getSiteText(content, "vehicle.rent_button")}
        </Button>
        <Button
          onClick={() => scrollToSectionById(SECTION_IDS.contact)}
          variant="outline"
          className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          {getSiteText(content, "vehicle.buy_button")}
        </Button>
      </div>
    </div>
  </div>
);
