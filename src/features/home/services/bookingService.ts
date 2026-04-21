import { supabase } from "@/integrations/supabase/client";
import { fetchPublicCars } from "@/features/home/services/carService";
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

const isMissingColumnError = (error: SupabaseErrorShape, columnName: string) => {
  if (error.code === "PGRST204" || error.code === "42703") {
    return (error.message?.toLowerCase() ?? "").includes(columnName.toLowerCase());
  }

  return false;
};

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

const isLegacySchemaError = (error: SupabaseErrorShape) => {
  if (error.code === "42703") {
    return true;
  }

  const message = error.message?.toLowerCase() ?? "";
  return message.includes("start_date") || message.includes("end_date") || message.includes("price_total");
};

export const getAvailableCars = async (startDate: Date, endDate: Date) => {
  const { data, error } = await supabase.rpc("get_unavailable_car_ids", {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
  });

  if (error) {
    throw new Error("No se pudo consultar disponibilidad de vehículos");
  }

  const unavailable = new Set((data ?? []).map((entry: { car_id?: string | number | null }) => String(entry.car_id ?? "")));

  const cars = await fetchPublicCars();

  return cars
    .filter((vehicle) => vehicle.isAvailable && !unavailable.has(String(vehicle.id)))
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
    status: "pending",
  } as Record<string, unknown>;

  logDiagnostic("insert:start", { traceId, payload });

  let { error, status, statusText } = await supabase.from("bookings").insert(payload);

  if (error) {
    if (isLegacySchemaError(error)) {
      logDiagnostic("insert:legacy-schema:fallback", {
        traceId,
        code: error.code,
        message: error.message,
      });

      const legacyPayload = {
        name: booking.name.trim(),
        contact: booking.contact.trim(),
        notes: booking.notes.trim() || null,
        date: startDate.toISOString(),
      };

      const legacyResult = await supabase.from("bookings").insert(legacyPayload);

      if (!legacyResult.error) {
        logDiagnostic("insert:legacy-schema:success", {
          traceId,
          status: legacyResult.status,
          statusText: legacyResult.statusText,
        });

        return;
      }

      logDiagnostic("insert:legacy-schema:error", {
        traceId,
        status: legacyResult.status,
        statusText: legacyResult.statusText,
        code: legacyResult.error.code,
        message: legacyResult.error.message,
        details: legacyResult.error.details,
        hint: legacyResult.error.hint,
      });

      throw new Error(getBookingInsertErrorMessage(legacyResult.error));
    }

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
