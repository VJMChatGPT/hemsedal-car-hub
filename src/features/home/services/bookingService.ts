import { supabase } from "@/integrations/supabase/client";
import { VEHICLES } from "@/features/home/data/vehicles";
import { BookingFormValues, Vehicle } from "@/features/home/types/home";

type SupabaseErrorShape = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

interface SaveBookingParams {
  booking: BookingFormValues;
  selectedCar: Vehicle;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
}

interface SendBookingNotificationParams {
  booking: BookingFormValues;
  selectedCar: Vehicle;
  bookingSummary: string;
  totalPrice: number;
}

const createTraceId = () => `booking-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const logDiagnostic = (event: string, details: Record<string, unknown>) => {
  if (!import.meta.env.DEV) {
    return;
  }

  console.info(`[booking] ${event}`, details);
};

const getBookingInsertErrorMessage = (error: SupabaseErrorShape) => {
  if (error.code === "42501") {
    return "No hay permisos para guardar reservas (RLS/policies). Verifica la política INSERT de la tabla bookings.";
  }

  if (error.code === "42P01") {
    return "La tabla bookings no existe en este entorno. Ejecuta las migraciones de Supabase en producción.";
  }

  if (error.message?.toLowerCase().includes("row-level security")) {
    return "La base de datos bloqueó la inserción por Row Level Security. Revisa las policies de bookings.";
  }

  return "Error al guardar la reserva en la base de datos";
};

export const getAvailableCars = async (startDate: Date, endDate: Date) => {
  const { data, error } = await supabase.rpc("get_unavailable_car_ids", {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
  });

  if (error) {
    throw new Error("No se pudo consultar disponibilidad de vehículos");
  }

  const unavailable = new Set((data ?? []).map((entry: { car_id: number }) => entry.car_id));

  return VEHICLES
    .filter((vehicle) => vehicle.isAvailable && !unavailable.has(vehicle.id))
    .sort((a, b) => a.dailyRentPrice - b.dailyRentPrice);
};

export const saveBooking = async ({ booking, selectedCar, startDate, endDate, totalPrice }: SaveBookingParams) => {
  const traceId = createTraceId();
  const payload = {
    name: booking.name.trim(),
    contact: booking.contact.trim(),
    notes: booking.notes.trim() || null,
    date: startDate.toISOString(),
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    car_id: selectedCar.id,
    price_total: totalPrice,
  };

  logDiagnostic("insert:start", { traceId, payload });

  const { error, status, statusText } = await supabase.from("bookings").insert(payload);

  if (error) {
    logDiagnostic("insert:error", {
      traceId,
      status,
      statusText,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(getBookingInsertErrorMessage(error));
  }

  logDiagnostic("insert:success", {
    traceId,
    status,
    statusText,
  });
};

export const sendBookingNotification = async ({
  booking,
  selectedCar,
  bookingSummary,
  totalPrice,
}: SendBookingNotificationParams) => {
  const response = await supabase.functions.invoke("send-booking-email", {
    body: {
      name: booking.name.trim(),
      contact: booking.contact.trim(),
      date: bookingSummary,
      notes: booking.notes.trim(),
      car: selectedCar.name,
      totalPrice,
    },
  });

  logDiagnostic("email:result", {
    hasError: Boolean(response.error),
    data: response.data,
    error: response.error?.message,
  });

  return response;
};
