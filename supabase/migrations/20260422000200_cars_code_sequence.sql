UPDATE public.cars
SET code = 1
WHERE name = 'Honda CR-V manual 2003';

UPDATE public.cars
SET code = 2
WHERE name IN ('Honda CR-V Automatico 2004', 'Honda CR-V Automático 2004');

UPDATE public.cars
SET code = 3
WHERE name = 'Volkswagen Passat 2.0 tdi 4motion 2008';

UPDATE public.cars
SET code = 4
WHERE name = 'Subaru Forester 2007 Automatico';

CREATE SEQUENCE IF NOT EXISTS public.cars_code_seq;

SELECT setval(
  'public.cars_code_seq',
  GREATEST((SELECT COALESCE(MAX(code), 0) FROM public.cars), 1),
  true
);

ALTER TABLE public.cars
ALTER COLUMN code SET DEFAULT nextval('public.cars_code_seq'::regclass);

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
