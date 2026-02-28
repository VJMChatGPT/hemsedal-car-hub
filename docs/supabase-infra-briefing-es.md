# Briefing de infraestructura Supabase (según este código)

Este documento resume **cómo debe funcionar Supabase** en este proyecto para validar que la infraestructura esté correcta.

## 1) Proyecto y configuración base

- El proyecto de Supabase que usa la CLI está fijado en `supabase/config.toml` con `project_id = "bezklwktabfywyzenlul"`.
- El frontend usa `VITE_SUPABASE_URL` (o `NEXT_PUBLIC_SUPABASE_URL`) y `VITE_SUPABASE_PUBLISHABLE_KEY`/`VITE_SUPABASE_ANON_KEY`.
- Si faltan URL o key, el cliente rompe al iniciar (excepto en `test`, donde usa fallback local).
- Existe un script de diagnóstico (`npm run supabase:preflight`) que detecta si frontend y CLI apuntan a proyectos distintos.

## 2) Modelo de datos esperado en `public`

Tablas activas usadas por la app:

- `bookings`: reservas base de la web pública.
- `reservations`: espejo/flujo de reservas con estado para panel admin.
- `cars`: catálogo de vehículos editable por admin.
- `profiles`: roles de usuario (`admin`/`user`) ligados a `auth.users`.

Notas:

- `bookings_test` existe como tabla de pruebas históricas y no es central al flujo actual.
- `bookings.car_id` y `reservations.car_id` referencian `cars.id`.
- Hay columnas `car_code` (entero) para cálculo de disponibilidad por catálogo frontend.

## 3) Seguridad (RLS + Auth) que debe estar vigente

### `bookings`
- RLS habilitado.
- Inserción permitida para `anon` y `authenticated`.
- Lectura/gestión completa restringida a admin vía política separada en migraciones posteriores.

### `reservations`
- RLS habilitado.
- Inserción pública permitida (`anon`/`authenticated`) para capturar solicitudes.
- Gestión completa (`SELECT/UPDATE/DELETE/INSERT`) para usuarios autenticados que cumplan `is_admin()`.

### `cars`
- RLS habilitado.
- Lectura pública solo de autos activos (`active = true`), excepto admin que puede ver todo.
- Gestión completa solo admin.

### `profiles`
- RLS habilitado.
- Lectura/actualización del propio perfil (`id = auth.uid()`) y acceso total para admin según política.

## 4) Funciones y triggers críticos

- `is_admin()` (SECURITY DEFINER): consulta `profiles` usando `auth.uid()` para determinar privilegios.
- `get_unavailable_car_ids(start, end)` (SECURITY DEFINER): devuelve autos no disponibles en un rango.
  - En su versión más reciente cruza `bookings` + `reservations`.
  - Solo considera bloqueos cuando `status = 'accepted'`.
- Trigger de creación de perfil automático tras alta en `auth.users`.
- Triggers de `updated_at` para `bookings` y `reservations`.

## 5) Flujo funcional esperado

1. Usuario web consulta disponibilidad:
   - Frontend llama RPC `get_unavailable_car_ids`.
   - Se filtran vehículos no disponibles.
2. Usuario envía reserva:
   - Se inserta en `bookings`.
   - También se intenta espejo en `reservations` con `status = pending`.
3. Admin inicia sesión con Supabase Auth.
4. Frontend valida rol admin por RPC `is_admin()` (y fallback leyendo `profiles`).
5. Admin gestiona reservas y autos desde panel:
   - Cambia estados (`pending`, `accepted`, `rejected`, `cancelled`).
   - Si acepta, el rango queda bloqueado por RPC de disponibilidad.

## 6) Inconsistencias detectables que conviene corregir

- Hay mezcla histórica entre `bookings.car_id` como `integer` y como `uuid` en migraciones distintas.
- La función tipada en `src/integrations/supabase/types.ts` declara retorno `{ car_id: string }[]`, pero la última migración SQL devuelve `car_code integer`.
- En frontend se añadió tolerancia leyendo `car_code` o `car_id`, pero idealmente hay que **normalizar esquema y tipos generados** para evitar deuda técnica.

## 7) Checklist de verificación (producción)

1. Variables de entorno en hosting:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
2. Confirmar que el `project_id` de `supabase/config.toml` coincide con el project-ref de la URL usada por frontend.
3. Migraciones aplicadas en orden en ese mismo proyecto.
4. Verificar tablas: `bookings`, `reservations`, `cars`, `profiles`.
5. Verificar RLS + policies activas en esas tablas.
6. Verificar funciones: `is_admin()` y `get_unavailable_car_ids()`.
7. Validar que existe al menos un usuario con `profiles.role = 'admin'`.
8. Probar flujo real: crear reserva pública, aceptar desde admin, reconfirmar no disponibilidad.

## 8) Prompt sugerido para pedir auditoría a ChatGPT

"Tengo un proyecto React + Supabase. Quiero que audites si mi infraestructura está bien diseñada para reservas y panel admin. Considera:

- RLS por tabla (`bookings`, `reservations`, `cars`, `profiles`).
- Funciones `is_admin()` y `get_unavailable_car_ids()` con SECURITY DEFINER.
- Doble escritura de reservas (`bookings` y espejo en `reservations`).
- Posibles inconsistencias de esquema (`car_id` uuid/integer y `car_code`).

Devuélveme:
1) riesgos de seguridad,
2) riesgos de integridad de datos,
3) plan de normalización de esquema sin downtime,
4) SQL exacto recomendado para policies y constraints,
5) estrategia de migración y rollback."
