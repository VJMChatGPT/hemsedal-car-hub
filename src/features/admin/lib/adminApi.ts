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

export const fetchBookings = async () => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, car:cars(name)")
    .order("date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdminBooking[];
};

export const fetchCars = async () => {
  const { data, error } = await supabase.from("cars").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminCar[];
};
