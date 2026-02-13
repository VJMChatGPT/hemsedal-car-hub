import { useMemo, useState } from "react";
import { CheckCircle, Fuel, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/features/home/types/home";

interface CarSelectionStepProps {
  cars: Vehicle[];
  selectedCar: Vehicle | null;
  isLoading: boolean;
  totalDays: number;
  onSelectCar: (car: Vehicle) => void;
  onBack: () => void;
  onNext: () => void;
}

const formatEuro = (value: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);

export const CarSelectionStep = ({
  cars,
  selectedCar,
  isLoading,
  totalDays,
  onSelectCar,
  onBack,
  onNext,
}: CarSelectionStepProps) => {
  const [fuelFilter, setFuelFilter] = useState("all");

  const filteredCars = useMemo(
    () => (fuelFilter === "all" ? cars : cars.filter((car) => car.fuelType === fuelFilter)),
    [cars, fuelFilter],
  );

  const fuelTypes = useMemo(() => ["all", ...new Set(cars.map((car) => car.fuelType))], [cars]);

  return (
    <div className="space-y-6">
      {isLoading ? <p className="text-sm text-muted-foreground">Consultando disponibilidad...</p> : null}

      {!isLoading && cars.length > 0 ? (
        <div className="flex items-center gap-3">
          <label htmlFor="fuel-filter" className="text-sm text-muted-foreground">Filtrar:</label>
          <select
            id="fuel-filter"
            value={fuelFilter}
            onChange={(event) => setFuelFilter(event.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {fuelTypes.map((fuelType) => (
              <option key={fuelType} value={fuelType}>
                {fuelType === "all" ? "Todos" : fuelType}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {!isLoading && filteredCars.length === 0 ? <p className="text-sm text-muted-foreground">No hay coches disponibles para esas fechas.</p> : null}

      <div className="grid gap-4">
        {filteredCars.map((car) => {
          const isSelected = selectedCar?.id === car.id;
          const total = Number((car.dailyRentPrice * totalDays).toFixed(2));

          return (
            <button
              key={car.id}
              type="button"
              onClick={() => onSelectCar(car)}
              className={`w-full text-left rounded-xl border p-4 transition ${
                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex gap-4">
                {car.image ? <img src={car.image} alt={car.name} className="h-24 w-32 object-cover rounded-md" /> : null}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-card-foreground">{car.name}</h3>
                    {isSelected ? <CheckCircle className="h-5 w-5 text-primary" /> : null}
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{car.seats} plazas</span>
                    <span className="inline-flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{car.fuelType}</span>
                    <span className="inline-flex items-center gap-1"><Settings className="h-3.5 w-3.5" />{car.transmission}</span>
                  </div>
                  <p className="text-sm font-medium">{formatEuro(car.dailyRentPrice)}/día · Total: {formatEuro(total)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">Volver</Button>
        <Button type="button" onClick={onNext} disabled={!selectedCar} className="flex-1">Continuar con tus datos</Button>
      </div>
    </div>
  );
};
