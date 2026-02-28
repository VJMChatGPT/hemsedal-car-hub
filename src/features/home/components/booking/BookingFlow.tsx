import { FormEvent, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DateRangeStep } from "@/features/home/components/booking/DateRangeStep";
import { CarSelectionStep } from "@/features/home/components/booking/CarSelectionStep";
import { CustomerDetailsStep } from "@/features/home/components/booking/CustomerDetailsStep";
import { useBookingFlow } from "@/features/home/hooks/useBookingFlow";
import { getAvailableCars, saveBooking } from "@/features/home/services/bookingService";
import { Vehicle } from "@/features/home/types/home";

const steps = ["Fechas", "Coche", "Tus datos"];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const BookingFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [availableCars, setAvailableCars] = useState<Vehicle[]>([]);
  const [isSuccessBannerVisible, setIsSuccessBannerVisible] = useState(false);
  const submissionInFlightRef = useRef(false);

  const {
    state,
    normalizedRange,
    totalPrice,
    setDateRange,
    setSelectedCar,
    onCustomerFieldChange,
    resetFlow,
  } = useBookingFlow();

  const bookingSummary = useMemo(() => {
    if (!normalizedRange || !state.dateRange?.from) {
      return "";
    }

    const checkoutDate = state.dateRange.to ?? state.dateRange.from;

    return `Del ${format(normalizedRange.startDate, "dd/MM/yyyy", { locale: es })} al ${format(
      checkoutDate,
      "dd/MM/yyyy",
      { locale: es },
    )} (${normalizedRange.totalDays} días)`;
  }, [normalizedRange, state.dateRange?.from, state.dateRange?.to]);

  const loadAvailableCars = async () => {
    if (!normalizedRange) {
      return;
    }

    setIsLoadingCars(true);
    try {
      const cars = await getAvailableCars(normalizedRange.startDate, normalizedRange.endDate);
      setAvailableCars(cars);
      setCurrentStep(1);
    } catch (error) {
      console.error("Error loading available cars:", error);
      toast.error(error instanceof Error ? error.message : "No se pudo consultar disponibilidad");
    } finally {
      setIsLoadingCars(false);
    }
  };

  const handleCarSelect = (car: Vehicle) => {
    setSelectedCar(car);
  };

  const goToCustomerStep = () => {
    if (!state.selectedCar) {
      toast.error("Selecciona un coche para continuar");
      return;
    }

    setCurrentStep(2);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submissionInFlightRef.current) {
      return;
    }

    if (!normalizedRange || !state.selectedCar) {
      toast.error("Completa el rango de fechas y el coche");
      return;
    }

    if (!state.customerDetails.name.trim() || !state.customerDetails.contact.trim()) {
      toast.error("Por favor completa nombre y contacto");
      return;
    }

    setIsSubmitting(true);
    submissionInFlightRef.current = true;
    setIsSuccessBannerVisible(false);

    try {
      await saveBooking({
        booking: state.customerDetails,
        selectedCar: state.selectedCar,
        startDate: normalizedRange.startDate,
        endDate: normalizedRange.endDate,
        totalPrice,
      });

      const contact = state.customerDetails.contact.trim();
      const derivedEmail = emailRegex.test(contact) ? contact : "";

      const reservationPayload = {
        name: state.customerDetails.name.trim(),
        email: derivedEmail,
        car: state.selectedCar.name,
        dateFrom: normalizedRange.startDate.toISOString(),
        dateTo: normalizedRange.endDate.toISOString(),
        phone: derivedEmail ? "" : contact,
        notes: state.customerDetails.notes.trim(),
        price: totalPrice,
      };

      try {
        const emailResponse = await fetch("/api/reservation-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reservationPayload),
        });

        if (!emailResponse.ok) {
          const emailError = (await emailResponse.json().catch(() => null)) as { error?: string } | null;
          toast.error(emailError?.error || "La reserva se guardó, pero no se pudo enviar el email de notificación.");
        }
      } catch (emailError) {
        console.error("Error calling /api/reservation-email:", emailError);
        toast.error("La reserva se guardó, pero falló el envío del email de notificación.");
      }

      toast.success("¡Reserva enviada correctamente!");

      setIsSuccessBannerVisible(true);
      resetFlow();
      setAvailableCars([]);
      setCurrentStep(0);
    } catch (error) {
      console.error("Error sending booking:", error);
      toast.error(error instanceof Error ? error.message : "Error al enviar la reserva. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
      submissionInFlightRef.current = false;
    }
  };

  return (
    <>
      {isSuccessBannerVisible ? (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-400">¡Reserva Enviada!</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Hemos recibido tu solicitud. Te contactaremos pronto para confirmar la disponibilidad.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
        {steps.map((step, index) => (
          <span key={step} className={index === currentStep ? "font-semibold text-foreground" : ""}>
            {index + 1}. {step}
          </span>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-xl border border-border animate-slide-up shadow-lg">
        {currentStep === 0 ? (
          <DateRangeStep
            dateRange={state.dateRange}
            onDateChange={(range) => {
              setDateRange(range);
              setSelectedCar(null);
            }}
            summary={bookingSummary}
            canContinue={Boolean(normalizedRange)}
            onNext={loadAvailableCars}
          />
        ) : null}

        {currentStep === 1 && normalizedRange ? (
          <CarSelectionStep
            cars={availableCars}
            selectedCar={state.selectedCar}
            isLoading={isLoadingCars}
            totalDays={normalizedRange.totalDays}
            onSelectCar={handleCarSelect}
            onBack={() => setCurrentStep(0)}
            onNext={goToCustomerStep}
          />
        ) : null}

        {currentStep === 2 && state.selectedCar ? (
          <CustomerDetailsStep
            values={state.customerDetails}
            selectedCar={state.selectedCar}
            bookingSummary={bookingSummary}
            totalPrice={totalPrice}
            isSubmitting={isSubmitting}
            onFieldChange={onCustomerFieldChange}
            onBack={() => setCurrentStep(1)}
          />
        ) : null}
      </form>
    </>
  );
};
