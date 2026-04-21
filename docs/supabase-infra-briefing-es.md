# Briefing de infraestructura Supabase

Este documento resume como debe funcionar Supabase en este proyecto despues de normalizar las reservas en una sola tabla.

## 1) Proyecto y configuracion base

- El proyecto de Supabase que usa la CLI esta fijado en `supabase/config.toml` con `project_id = "bezklwktabfywyzenlul"`.
- El frontend usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Existe un script de diagnostico (`npm run supabase:preflight`) que detecta si frontend y CLI apuntan a proyectos distintos.

## 2) Modelo de datos esperado en `public`

Tablas activas usadas por la app:

- `bookings`: unica tabla de reservas de la web y del panel admin.
- `cars`: catalogo de vehiculos editable por admin.
- `profiles`: roles de usuario (`admin`/`user`) ligados a `auth.users`.

Notas:

- `bookings_test` existe como tabla de pruebas historicas y no es central al flujo actual.
- `bookings.car_id` referencia `cars.id`.
- `bookings.car_code` se usa para el calculo de disponibilidad con el catalogo frontend.
- `reservations` era una tabla espejo antigua y se elimina con `20260421000100_remove_reservations_table.sql`.

## 3) Seguridad

### `bookings`
- RLS habilitado.
- Insercion permitida para `anon` y `authenticated`.
- Lectura y gestion completa restringida a admin mediante politicas de Supabase.

### `cars`
- RLS habilitado.
- Lectura publica solo de coches activos, excepto admin que puede ver todo.
- Gestion completa solo admin.

### `profiles`
- RLS habilitado.
- Lectura/actualizacion del propio perfil y acceso total para admin segun politica.

## 4) Funciones criticas

- `is_admin()`: consulta `profiles` usando `auth.uid()` para determinar privilegios.
- `get_unavailable_car_ids(start, end)`: devuelve coches no disponibles mirando solo `bookings` con `status = 'accepted'`.

## 5) Flujo funcional esperado

1. Usuario web consulta disponibilidad:
   - Frontend llama RPC `get_unavailable_car_ids`.
   - Se filtran vehiculos no disponibles.
2. Usuario envia reserva:
   - Se inserta en `bookings`.
3. Admin inicia sesion con Supabase Auth.
4. Frontend valida rol admin por RPC `is_admin()` y fallback leyendo `profiles`.
5. Admin gestiona reservas y coches desde panel:
   - Cambia estados (`pending`, `accepted`, `rejected`, `cancelled`).
   - Si acepta una reserva, su rango queda bloqueado por la RPC de disponibilidad.

## 6) Checklist de verificacion

1. Variables de entorno en hosting:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
2. Confirmar que el `project_id` de `supabase/config.toml` coincide con la URL usada por frontend.
3. Aplicar la migracion `20260421000100_remove_reservations_table.sql` si el proyecto aun tiene `reservations`.
4. Verificar tablas activas: `bookings`, `cars`, `profiles`.
5. Verificar funciones: `is_admin()` y `get_unavailable_car_ids()`.
6. Validar que existe al menos un usuario con `profiles.role = 'admin'`.
7. Probar flujo real: crear reserva publica, aceptar desde admin, reconfirmar no disponibilidad.
