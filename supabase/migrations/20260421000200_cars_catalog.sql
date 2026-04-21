ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS code integer,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS seats integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS fuel_type text NOT NULL DEFAULT 'Petrol',
  ADD COLUMN IF NOT EXISTS transmission text NOT NULL DEFAULT 'Manual',
  ADD COLUMN IF NOT EXISTS daily_rent_price numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS purchase_price numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cars_code_key'
      AND conrelid = 'public.cars'::regclass
  ) THEN
    ALTER TABLE public.cars
      ADD CONSTRAINT cars_code_key UNIQUE (code);
  END IF;
END $$;

INSERT INTO public.cars (
  code,
  name,
  category,
  image_url,
  seats,
  fuel_type,
  transmission,
  daily_rent_price,
  purchase_price,
  featured,
  active
)
VALUES
  (1, 'Honda CR-V manual 2003', 'SUV', null, 5, 'Petrol', 'Manual', 2800, 1250000, true, true),
  (2, 'Honda CR-V Automatico 2004', 'SUV', null, 5, 'Petrol', 'Auto', 2200, 650000, false, true),
  (3, 'Volkswagen Passat 2.0 tdi 4motion 2008', 'Familiar', null, 5, 'Diesel', 'Manual', 3200, 1450000, true, true),
  (4, 'Subaru Forester 2007 Automatico', 'SUV', null, 5, 'Petrol', 'Auto', 3500, 1350000, false, true)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    seats = EXCLUDED.seats,
    fuel_type = EXCLUDED.fuel_type,
    transmission = EXCLUDED.transmission,
    daily_rent_price = EXCLUDED.daily_rent_price,
    purchase_price = EXCLUDED.purchase_price,
    featured = EXCLUDED.featured,
    active = EXCLUDED.active;
