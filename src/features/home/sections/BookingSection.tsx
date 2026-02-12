import { useRef, useState } from "react";
import { Calendar as CalendarIcon, CheckCircle, FileText, Loader2, Phone, Send, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { SECTION_IDS } from "@/constants/site";
import { SectionTitle } from "@/features/home/components/SectionTitle";
import { useFormFields } from "@/features/home/hooks/useFormFields";
import { sendBookingNotification, saveBooking } from "@/features/home/services/bookingService";
import { BookingFormValues } from "@/features/home/types/home";
import { cn } from "@/lib/utils";

const initialBookingValues: BookingFormValues = {
  name: "",
  contact: "",
  notes: "",
};

export const BookingSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInFlightRef = useRef(false);
  const [isSuccessBannerVisible, setIsSuccessBannerVisible] = useState(false);
  const { values, onFieldChange, resetValues } = useFormFields(initialBookingValues);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submissionInFlightRef.current) {
      return;
    }

    if (!selectedDate) {
      toast.error("Por favor selecciona una fecha");
      return;
    }

    if (!values.name.trim() || !values.contact.trim()) {
      toast.error("Por favor completa nombre y contacto");
      return;
    }

    setIsSubmitting(true);
    submissionInFlightRef.current = true;
    setIsSuccessBannerVisible(false);

    try {
      await saveBooking(values, selectedDate);

      const { data, error } = await sendBookingNotification(values, selectedDate);
      if (error) {
        console.error("Edge function error:", error);
        toast.warning("Reserva guardada, pero hubo un problema enviando la notificación por email.");
      } else if (data?.ok) {
        toast.success("¡Reserva enviada correctamente!");
      } else if (data?.error) {
        console.error("Email send error:", data.error);
        toast.warning(`Reserva guardada, pero hubo un problema con el email: ${data.error}`);
      }

      setIsSuccessBannerVisible(true);
      resetValues();
      setSelectedDate(undefined);
    } catch (error) {
      console.error("Error sending booking:", error);
      toast.error(error instanceof Error ? error.message : "Error al enviar la reserva. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
      submissionInFlightRef.current = false;
    }
  };

  return (
    <section id={SECTION_IDS.bookings} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <SectionTitle
          eyebrow="Reservas"
          title="Reserva Tu Vehículo"
          description="Selecciona la fecha deseada y completa el formulario. Nos pondremos en contacto contigo para confirmar la disponibilidad."
        />

        <div className="max-w-2xl mx-auto">
          {isSuccessBannerVisible && (
            <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-400">¡Reserva Enviada!</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Hemos recibido tu solicitud. Te contactaremos pronto para confirmar la disponibilidad.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="bg-card p-8 rounded-xl border border-border animate-slide-up shadow-lg">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                  Fecha de Reserva *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background",
                        !selectedDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      disabled={(currentDate) => currentDate < new Date()}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre Completo *
                </label>
                <Input
                  name="name"
                  value={values.name}
                  onChange={onFieldChange}
                  placeholder="Ingresa tu nombre"
                  required
                  maxLength={100}
                  className="bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Teléfono o Email *
                </label>
                <Input
                  name="contact"
                  value={values.contact}
                  onChange={onFieldChange}
                  placeholder="+47 000 00 000 o tu@email.com"
                  required
                  maxLength={255}
                  className="bg-background"
                />
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
                  placeholder="¿Qué vehículo te interesa? ¿Cuántos días necesitas? ¿Alguna pregunta?"
                  rows={4}
                  maxLength={1000}
                  className="bg-background resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Reserva
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
