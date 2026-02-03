-- Crear tabla bookings_test
CREATE TABLE public.bookings_test (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT
);

-- Habilitar Row Level Security
ALTER TABLE public.bookings_test ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública (puedes ajustar según necesites)
CREATE POLICY "Allow public read access"
  ON public.bookings_test
  FOR SELECT
  USING (true);

-- Política para permitir inserción pública (puedes ajustar según necesites)
CREATE POLICY "Allow public insert access"
  ON public.bookings_test
  FOR INSERT
  WITH CHECK (true);