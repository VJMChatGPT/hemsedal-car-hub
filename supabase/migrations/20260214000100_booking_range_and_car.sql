ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS start_date timestamptz,
  ADD COLUMN IF NOT EXISTS end_date timestamptz,
  ADD COLUMN IF NOT EXISTS car_id integer,
  ADD COLUMN IF NOT EXISTS price_total numeric(10,2);

UPDATE public.bookings
SET
  start_date = COALESCE(start_date, date),
  end_date = COALESCE(end_date, date + interval '1 day')
WHERE start_date IS NULL OR end_date IS NULL;

ALTER TABLE public.bookings
  ALTER COLUMN start_date SET NOT NULL,
  ALTER COLUMN end_date SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_end_after_start'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_end_after_start CHECK (end_date > start_date);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_car_range ON public.bookings (car_id, start_date, end_date);

CREATE OR REPLACE FUNCTION public.get_unavailable_car_ids(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE(car_id integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT b.car_id
  FROM public.bookings b
  WHERE b.car_id IS NOT NULL
    AND p_start_date < b.end_date
    AND p_end_date > b.start_date;
$$;

REVOKE ALL ON FUNCTION public.get_unavailable_car_ids(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_unavailable_car_ids(timestamptz, timestamptz) TO anon, authenticated;
