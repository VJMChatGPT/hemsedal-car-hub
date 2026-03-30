import { supabase } from "@/integrations/supabase/client";

export type ReservationStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface AdminBooking {
  id: string;
  sourceTable: "bookings" | "reservations";
  car_id: string | null;
  name: string;
  contact: string;
  date: string;
  end_date: string | null;
  status: ReservationStatus;
  notes: string | null;
  created_at: string | null;
  updated_at: string;
  car?: { name: string } | null;
}

export interface AdminCar {
  id: string;
  name: string;
  category: string | null;
  active: boolean;
  created_at: string;
}

const isMissingTableError = (code?: string) => code === "42P01";
const isPermissionDeniedError = (code?: string) => code === "42501";
const isMissingRelationError = (code?: string) => code === "PGRST200";

const fetchBookingsWithFallback = async () => {
  const result = await supabase.from("bookings").select("*, car:cars(name)").order("date", { ascending: true });
  if (!result.error) return result;

  if (isMissingRelationError(result.error.code)) {
    return supabase.from("bookings").select("*").order("date", { ascending: true });
  }

  return result;
};

const fetchReservationsWithFallback = async () => {
  const result = await supabase.from("reservations").select("*, car:cars(name)").order("start_date", { ascending: true });
  if (!result.error) return result;

  if (isMissingRelationError(result.error.code)) {
    return supabase.from("reservations").select("*").order("start_date", { ascending: true });
  }

  return result;
};

export const fetchBookings = async () => {
  const [bookingsResult, reservationsResult] = await Promise.all([
    fetchBookingsWithFallback(),
    fetchReservationsWithFallback(),
  ]);

  if (bookingsResult.error && !isMissingTableError(bookingsResult.error.code)) {
    throw bookingsResult.error;
  }

  if (
    reservationsResult.error &&
    !isMissingTableError(reservationsResult.error.code) &&
    !isPermissionDeniedError(reservationsResult.error.code)
  ) {
    throw reservationsResult.error;
  }

  const bookings = (bookingsResult.data ?? []).map(
    (booking): AdminBooking => ({
      ...(booking as Omit<AdminBooking, "sourceTable">),
      sourceTable: "bookings",
    }),
  );

  const mirroredReservations = (reservationsResult.data ?? []).map(
    (reservation): AdminBooking => ({
      id: `reservation-${reservation.id}`,
      sourceTable: "reservations",
      car_id: reservation.car_id,
      name: reservation.customer_name,
      contact: reservation.customer_email,
      date: reservation.start_date,
      end_date: reservation.end_date,
      status: reservation.status as ReservationStatus,
      notes: reservation.notes,
      created_at: reservation.created_at,
      updated_at: reservation.updated_at,
      car: reservation.car,
    }),
  );

  return [...bookings, ...mirroredReservations].sort((a, b) => a.date.localeCompare(b.date));
};

export const fetchCars = async () => {
  const { data, error } = await supabase.from("cars").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminCar[];
};
