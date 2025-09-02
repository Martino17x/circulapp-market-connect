# Documentación del Proyecto Circulapp Market Connect

## Estructura General del Proyecto

Este es un proyecto de React con TypeScript que utiliza Vite como bundler. La aplicación está enfocada en la economía circular, permitiendo a los usuarios publicar, buscar y gestionar materiales reutilizables.

### Tecnologías Principales:
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

## Funcionalidades Principales

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
  - `image_url`: URL de la imagen del ítem
  - `status`: Estado (disponible, reservado, retirado)
  - `created_at` y `updated_at`: Timestamps

- **Seguridad**:
  - Políticas RLS que permiten:
    - Ver ítems disponibles a todos los usuarios
    - Ver ítems propios independientemente del estado
    - Crear, actualizar y eliminar solo ítems propios

### 3. Vista de Estadísticas (`user_stats`)
- **Propósito**: Proporciona estadísticas agregadas por usuario
- **Datos calculados**:
  - Total de publicaciones
  - Peso total de materiales
  - Publicaciones activas
  - Publicaciones completadas
  - Fecha de última publicación
  - Tipo de material más frecuente

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

## Notas Adicionales

El proyecto está bien estructurado, siguiendo buenas prácticas de desarrollo y con una clara separación de responsabilidades entre componentes. La interfaz de usuario es moderna y utiliza componentes reutilizables para mantener la consistencia visual.