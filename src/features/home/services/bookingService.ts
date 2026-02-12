import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { BookingFormValues } from "@/features/home/types/home";

const getBookingInsertErrorMessage = (error: { code?: string; message?: string }) => {
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
  const { error } = await supabase.from("bookings").insert({
    name: booking.name.trim(),
    contact: booking.contact.trim(),
    date: selectedDate.toISOString(),
    notes: booking.notes.trim() || null,
  });

  if (error) {
    throw new Error(getBookingInsertErrorMessage(error));
  }
};

export const sendBookingNotification = async (booking: BookingFormValues, selectedDate: Date) => {
  const formattedDate = format(selectedDate, "PPP", { locale: es });

  return supabase.functions.invoke("send-booking-email", {
    body: {
      name: booking.name.trim(),
      contact: booking.contact.trim(),
      date: formattedDate,
      notes: booking.notes.trim(),
    },
  });
};
