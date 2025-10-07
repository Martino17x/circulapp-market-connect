# Routing de Circulapp

Este documento detalla las rutas de la aplicación y sus componentes asociados, según `src/App.tsx`.

## Rutas públicas
- **`/`** → `Index`
- **`/auth`** → `Auth`
- **`/reset-password`** → `Auth`
- **`/privacy-policy`** → `PrivacyPolicy`
- **`/terms-of-service`** → `TermsOfService`

## Rutas protegidas (`/app/*`)
Las rutas bajo `/app` están envueltas por `ProtectedRoute` y usan el layout `AppLayout`.

- **`/app`** → `Dashboard`
- **`/app/marketplace`** → `Marketplace`
- **`/app/buscar`** → `Marketplace` (alias)
- **`/app/publicar`** → `PublishItem`
- **`/app/mapa`** → `MapPage`
- **`/app/chat`** → `ChatPage`
- **`/app/recoleccion`** → `ComingSoon`
- **`/app/item/:id`** → `ItemDetail`
- **`/app/item/:id/edit`** → `EditItem`
- **`/app/perfil`** → `UserProfile`
- **`/app/editar-perfil`** → `Profile`
- **`/app/denuncias`** → `ComingSoon`

## Componentes clave de navegación
- `src/components/circulapp/AppLayout.tsx`: contiene la **sidebar**, la **top bar** y la **bottom navigation** para mobile.
- `src/components/circulapp/ProtectedRoute.tsx`: protege rutas verificando sesión del usuario.

## Notas
- El SEO por página (título y meta descripción) se ajusta en vistas como `Marketplace`, `PublishItem` e `ItemDetail`.
- `PWAInstallPrompt` está montado en el nivel de router para el aviso de instalación.
