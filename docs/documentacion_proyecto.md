# Documentación del Proyecto Circulapp Market Connect

## Estructura General del Proyecto

Este es un proyecto de React con TypeScript que utiliza Vite como bundler. La aplicación está enfocada en la economía circular, permitiendo a los usuarios publicar, buscar y gestionar materiales reutilizables.

### Tecnologías principales:
- **Frontend**: React, TypeScript, Tailwind CSS
- **Routing**: React Router
- **Estado**: React Query
- **UI Components**: Radix UI con personalización
- **Backend/Base de datos**: Supabase

## Arquitectura de la Aplicación

La aplicación sigue una estructura organizada:

1. **Autenticación**: Sistema completo con registro, inicio de sesión y gestión de sesiones mediante Supabase Auth.

2. **Componentes UI**: Utiliza una combinación de componentes personalizados y componentes de Radix UI con estilos de Tailwind.

3. **Rutas**: La aplicación tiene dos secciones principales:
   - Rutas públicas (landing page, autenticación)
   - Rutas protegidas (dashboard, marketplace, perfil, etc.)

4. **Marketplace**: Funcionalidad central que permite:
   - Publicar ítems reutilizables
   - Buscar ítems con filtros
   - Ver detalles de ítems
   - Editar ítems propios

5. **Integración con Supabase**: La aplicación utiliza Supabase para:
   - Autenticación de usuarios
   - Almacenamiento de datos (perfiles, ítems)
   - Consultas en tiempo real

## Ruteo de la App (real)

Las rutas están definidas en `src/App.tsx` y protegidas con `ProtectedRoute` dentro del layout `src/components/circulapp/AppLayout.tsx`.

- **Públicas**:
  - `/` → `Index`
  - `/auth` y `/reset-password` → `Auth`
  - `/privacy-policy` → `PrivacyPolicy`
  - `/terms-of-service` → `TermsOfService`
- **Protegidas** (bajo `/app`):
  - `/app` → `Dashboard`
  - `/app/marketplace` y `/app/buscar` → `Marketplace`
  - `/app/publicar` → `PublishItem`
  - `/app/mapa` → `MapPage`
  - `/app/chat` → `ChatPage`
  - `/app/recoleccion` → `ComingSoon`
  - `/app/item/:id` → `ItemDetail`
  - `/app/item/:id/edit` → `EditItem`
  - `/app/perfil` → `UserProfile`
  - `/app/editar-perfil` → `Profile`
  - `/app/denuncias` → `ComingSoon`

Más detalles en `docs/routing.md`.

## Funcionalidades principales

1. **Marketplace de Materiales**: Permite a los usuarios publicar y encontrar materiales reutilizables.

2. **Sistema de Mapas**: Visualización geográfica de los materiales disponibles.

3. **Perfiles de Usuario**: Gestión de información personal y materiales publicados.

4. **Chat**: Funcionalidad para comunicación entre usuarios (marcada como "próximamente").

5. **Recolección**: Sistema para gestionar la recolección de materiales (marcada como "próximamente").

## Estructura de Datos

La aplicación trabaja principalmente con:

1. **Usuarios y Perfiles**: Información de autenticación y datos personales.

2. **Ítems**: Materiales publicados con propiedades como tipo, peso, ubicación e imágenes.

3. **Categorías**: Clasificación de los diferentes tipos de materiales.

## Estructura de la Base de Datos (Supabase)

### 1. Tabla de Perfiles (`profiles`)
- **Propósito**: Almacena información adicional de los usuarios
- **Campos principales**:
  - `id`: UUID (clave primaria)
  - `user_id`: UUID (referencia a auth.users)
  - `username`: Nombre de usuario único
  - `full_name`: Nombre completo
  - `avatar_url`: URL de la imagen de perfil
  - `phone`: Número de teléfono
  - `bio`: Biografía del usuario
  - `created_at` y `updated_at`: Timestamps

- **Seguridad**: 
  - Políticas RLS que permiten a los usuarios ver, insertar y actualizar solo sus propios perfiles
  - Función `get_public_profile` para acceder a datos públicos limitados

### 2. Tabla de Ítems (`items`, anteriormente `materials`)
- **Propósito**: Almacena los materiales/ítems publicados en el marketplace
- **Campos principales**:
  - `id`: UUID (clave primaria)
  - `user_id`: UUID (referencia a auth.users)
  - `title`: Título del ítem
  - `description`: Descripción detallada
  - `material_type`: Tipo de material (plastico, carton, vidrio, metal, etc.)
  - `weight_kg`: Peso en kilogramos
  - `location_name`: Nombre de la ubicación
  - `latitude` y `longitude`: Coordenadas geográficas
  - `image_urls`: ARRAY de URLs de imágenes del ítem (migración: `20250923180000_add_multiple_images_to_items.sql`)
  - `status`: Estado (disponible, reservado, retirado)
  - `created_at` y `updated_at`: Timestamps
  - `price`: Precio numérico
  - `is_free`: Booleano, si es gratuito

- **Seguridad**:
  - Políticas RLS que permiten:
    - Ver ítems disponibles a todos los usuarios (incluye `anon` con `status = 'disponible'`)
    - Ver ítems propios independientemente del estado
    - Crear, actualizar y eliminar solo ítems propios
  - Ver políticas en `20250819130000_fix_items_api_access.sql` y `20250923220000_allow_anon_read_on_items.sql`

### 3. Vista de Estadísticas (`user_stats`)
- **Propósito**: Proporciona estadísticas agregadas por usuario
- **Datos calculados**:
  - Total de publicaciones
  - Peso total de materiales
  - Publicaciones activas
  - Publicaciones completadas
  - Fecha de última publicación
  - Tipo de material más frecuente

Implementado como función `get_user_stats(uuid)` en `20250923230000_create_get_user_stats_function.sql`.

### 4. Sistema de Chat (tablas y funcion)
- Tablas: `conversations`, `messages` con RLS y triggers para `updated_at`.
- Funciones:
  - `get_or_create_conversation(user1_id, user2_id)`
  - `start_conversation_about_item(other_user_id, item_id, initial_message)`
- Ver migraciones: `20250902100000_create_chat_system.sql` y `20250902110000_add_item_references_to_messages.sql`.

### 5. Storage de Imágenes
- Bucket `item-images` creado en `20250902210000_create_storage_bucket.sql`.
- En frontend, subida y obtención de URL pública en `src/pages/app/PublishItem.tsx` y lectura en `src/pages/app/Marketplace.tsx` e `src/pages/app/ItemDetail.tsx`.

### Características Generales
- Implementación de Row Level Security (RLS) en todas las tablas
- Triggers para actualización automática de timestamps
- Creación automática de perfiles al registrarse un usuario
- Índices para optimizar consultas frecuentes
- Migración para renombrar la tabla `materials` a `items` para mayor claridad

## Estructura de Archivos

- **src/App.tsx**: Configuración principal de rutas y proveedores de contexto.
- **src/contexts/AuthContext.tsx**: Gestión de autenticación y sesión de usuario.
- **src/integrations/supabase/client.ts**: Configuración del cliente de Supabase.
- **src/components/circulapp/AppLayout.tsx**: Layout principal para las páginas autenticadas.
- **src/pages/app/Marketplace.tsx**: Implementación del marketplace de materiales.
 - **src/pages/app/PublishItem.tsx**: Publicación con subida múltiple de imágenes a Storage.
 - **src/pages/app/ItemDetail.tsx**: Detalle de ítem y acción de iniciar chat.
 - **src/pages/app/EditItem.tsx**: Edición y eliminación de publicaciones propias.

## Notas Adicionales

El proyecto está bien estructurado, siguiendo buenas prácticas de desarrollo y con una clara separación de responsabilidades entre componentes. La interfaz de usuario es moderna y utiliza componentes reutilizables para mantener la consistencia visual.

## Referencias rápidas

- Configuración y variables de entorno: `docs/instalacion_configuracion.md`
- Detalle de rutas: `docs/routing.md`
- Detalle de Supabase (tablas, RLS, funcion, storage): `docs/supabase.md`
- Anexo técnico: `docs/anexo_tecnico.md`