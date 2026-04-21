ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage bookings" ON public.bookings;
CREATE POLICY "Admin manage bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public insert bookings" ON public.bookings;
CREATE POLICY "Public insert bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
