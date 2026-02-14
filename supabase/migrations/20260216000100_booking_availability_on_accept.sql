ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS car_code integer;

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS car_code integer;

CREATE INDEX IF NOT EXISTS idx_bookings_car_code_range
  ON public.bookings (car_code, start_date, end_date)
  WHERE status = 'accepted';

CREATE INDEX IF NOT EXISTS idx_reservations_car_code_range
  ON public.reservations (car_code, start_date, end_date)
  WHERE status = 'accepted';

CREATE OR REPLACE FUNCTION public.get_unavailable_car_ids(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE(car_code integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT b.car_code
  FROM public.bookings b
  WHERE b.car_code IS NOT NULL
    AND b.status = 'accepted'
    AND p_start_date < COALESCE(b.end_date, b.date + interval '1 day')
    AND p_end_date > COALESCE(b.start_date, b.date)

  UNION

  SELECT DISTINCT r.car_code
  FROM public.reservations r
  WHERE r.car_code IS NOT NULL
    AND r.status = 'accepted'
    AND p_start_date < ((r.end_date + 1)::timestamptz)
    AND p_end_date > (r.start_date::timestamptz);
$$;

REVOKE ALL ON FUNCTION public.get_unavailable_car_ids(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_unavailable_car_ids(timestamptz, timestamptz) TO anon, authenticated;
