-- Create bookings table with proper structure
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  contact text NOT NULL,
  date timestamptz NOT NULL,
  notes text
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous INSERT (public booking submissions)
CREATE POLICY "Allow public insert to bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Block SELECT for clients (only backend/service_role can read)
-- No SELECT policy = no client access to read data