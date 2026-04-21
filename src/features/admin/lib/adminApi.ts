import { supabase } from "@/integrations/supabase/client";

export type ReservationStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface AdminBooking {
  id: string;
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
const isMissingRelationError = (code?: string) => code === "PGRST200";

const fetchBookingsWithFallback = async () => {
  const result = await supabase.from("bookings").select("*, car:cars(name)").order("date", { ascending: true });
  if (!result.error) return result;

  if (isMissingRelationError(result.error.code)) {
    return supabase.from("bookings").select("*").order("date", { ascending: true });
  }

  return result;
};

export const fetchBookings = async () => {
  const bookingsResult = await fetchBookingsWithFallback();

  if (bookingsResult.error && !isMissingTableError(bookingsResult.error.code)) {
    throw bookingsResult.error;
  }

  const bookings = (bookingsResult.data ?? []).map(
    (booking): AdminBooking => ({
      ...(booking as AdminBooking),
      status: booking.status as ReservationStatus,
      end_date: booking.end_date ?? booking.start_date ?? booking.date,
      car: "car" in booking ? booking.car : null,
    }),
  );

  return bookings.sort((a, b) => a.date.localeCompare(b.date));
};

export const fetchCars = async () => {
  const { data, error } = await supabase.from("cars").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminCar[];
};
