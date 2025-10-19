# Supabase setup for Aberturito Stock

Este documento contiene los pasos para crear la tabla `stock`, configurar políticas mínimas y obtener las variables de entorno para poner en `.env.local`.

## 1) Crear proyecto en Supabase

- Ir a https://app.supabase.com y crear un nuevo proyecto.
- Guardar la URL del proyecto (ej: `https://xyzcompany.supabase.co`) y la `anon` key desde Settings -> API.

## 2) Crear tabla `stock`

Use SQL editor en Supabase y ejecute:

```sql
create table if not exists public.stock (
  id uuid primary key default gen_random_uuid(),
  categoria text,
  tipo text,
  linea text,
  color text,
  estado text,
  cantidad integer default 0,
  min_stock integer,
  unidad text,
  ubicacion text,
  largo integer,
  material text,
  last_update date
);

-- Index para búsquedas comunes
create index if not exists idx_stock_categoria on public.stock (categoria);
create index if not exists idx_stock_tipo on public.stock (tipo);
```

Nota: usamos `gen_random_uuid()` que requiere la extensión `pgcrypto` o `pgcrypto` – si no está habilitada, ejecute `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`.

## 3) Políticas RLS (opcional pero recomendado)

Si quieres usar Row Level Security (RLS) y permitir lectura/escritura anónima para desarrollo, puedes:

```sql
alter table public.stock enable row level security;

-- Policy: permitir selects anónimos (dev only)
create policy "allow select" on public.stock for select using (true);

-- Policy: permitir inserts anónimos (dev only)
create policy "allow insert" on public.stock for insert with check (true);

-- Policy: permitir updates anónimos (dev only)
create policy "allow update" on public.stock for update using (true) with check (true);

-- Policy: permitir deletes anónimos (dev only)
create policy "allow delete" on public.stock for delete using (true);
```

IMPORTANTE: Estas políticas abren la tabla a cualquiera que tenga las keys. Para producción, crea roles, usuarios y políticas que verifiquen `auth.uid()` o usa funciones de JWT.

## 4) Obtener las credenciales

- En Settings -> API: copia `Project URL` como `NEXT_PUBLIC_SUPABASE_URL`.
- Copia `anon` public key como `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 5) `.env.local` ejemplo

Coloca este archivo en la raíz de `ar-aberturas` (Next.js lo detecta):

```
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

No comites `.env.local` al repositorio.

## 6) Probar desde la aplicación

- Levantar la app (`pnpm install` si hace falta, luego `pnpm dev`).
- Abrir la página del dashboard de stock; el componente cargará la tabla `stock` al iniciar.

## 7) Recomendaciones adicionales

- Agregar validaciones en el servidor (RPC) para operaciones complejas.
- Añadir un campo `updated_by` y usar `auth.uid()` en políticas para auditoría.
