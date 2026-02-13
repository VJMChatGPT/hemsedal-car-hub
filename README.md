# Hemsedal Car Hub

Sitio web de **Hemsedal Motors** para mostrar flota premium, capturar reservas y gestionar contacto comercial.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (tabla `bookings` + edge function `send-booking-email`)
- Vitest + Testing Library

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un `.env` con:

```bash
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<tu-anon-key>
```

> En tests se usan valores fallback para evitar dependencias remotas.

## Ejecución

### Desarrollo

```bash
npm run dev
```

### Build de producción

```bash
npm run build
```

### Preview local de build

```bash
npm run preview
```

## Calidad y validación

```bash
npm run lint
npm run test
npm run build
```

## Estructura del proyecto

```text
src/
  app/                        # Providers y router principal
  constants/                  # Config global (rutas, IDs de sección, datos de marca)
  features/
    home/
      components/             # Componentes reutilizables del dominio home
      data/                   # Datos estáticos (vehículos, ventajas)
      hooks/                  # Hooks de estado de formularios
      pages/                  # Composición de la home
      sections/               # Secciones de UI por responsabilidad
      services/               # Casos de uso externos (booking + edge function)
      types/                  # Tipos del dominio home
  integrations/supabase/      # Cliente y tipos de DB
  pages/                      # Rutas de alto nivel (home + 404)
  test/                       # Smoke tests y utilidades
  utils/                      # Helpers puros (scroll/formato)
```

## Flujos principales

- **Landing y navegación:** header con scroll suave a secciones (`fleet`, `about`, `bookings`, `contact`).
- **Reserva:** valida campos, guarda en Supabase (`bookings`) y luego intenta notificación por edge function.
- **Contacto:** formulario local con feedback inmediato por toast.
- **Catálogo:** render de tarjetas de vehículos desde fuente de datos tipada.

## Notas de despliegue

- Mantén configuradas las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en el entorno de deploy.
- Ejecuta migraciones de Supabase en el proyecto de destino para asegurar existencia de `public.bookings`.

## Troubleshooting de guardado en Supabase (prod vs local)

Si el guardado en `bookings` falla en producción o queda inconsistente, valida exactamente esto:

1. **Variables de entorno en deploy**
   - Define en Vercel/hosting:
     - `VITE_SUPABASE_URL=https://<project-ref>.supabase.co`
     - `VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>`
   - También se admite `VITE_SUPABASE_ANON_KEY` como fallback.
   - Nunca uses `SUPABASE_ANON_KEY` sin prefijo `VITE_` para código cliente.

2. **Tabla y políticas RLS en producción**
   Ejecuta en SQL Editor del proyecto de producción:

   ```sql
   select table_name, row_security
   from information_schema.tables
   where table_schema = 'public' and table_name = 'bookings';

   select policyname, permissive, roles, cmd, qual, with_check
   from pg_policies
   where schemaname = 'public' and tablename = 'bookings';
   ```

   Debes tener una policy de `INSERT` para `anon` y/o `authenticated`.

3. **Confirmar estructura de columnas**

   ```sql
   select column_name, data_type, is_nullable, column_default
   from information_schema.columns
   where table_schema = 'public' and table_name = 'bookings'
   order by ordinal_position;
   ```

   El frontend envía `name`, `contact`, `date` (ISO timestamp) y `notes`.

4. **Ver error real de API**
   - Dashboard → Logs → API (PostgREST)
   - Filtra por endpoint `/rest/v1/bookings` y revisa `status`, `code`, `message`.
   - Errores típicos:
     - `42501` → policy/RLS bloqueando
     - `42P01` → tabla inexistente en ese proyecto
     - `23502` / `23514` → `NOT NULL` o `CHECK` constraint

5. **Instrumentación en frontend (incluida en este repo)**
   - Logs con prefijo `[supabase]` para validar inicialización y entorno.
   - Logs con prefijo `[booking]` para `insert:start`, `insert:error`, `insert:success`, `email:start`, `email:result`.
   - Incluye `traceId` para correlacionar cada intento en consola y logs de red.

## Troubleshooting de Resend (403 validation_error)

Si ves este error:

```json
{
  "name": "validation_error",
  "message": "You can only send testing emails to your own email address ..."
}
```

significa que el remitente (`from`) está usando el dominio de pruebas `@resend.dev`.

Para corregirlo en esta app:

1. Configura en la función `send-booking-email`:
   - `BOOKING_FROM_EMAIL=reservas@oldiat.resend.app` (o cualquier `@oldiat.resend.app`)
   - `BOOKING_TO_EMAIL=<correo donde quieres recibir reservas>`
   - `RESEND_API_KEY=<tu api key>`
2. Verifica en Resend que el dominio `oldiat.resend.app` está habilitado para tu cuenta/proyecto.
3. Vuelve a desplegar la edge function.

Nota: la función ya incluye un fallback defensivo para evitar `@resend.dev` en producción y usar `reservas@oldiat.resend.app`.
