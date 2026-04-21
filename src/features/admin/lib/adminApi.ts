import { supabase } from "@/integrations/supabase/client";

export type ReservationStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface AdminBooking {
  id: string;
  car_id: string | number | null;
  name: string;
  contact: string;
  date: string;
  end_date: string | null;
  status: ReservationStatus;
  notes: string | null;
  created_at: string | null;
  updated_at: string;
}

export interface AdminCar {
  id: string;
  code: number;
  name: string;
  category: string | null;
  image_url: string | null;
  seats: number;
  fuel_type: string;
  transmission: string;
  daily_rent_price: number;
  purchase_price: number;
  featured: boolean;
  active: boolean;
  created_at: string;
}

const isMissingTableError = (code?: string) => code === "42P01";

export const fetchBookings = async () => {
  const bookingsResult = await supabase.from("bookings").select("*").order("date", { ascending: true });

  if (bookingsResult.error && !isMissingTableError(bookingsResult.error.code)) {
    throw bookingsResult.error;
  }

  const bookings = (bookingsResult.data ?? []).map(
    (booking): AdminBooking => ({
      ...(booking as AdminBooking),
      status: booking.status as ReservationStatus,
      end_date: booking.end_date ?? booking.start_date ?? booking.date,
    }),
  );

  return bookings.sort((a, b) => a.date.localeCompare(b.date));
};

export const fetchCars = async () => {
  const { data, error } = await supabase.from("cars").select("*").order("code", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AdminCar[];
};
