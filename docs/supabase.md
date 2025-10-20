# Supabase: Esquema, RLS, funciones y Storage

Este documento resume el backend en Supabase según las migraciones en `supabase/migrations/` y el uso en el código fuente.

## Tablas principales

### `profiles`
- Campos: `id (uuid pk)`, `user_id (uuid fk auth.users)`, `username`, `full_name`, `avatar_url`, `phone`, `bio`, `created_at`, `updated_at`.
- RLS: los usuarios pueden leer/crear/actualizar su propio perfil.
- Uso en frontend: `src/pages/app/Profile.tsx` (carga/edición) y en tarjetas `ItemDetail`/`Marketplace` para mostrar nombre/imagen.

### `items` (antes `materials`)
- Migraciones relevantes: 
  - `20250819120000_rename_materials_to_items.sql` (rename)
  - `20250819130000_fix_items_api_access.sql` (creación + RLS base)
  - `20250923180000_add_multiple_images_to_items.sql` (multi-imagen)
  - `20250923220000_allow_anon_read_on_items.sql` (lectura pública de disponibles)
- Campos (principales):
  - `id`, `user_id`, `title`, `description`, `material_type`, `weight_kg`, `location_name`, `latitude`, `longitude`, `status`, `price`, `is_free`, `created_at`, `updated_at`.
  - `image_urls` (TEXT[]): URLs públicas de Storage (reemplaza `image_url`).
- RLS (ver SQL):
  - SELECT: disponible a todos si `status = 'disponible'`; propietario ve sus ítems siempre.
  - INSERT/UPDATE/DELETE: solo el propietario (`auth.uid() = user_id`).
- Índices: por `user_id`, `status`, `material_type`.

## Chat

### Tablas
- `conversations`: `participant_1`, `participant_2`, `created_at`, `updated_at`. RLS: ver/crear si `auth.uid()` participa.
- `messages`: `conversation_id`, `sender_id`, `content`, `created_at`, `read_at`, `item_id?`. RLS: ver si pertenecen a una conversación del usuario; insertar si es el emisor y pertenece.

### Funciones
- `get_or_create_conversation(user1_id, user2_id)`
- `start_conversation_about_item(other_user_id, item_id, initial_message default null)`

Triggers e índices incluidos para performance y actualización de `updated_at` de conversaciones.

## Funciones de utilidad

### `get_user_stats(target_user_id uuid)`
- Retorna: `total_posts`, `total_weight_kg`, `active_posts`, `completed_posts`, `most_frequent_type`.
- Uso: mostrar estadísticas de usuario (Dashboard/Perfil).

## Storage

### Bucket `item-images`
- Migración: `20250902210000_create_storage_bucket.sql`.
- Público para lectura; políticas que restringen inserción/actualización/eliminación al dueño (prefijo `user_id/archivo`).
- Frontend:
  - Subida paralela en `src/pages/app/PublishItem.tsx` (hasta 10 imágenes).
  - Obtención de URL pública: `supabase.storage.from('item-images').getPublicUrl(path)`.
  - Lectura/render en `Marketplace`/`ItemDetail`.

## Notas de seguridad
- Evitar exponer claves en el repo. Usar `.env.local` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- Mantener RLS habilitado; validar que políticas cubran todos los casos (ya están en migraciones citadas).

## Referencias
- Código: `src/integrations/supabase/client.ts`, `src/contexts/AuthContext.tsx`.
- Migraciones: ver carpeta `supabase/migrations/`.
