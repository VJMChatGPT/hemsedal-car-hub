# Admin Panel

## 1) Migraciones
1. Ejecuta las migraciones de Supabase (incluyendo `20260215000100_admin.sql`).
2. Verifica que existan las tablas `cars`, `reservations` y `profiles`.

## 2) Crear usuario admin
1. Crea un usuario con email/password desde **Supabase Auth**.
2. En SQL Editor ejecuta:

```sql
insert into public.profiles (id, role)
values ('<USER_UUID>', 'admin')
on conflict (id) do update set role = 'admin';
```

> Puedes obtener `<USER_UUID>` en Auth > Users.

## 3) Probar panel
1. Arranca la app:

```bash
npm run dev
```

2. Navega a `http://localhost:5173/admin/login`.
3. Inicia sesión con el admin.
4. Prueba:
   - Calendario de reservas (mes/semana/día).
   - Edición de reserva desde side panel.
   - Lista de reservas con filtros y acciones rápidas.
   - CRUD de coches y activación/desactivación.

## 4) Deploy en Vercel
Asegúrate de tener en Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

El frontend usa sesión de Supabase + RLS (sin `service_role` en cliente).
