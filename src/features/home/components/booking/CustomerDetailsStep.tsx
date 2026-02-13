import { ChangeEvent } from "react";
import { FileText, Loader2, Phone, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookingFormValues, Vehicle } from "@/features/home/types/home";

interface CustomerDetailsStepProps {
  values: BookingFormValues;
  selectedCar: Vehicle;
  bookingSummary: string;
  totalPrice: number;
  isSubmitting: boolean;
  onFieldChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBack: () => void;
}

const formatEuro = (value: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);

export const CustomerDetailsStep = ({
  values,
  selectedCar,
  bookingSummary,
  totalPrice,
  isSubmitting,
  onFieldChange,
  onBack,
}: CustomerDetailsStepProps) => (
  <div className="space-y-6">
    <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
      <p><span className="font-semibold">Coche:</span> {selectedCar.name}</p>
      <p><span className="font-semibold">Fechas:</span> {bookingSummary}</p>
      <p><span className="font-semibold">Precio total:</span> {formatEuro(totalPrice)}</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-card-foreground mb-2">
        <User className="w-4 h-4 inline mr-2" />
        Nombre Completo *
      </label>
      <Input name="name" value={values.name} onChange={onFieldChange} placeholder="Ingresa tu nombre" required maxLength={100} className="bg-background" />
    </div>

    <div>
      <label className="block text-sm font-medium text-card-foreground mb-2">
        <Phone className="w-4 h-4 inline mr-2" />
        Teléfono o Email *
      </label>
      <Input name="contact" value={values.contact} onChange={onFieldChange} placeholder="+47 000 00 000 o tu@email.com" required maxLength={255} className="bg-background" />
    </div>

    <div>
      <label className="block text-sm font-medium text-card-foreground mb-2">
        <FileText className="w-4 h-4 inline mr-2" />
        Notas (opcional)
      </label>
      <Textarea
        name="notes"
        value={values.notes}
        onChange={onFieldChange}
        placeholder="¿Necesitas extras o tienes alguna duda?"
        rows={4}
        maxLength={1000}
        className="bg-background resize-none"
      />
    </div>

    <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onBack} className="flex-1">Volver</Button>
      <Button type="submit" disabled={isSubmitting} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" /> Confirmar reserva
          </>
        )}
      </Button>
    </div>
  </div>
);
