# Anexo Técnico

Este anexo profundiza en aspectos técnicos: arquitectura, seguridad, rendimiento, decisiones de diseño y puntos a futuro.

## Arquitectura general
- **Frontend**: React + TypeScript con Vite, estilos con Tailwind, UI con shadcn/Radix.
- **Estado**: React Query en `src/App.tsx`.
- **Ruteo**: React Router. Rutas públicas y protegidas en `src/App.tsx`. Layout en `src/components/circulapp/AppLayout.tsx`.
- **Backend (BaaS)**: Supabase (Auth, DB, RLS, Storage, RPC).

## Autenticación y sesión
- `src/contexts/AuthContext.tsx` gestiona `user`, `session`, `signIn/signUp/signOut`.
- Limpieza proactiva de `localStorage` en cambios de estado (evita estados sucios entre sesiones).
- Redirecciones post auth a `/app` y post signout a `/`.

## Seguridad (RLS y políticas)
- `items` con RLS: SELECT público de ítems `disponible` (incluye `anon`), y acceso completo solo para el dueño.
- `profiles` limitado al dueño para INSERT/UPDATE/SELECT propio.
- Storage `item-images` con políticas por carpeta (`user_id/archivo`):
  - Lectura pública.
  - Inserción/actualización/eliminación restringidas al propietario autenticado.

## Modelo de datos y funciones
- `items` soporta múltiples imágenes con `image_urls` (TEXT[]). Migración: `20250923180000_add_multiple_images_to_items.sql`.
- `get_user_stats(uuid)` retorna métricas por usuario (totales, activos, retirados, tipo más frecuente).
- Chat: `conversations` y `messages` con RLS + triggers. Funciones `get_or_create_conversation` y `start_conversation_about_item`.

## Subida de imágenes (front)
- `src/pages/app/PublishItem.tsx` sube en paralelo hasta 10 imágenes al bucket `item-images`.
- Obtiene las URLs públicas y persiste `image_urls` en `items`.
- En caso de error de inserción, elimina las imágenes subidas para evitar archivos huérfanos.

## Mapas y búsqueda
- `src/pages/app/MapPage.tsx` contiene un mock de mapa y filtros. Integración con mapas reales está en la hoja de ruta.
- `Marketplace` realiza filtros por `material_type`, `weight_kg`, `q` y orden por `created_at`.

## Rendimiento y UX
- Carga perezosa de recursos de imágenes vía URLs públicas.
- Esqueletos (`Skeleton`) en listas, placeholders en detalle.
- Meta tags por vista para SEO básico (función `setMeta` local por página).

## PWA
- `PWAInstallPrompt` en `src/App.tsx`.
- `public/manifest.json` y `public/sw.js` presentes.

## Deploy
- El proyecto incluye `vercel.json`. Para otras plataformas, ajustar build (`npm run build`).

## Riesgos y mitigaciones
- Exposición de claves: usar `.env.local` (no versionar). Evitar archivos como `variables.txt` con llaves/sensibles en repositorio.
- Consistencia de imágenes: se eliminan uploads si falla la inserción de DB.
- Integridad de RLS: validar nuevas features contra políticas existentes.

## Próximos pasos sugeridos
- Integrar mapas reales (Leaflet/Mapbox) y geocodificación inversa.
- Añadir paginación e infinite scroll en `Marketplace`.
- Mejorar chat (notificaciones, read receipts, typing).
- Moderación/denuncias y panel admin (subdominio) como indica `README.md`.
