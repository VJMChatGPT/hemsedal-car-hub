import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { BookingFormValues } from "@/features/home/types/home";

type SupabaseErrorShape = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

const sanitizeBookingPayload = (booking: BookingFormValues, selectedDate: Date) => ({
  name: booking.name.trim(),
  contact: booking.contact.trim(),
  date: selectedDate.toISOString(),
  notes: booking.notes.trim() || null,
});

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

export const saveBooking = async (booking: BookingFormValues, selectedDate: Date) => {
  const traceId = createTraceId();
  const payload = sanitizeBookingPayload(booking, selectedDate);

  logDiagnostic("insert:start", {
    traceId,
    payload,
  });

  const { error, status, statusText } = await supabase
    .from("bookings")
    .insert(payload);

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

export const sendBookingNotification = async (booking: BookingFormValues, selectedDate: Date) => {
  const formattedDate = format(selectedDate, "PPP", { locale: es });

  logDiagnostic("email:start", {
    payload: {
      name: booking.name.trim(),
      contact: booking.contact.trim(),
      date: formattedDate,
      hasNotes: Boolean(booking.notes.trim()),
    },
  });

  const response = await supabase.functions.invoke("send-booking-email", {
    body: {
      name: booking.name.trim(),
      contact: booking.contact.trim(),
      date: formattedDate,
      notes: booking.notes.trim(),
    },
  });

  logDiagnostic("email:result", {
    hasError: Boolean(response.error),
    data: response.data,
    error: response.error?.message,
  });

  return response;
};
