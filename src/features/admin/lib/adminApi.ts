import { supabase } from "@/integrations/supabase/client";

export type ReservationStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface AdminReservation {
  id: string;
  car_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  start_date: string;
  end_date: string;
  status: ReservationStatus;
  notes: string | null;
  created_at: string;
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

export const fetchReservations = async () => {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, car:cars(name)")
    .order("start_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdminReservation[];
};

export const fetchCars = async () => {
  const { data, error } = await supabase.from("cars").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminCar[];
};
