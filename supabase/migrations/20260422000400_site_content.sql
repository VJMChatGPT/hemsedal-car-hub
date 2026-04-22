CREATE TABLE IF NOT EXISTS public.site_content (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  section text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  input_type text NOT NULL DEFAULT 'text',
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site content" ON public.site_content;
DROP POLICY IF EXISTS "Admin manage site content" ON public.site_content;

CREATE POLICY "Public read site content"
ON public.site_content
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admin manage site content"
ON public.site_content
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
