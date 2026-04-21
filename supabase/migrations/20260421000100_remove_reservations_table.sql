DROP INDEX IF EXISTS public.idx_reservations_car_code_range;

DO $$
BEGIN
  IF to_regclass('public.reservations') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS set_reservations_updated_at ON public.reservations;
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.touch_reservations_updated_at();
DROP FUNCTION IF EXISTS public.get_unavailable_car_ids(timestamptz, timestamptz);

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS start_date timestamptz,
  ADD COLUMN IF NOT EXISTS end_date timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.bookings
SET start_date = COALESCE(start_date, date),
    end_date = COALESCE(end_date, date + interval '1 day')
WHERE start_date IS NULL
   OR end_date IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_status_check'
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_status_check
      CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled'));
  END IF;
END $$;

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
    AND b.status = 'accepted'
    AND p_start_date < COALESCE(b.end_date, b.date + interval '1 day')
    AND p_end_date > COALESCE(b.start_date, b.date);
$$;

REVOKE ALL ON FUNCTION public.get_unavailable_car_ids(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_unavailable_car_ids(timestamptz, timestamptz) TO anon, authenticated;

DROP TABLE IF EXISTS public.reservations CASCADE;
