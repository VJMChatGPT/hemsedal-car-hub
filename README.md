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
