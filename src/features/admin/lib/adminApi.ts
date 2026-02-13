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

export const fetchBookings = async () => {
  const [bookingsResult, reservationsResult] = await Promise.all([
    supabase.from("bookings").select("*, car:cars(name)").order("date", { ascending: true }),
    supabase.from("reservations").select("*, car:cars(name)").order("start_date", { ascending: true }),
  ]);

  if (bookingsResult.error && bookingsResult.error.code !== "42P01") {
    throw bookingsResult.error;
  }

  if (reservationsResult.error && reservationsResult.error.code !== "42P01") {
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
