import { useState } from "react";
import { Calendar as CalendarIcon, User, Phone, FileText, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const Bookings = () => {
  const [date, setDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast.error("Por favor selecciona una fecha");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-booking-email", {
        body: {
          name: formData.name,
          contact: formData.contact,
          date: format(date, "PPP", { locale: es }),
          notes: formData.notes,
        },
      });

      if (error) throw error;

      if (data?.ok) {
        toast.success("¡Reserva enviada! Te contactaremos pronto.");
        setFormData({ name: "", contact: "", notes: "" });
        setDate(undefined);
      } else {
        throw new Error(data?.error || "Error al enviar la reserva");
      }
    } catch (error) {
      console.error("Error sending booking:", error);
      toast.error("Error al enviar la reserva. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="bookings" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-slide-up">
          <p className="text-accent font-medium uppercase tracking-wide mb-2">
            Reservas
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Reserva Tu Vehículo
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Selecciona la fecha deseada y completa el formulario. 
            Nos pondremos en contacto contigo para confirmar la disponibilidad.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-card p-8 rounded-xl border border-border animate-slide-up shadow-lg"
          >
            <div className="space-y-6">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                  Fecha de Reserva
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre Completo
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre"
                  required
                  className="bg-background"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Teléfono o Email
                </label>
                <Input
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="+47 000 00 000 o tu@email.com"
                  required
                  className="bg-background"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Notas (opcional)
                </label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="¿Qué vehículo te interesa? ¿Cuántos días necesitas? ¿Alguna pregunta?"
                  rows={4}
                  className="bg-background resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6"
              >
                {isLoading ? (
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

export default Bookings;
