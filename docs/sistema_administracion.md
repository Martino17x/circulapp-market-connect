# Sistema de Administración - Panel de Control

Este documento detalla el diseño y arquitectura del sistema de administración para Circulapp, incluyendo gestión de roles, panel de control, y funcionalidades administrativas.

## Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Sistema de Roles y Permisos](#sistema-de-roles-y-permisos)
3. [Arquitectura de Base de Datos](#arquitectura-de-base-de-datos)
4. [Interfaz de Usuario](#interfaz-de-usuario)
5. [Funcionalidades del Panel](#funcionalidades-del-panel)
6. [Seguridad y RLS](#seguridad-y-rls)
7. [Rutas y Navegación](#rutas-y-navegación)
8. [Plan de Implementación](#plan-de-implementación)

---

## Visión General

El sistema de administración permitirá a usuarios con roles especiales (comuna/admin) gestionar la plataforma, moderar contenido, administrar eventos de recolección y supervisar la actividad general.

### Objetivos Principales
- **Gestión de Eventos**: Crear y administrar eventos de recolección para la comunidad
- **Moderación de Contenido**: Supervisar publicaciones y gestionar denuncias
- **Administración de Usuarios**: Ver perfiles, gestionar roles y aplicar sanciones
- **Analíticas**: Visualizar métricas de uso y impacto de la plataforma
- **Configuración**: Administrar parámetros del sistema

### Concepto de Acceso Dual
Los usuarios administradores tendrán acceso a dos interfaces:
1. **Circulapp Normal**: Experiencia de usuario estándar
2. **Panel de Control**: Herramientas administrativas completas

---

## Sistema de Roles y Permisos

### Jerarquía de Roles

```
┌─────────────────────────────────────────┐
│      DESARROLLADOR / COMUNA             │
│  (Control total del sistema)            │
│  - Gestión de roles y permisos          │
│  - Configuración del sistema            │
│  - Acceso completo a todas las funciones│
├─────────────────────────────────────────┤
│           MODERADOR                     │
│  (Moderación de contenido)              │
│  - Gestión de denuncias                 │
│  - Moderación de publicaciones          │
│  - Advertencias a usuarios              │
├─────────────────────────────────────────┤
│           VECINO                        │
│  (Usuario estándar)                     │
│  - Uso normal de la aplicación          │
│  - Publicar materiales                  │
│  - Participar en eventos                │
└─────────────────────────────────────────┘
```

**Nota Importante**: Los roles de **COMUNA** y **DESARROLLADOR** tienen el mismo nivel de permisos (super admin), pero se diferencian conceptualmente:
- **COMUNA**: Administradores oficiales de la municipalidad
- **DESARROLLADOR**: Equipo técnico de desarrollo

### Permisos por Rol

| Permiso | VECINO | MODERADOR | COMUNA/DESARROLLADOR |
|---------|--------|-----------|----------------------|
| Usar la app | ✅ | ✅ | ✅ |
| Ver denuncias | ❌ | ✅ | ✅ |
| Moderar publicaciones | ❌ | ✅ | ✅ |
| Gestionar eventos | ❌ | ❌ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |
| Ver analíticas | ❌ | ❌ | ✅ |
| **Asignar roles y permisos** | ❌ | ❌ | ✅ |
| **Delegar gestión de roles** | ❌ | ❌ | ✅ |
| Configuración sistema | ❌ | ❌ | ✅ |

### Permisos Granulares

```typescript
type UserRole = 'vecino' | 'moderador' | 'comuna' | 'desarrollador';

type Permission = 
  | 'view_dashboard'
  | 'manage_events'
  | 'view_reports'
  | 'moderate_content'
  | 'manage_users'
  | 'view_analytics'
  | 'manage_roles'              // Asignar roles a usuarios
  | 'delegate_role_management'  // Permitir que otros asignen roles
  | 'system_config'
  | 'delete_users'
  | 'ban_users';
```

---

## Arquitectura de Base de Datos

### Nuevas Tablas Requeridas

#### 1. `user_roles` - Sistema de Roles

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('vecino', 'moderador', 'comuna', 'desarrollador')),
  permissions JSONB DEFAULT '[]'::jsonb,
  can_manage_roles BOOLEAN DEFAULT false, -- Si puede asignar roles a otros
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, role)
);

-- Índices
CREATE INDEX idx_user_roles_profile_id ON public.user_roles(profile_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_roles_active ON public.user_roles(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Solo comuna/desarrollador pueden ver todos los roles
CREATE POLICY "Comuna/Desarrollador can view all roles"
  ON public.user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.profile_id = auth.uid()
      AND ur.role IN ('comuna', 'desarrollador')
      AND ur.is_active = true
    )
  );

-- Solo comuna/desarrollador pueden modificar roles
CREATE POLICY "Comuna/Desarrollador can manage roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.profile_id = auth.uid()
      AND ur.role IN ('comuna', 'desarrollador')
      AND ur.is_active = true
    )
  );

-- Solo comuna/desarrollador o usuarios con permiso delegado pueden actualizar roles
CREATE POLICY "Authorized users can update roles"
  ON public.user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.profile_id = auth.uid()
      AND (
        ur.role IN ('comuna', 'desarrollador') OR
        ur.can_manage_roles = true
      )
      AND ur.is_active = true
    )
  );

-- Solo comuna/desarrollador pueden eliminar roles
CREATE POLICY "Comuna/Desarrollador can delete roles"
  ON public.user_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.profile_id = auth.uid()
      AND ur.role IN ('comuna', 'desarrollador')
      AND ur.is_active = true
    )
  );
```

#### 2. `collection_events` - Eventos de Recolección

```sql
CREATE TABLE public.collection_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  accepted_materials TEXT[] DEFAULT ARRAY[]::TEXT[],
  contact_info JSONB,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_events_status ON public.collection_events(status);
CREATE INDEX idx_events_date ON public.collection_events(event_date);
CREATE INDEX idx_events_creator ON public.collection_events(created_by);

-- RLS
ALTER TABLE public.collection_events ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver eventos publicados
CREATE POLICY "Anyone can view published events"
  ON public.collection_events FOR SELECT
  USING (status = 'published' OR created_by = auth.uid());

-- Solo comuna/desarrollador pueden crear eventos
CREATE POLICY "Comuna/Desarrollador can create events"
  ON public.collection_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.profile_id = auth.uid()
      AND ur.role IN ('comuna', 'desarrollador')
      AND ur.is_active = true
    )
  );

-- Solo comuna/desarrollador pueden actualizar eventos
CREATE POLICY "Comuna/Desarrollador can update events"
  ON public.collection_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.profile_id = auth.uid()
      AND ur.role IN ('comuna', 'desarrollador')
      AND ur.is_active = true
    )
  );
```

#### 3. `event_participants` - Participantes de Eventos

```sql
CREATE TABLE public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.collection_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled', 'attended')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Índices
CREATE INDEX idx_participants_event ON public.event_participants(event_id);
CREATE INDEX idx_participants_user ON public.event_participants(user_id);

-- RLS
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their participations"
  ON public.event_participants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can register for events"
  ON public.event_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

#### 4. `reports` - Sistema de Denuncias

```sql
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  reported_item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('spam', 'inappropriate', 'fraud', 'duplicate', 'other')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  reviewed_by UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT check_reported_target CHECK (
    (reported_item_id IS NOT NULL AND reported_user_id IS NULL) OR
    (reported_item_id IS NULL AND reported_user_id IS NOT NULL)
  )
);

-- Índices
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_category ON public.reports(category);
CREATE INDEX idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX idx_reports_item ON public.reports(reported_item_id);
CREATE INDEX idx_reports_user ON public.reports(reported_user_id);

-- RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden crear denuncias
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- Solo moderadores/comuna/desarrollador pueden ver denuncias
CREATE POLICY "Moderators can view reports"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.profile_id = auth.uid()
      AND ur.role IN ('moderador', 'comuna', 'desarrollador')
      AND ur.is_active = true
    )
  );

-- Solo moderadores/comuna/desarrollador pueden actualizar denuncias
CREATE POLICY "Moderators can update reports"
  ON public.reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.profile_id = auth.uid()
      AND ur.role IN ('moderador', 'comuna', 'desarrollador')
      AND ur.is_active = true
    )
  );
```

#### 5. `admin_actions` - Auditoría de Acciones Administrativas

```sql
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action_type TEXT NOT NULL CHECK (action_type IN (
    'delete_item', 'warn_user', 'ban_user', 'unban_user', 
    'delete_user', 'resolve_report', 'create_event', 
    'update_event', 'delete_event', 'assign_role', 'remove_role'
  )),
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'item', 'event', 'report', 'role')),
  target_id UUID NOT NULL,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_admin_actions_admin ON public.admin_actions(admin_id);
CREATE INDEX idx_admin_actions_type ON public.admin_actions(action_type);
CREATE INDEX idx_admin_actions_target ON public.admin_actions(target_type, target_id);
CREATE INDEX idx_admin_actions_date ON public.admin_actions(created_at DESC);

-- RLS
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Solo comuna/desarrollador pueden ver el log de auditoría
CREATE POLICY "Comuna/Desarrollador can view audit log"
  ON public.admin_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.profile_id = auth.uid()
      AND ur.role IN ('comuna', 'desarrollador')
      AND ur.is_active = true
    )
  );

-- Sistema inserta automáticamente (via triggers o backend)
CREATE POLICY "System can insert audit logs"
  ON public.admin_actions FOR INSERT
  WITH CHECK (admin_id = auth.uid());
```

#### 6. `user_warnings` - Advertencias a Usuarios

```sql
CREATE TABLE public.user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  issued_by UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT NOT NULL,
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  related_item_id UUID REFERENCES public.items(id),
  related_report_id UUID REFERENCES public.reports(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_warnings_user ON public.user_warnings(user_id);
CREATE INDEX idx_warnings_active ON public.user_warnings(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their warnings"
  ON public.user_warnings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Moderators can manage warnings"
  ON public.user_warnings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.profile_id = auth.uid()
      AND ur.role IN ('moderador', 'comuna', 'desarrollador')
      AND ur.is_active = true
    )
  );
```

#### 7. `platform_stats` - Estadísticas de la Plataforma

```sql
CREATE TABLE public.platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL UNIQUE,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  items_published INTEGER DEFAULT 0,
  items_completed INTEGER DEFAULT 0,
  total_weight_kg DECIMAL(10, 2) DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_platform_stats_date ON public.platform_stats(stat_date DESC);

-- RLS
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comuna/Desarrollador can view stats"
  ON public.platform_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.profile_id = auth.uid()
      AND ur.role IN ('comuna', 'desarrollador')
      AND ur.is_active = true
    )
  );
```

### Funciones de Utilidad

#### Verificar si un usuario es admin

```sql
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE profile_id = user_id
    AND role IN ('comuna', 'desarrollador')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_moderator(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE profile_id = user_id
    AND role IN ('moderador', 'comuna', 'desarrollador')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_manage_roles(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE profile_id = user_id
    AND (
      role IN ('comuna', 'desarrollador') OR
      can_manage_roles = true
    )
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Obtener estadísticas del dashboard

```sql
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'active_users_today', (SELECT COUNT(DISTINCT user_id) FROM public.items WHERE DATE(created_at) = CURRENT_DATE),
    'total_items', (SELECT COUNT(*) FROM public.items),
    'items_available', (SELECT COUNT(*) FROM public.items WHERE status = 'disponible'),
    'total_weight_kg', (SELECT COALESCE(SUM(weight_kg), 0) FROM public.items),
    'pending_reports', (SELECT COUNT(*) FROM public.reports WHERE status = 'pending'),
    'upcoming_events', (SELECT COUNT(*) FROM public.collection_events WHERE status = 'published' AND event_date > NOW())
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Registrar acción administrativa

```sql
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_reason TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  action_id UUID;
BEGIN
  INSERT INTO public.admin_actions (
    admin_id, action_type, target_type, target_id, reason, metadata
  ) VALUES (
    auth.uid(), p_action_type, p_target_type, p_target_id, p_reason, p_metadata
  ) RETURNING id INTO action_id;
  
  RETURN action_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Interfaz de Usuario

### Pantalla de Selección (Admin Gateway)

Cuando un usuario con rol de admin inicia sesión, verá una pantalla de selección:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         Bienvenido, [Nombre del Admin]         │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │                  │  │                  │   │
│  │   🌱 CirculApp   │  │  ⚙️ Panel de     │   │
│  │                  │  │    Control       │   │
│  │  Ir a la app     │  │                  │   │
│  │  principal       │  │  Administración  │   │
│  │                  │  │                  │   │
│  └──────────────────┘  └──────────────────┘   │
│                                                 │
│  📊 Resumen rápido:                            │
│  ─────────────────────────────────────────────│
│  • 🚨 3 denuncias pendientes                   │
│  • 📅 2 eventos próximos                       │
│  • 👥 45 usuarios activos hoy                  │
│  • 📦 12 publicaciones nuevas                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Layout del Panel de Control

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] CirculApp Admin          [Notif] [User] [Salir] │
├────────┬─────────────────────────────────────────────────┤
│        │                                                 │
│  [≡]   │  Dashboard / Título de Sección                 │
│        │                                                 │
│  🏠     │  ┌─────────────────────────────────────────┐  │
│  Inicio│  │                                         │  │
│        │  │         CONTENIDO PRINCIPAL             │  │
│  📅    │  │                                         │  │
│  Event │  │                                         │  │
│        │  │                                         │  │
│  🚨 (3)│  └─────────────────────────────────────────┘  │
│  Denun │                                                 │
│        │                                                 │
│  🛡️    │                                                 │
│  Moder │                                                 │
│        │                                                 │
│  👥    │                                                 │
│  Usuar │                                                 │
│        │                                                 │
│  📊    │                                                 │
│  Stats │                                                 │
│        │                                                 │
│  ⚙️    │                                                 │
│  Confi │                                                 │
│        │                                                 │
│  ────  │                                                 │
│        │                                                 │
│  🔙    │                                                 │
│  Volver│                                                 │
│        │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

### Componentes del Sidebar

```typescript
// Estructura del sidebar
const adminSidebarItems = [
  {
    id: 'dashboard',
    label: 'Inicio',
    icon: Home,
    path: '/admin/dashboard',
    badge: null
  },
  {
    id: 'events',
    label: 'Eventos',
    icon: Calendar,
    path: '/admin/events',
    badge: null
  },
  {
    id: 'reports',
    label: 'Denuncias',
    icon: AlertTriangle,
    path: '/admin/reports',
    badge: pendingReportsCount // Número dinámico
  },
  {
    id: 'moderation',
    label: 'Moderación',
    icon: Shield,
    path: '/admin/moderation',
    badge: null
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: Users,
    path: '/admin/users',
    badge: null
  },
  {
    id: 'analytics',
    label: 'Estadísticas',
    icon: BarChart,
    path: '/admin/analytics',
    badge: null
  },
  {
    id: 'roles',
    label: 'Gestión de Roles',
    icon: Shield,
    path: '/admin/roles',
    badge: null,
    requiresPermission: 'manage_roles' // Solo comuna/desarrollador o delegados
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings,
    path: '/admin/settings',
    badge: null,
    requiresAdmin: true // Solo comuna/desarrollador
  }
];
```

---

## Funcionalidades del Panel

### 1. Dashboard (Inicio)

**Métricas Principales:**
- Total de usuarios registrados
- Usuarios activos (hoy/semana/mes)
- Total de publicaciones
- Publicaciones activas vs completadas
- Peso total de materiales (kg)
- CO2 ahorrado estimado
- Eventos programados
- Denuncias pendientes

**Gráficos:**
- Línea de tiempo: Nuevos usuarios (últimos 30 días)
- Barras: Publicaciones por categoría de material
- Dona: Estado de publicaciones (disponible/reservado/retirado)
- Mapa de calor: Actividad por zona geográfica

**Accesos Rápidos:**
- Crear nuevo evento
- Ver denuncias pendientes
- Publicaciones recientes
- Usuarios nuevos

### 2. Gestión de Eventos

**Vista Principal:**
- Lista de eventos (tabla/cards)
- Filtros: estado, fecha, ubicación
- Búsqueda por título

**Crear/Editar Evento:**
```typescript
interface CollectionEvent {
  title: string;
  description: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  event_date: Date;
  end_date?: Date;
  max_participants?: number;
  accepted_materials: string[];
  contact_info: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  image_url?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
}
```

**Acciones:**
- Crear evento (borrador o publicar directamente)
- Editar evento
- Publicar/despublicar
- Cancelar evento
- Marcar como completado
- Ver lista de participantes
- Exportar participantes (CSV)

### 3. Sistema de Denuncias

**Vista de Denuncias:**
- Tabla con filtros: estado, categoría, prioridad
- Columnas: ID, Denunciante, Tipo, Categoría, Estado, Fecha
- Acciones rápidas: Ver detalle, Resolver, Desestimar

**Detalle de Denuncia:**
```
┌─────────────────────────────────────────┐
│  Denuncia #12345                        │
├─────────────────────────────────────────┤
│  📋 Información                         │
│  • Categoría: Spam                      │
│  • Prioridad: Media                     │
│  • Estado: Pendiente                    │
│  • Fecha: 2025-10-07 15:30             │
│                                         │
│  👤 Denunciante                         │
│  • Usuario: @juan_perez                │
│  • Email: juan@example.com             │
│                                         │
│  🎯 Elemento Denunciado                │
│  • Tipo: Publicación                   │
│  • Título: "Vendo plásticos..."        │
│  • Autor: @maria_lopez                 │
│  • [Ver publicación]                   │
│                                         │
│  📝 Descripción                        │
│  "Esta publicación parece spam..."     │
│                                         │
│  ⚡ Acciones                            │
│  [Resolver] [Investigar] [Desestimar] │
│  [Advertir Usuario] [Eliminar Item]   │
└─────────────────────────────────────────┘
```

**Workflow de Resolución:**
1. Revisar denuncia
2. Investigar (cambiar estado a "reviewing")
3. Tomar acción:
   - Desestimar (sin acción)
   - Advertir al usuario
   - Eliminar publicación
   - Suspender usuario
4. Agregar notas de resolución
5. Marcar como resuelta

### 4. Moderación de Publicaciones

**Vista de Moderación:**
- Grid/Lista de publicaciones
- Filtros avanzados:
  - Estado (disponible/reservado/retirado)
  - Categoría de material
  - Con denuncias
  - Sin verificar
  - Por usuario
  - Rango de fechas

**Acciones en Publicación:**
- Ver detalle completo
- Editar (como admin)
- Eliminar con justificación
- Advertir al autor
- Marcar como verificada
- Destacar publicación

**Acciones en Lote:**
- Seleccionar múltiples publicaciones
- Eliminar seleccionadas
- Cambiar estado
- Exportar datos

### 5. Gestión de Usuarios

**Vista de Usuarios:**
- Tabla con información clave
- Columnas: Avatar, Username, Email, Rol, Publicaciones, Estado, Fecha registro
- Búsqueda y filtros:
  - Por rol
  - Por actividad (activo/inactivo)
  - Con advertencias
  - Suspendidos

**Perfil de Usuario (Vista Admin):**
```
┌─────────────────────────────────────────┐
│  👤 @username                           │
│  [Avatar]                               │
├─────────────────────────────────────────┤
│  📊 Información General                 │
│  • Email: user@example.com             │
│  • Teléfono: +56 9 1234 5678           │
│  • Rol: Usuario                        │
│  • Miembro desde: 15 Ago 2025          │
│  • Última actividad: Hace 2 horas      │
│                                         │
│  📈 Estadísticas                        │
│  • Publicaciones: 12 (8 activas)       │
│  • Peso total: 45.5 kg                 │
│  • Eventos asistidos: 3                │
│  • Denuncias recibidas: 0              │
│  • Advertencias: 0                     │
│                                         │
│  📦 Publicaciones Recientes             │
│  [Lista de últimas 5 publicaciones]    │
│                                         │
│  ⚠️ Historial de Infracciones          │
│  [Lista de advertencias/sanciones]     │
│                                         │
│  ⚡ Acciones Administrativas            │
│  [Advertir] [Suspender] [Cambiar Rol]  │
│  [Ver Historial Completo]              │
└─────────────────────────────────────────┘
```

**Acciones sobre Usuarios:**
- Ver perfil completo
- Enviar advertencia
- Suspender temporalmente
- Banear permanentemente
- Eliminar cuenta
- Cambiar rol (solo super_admin)
- Ver historial de actividad
- Ver historial de denuncias

### 6. Estadísticas Avanzadas

**Secciones:**

**A. Usuarios**
- Crecimiento de usuarios (gráfico de línea)
- Usuarios activos vs inactivos
- Distribución geográfica
- Tasa de retención

**B. Publicaciones**
- Publicaciones por categoría
- Tendencias de publicación
- Tiempo promedio hasta completar
- Peso total por material

**C. Impacto Ambiental**
- Total de kg reciclados
- CO2 ahorrado estimado
- Comparativas mensuales
- Proyecciones

**D. Eventos**
- Asistencia promedio
- Eventos por mes
- Materiales recolectados
- Participación por zona

**E. Moderación**
- Denuncias por categoría
- Tiempo de resolución
- Acciones administrativas
- Usuarios sancionados

**Exportación:**
- Generar reportes PDF
- Exportar datos CSV/Excel
- Programar reportes automáticos

### 7. Configuración del Sistema

**Categorías de Material:**
- Agregar/editar/eliminar categorías
- Definir iconos y colores
- Establecer unidades de medida

**Textos Legales:**
- Términos y condiciones
- Política de privacidad
- Reglas de la comunidad

**Notificaciones:**
- Configurar emails automáticos
- Templates de notificaciones
- Frecuencia de recordatorios

**Parámetros del Sistema:**
- Límites de publicaciones por usuario
- Tamaño máximo de imágenes
- Duración de sesiones
- Configuración de mapas

---

## Seguridad y RLS

### Principios de Seguridad

1. **Verificación de Roles en Cada Operación**
   - Todas las operaciones administrativas verifican el rol del usuario
   - RLS policies en todas las tablas administrativas

2. **Auditoría Completa**
   - Todas las acciones administrativas se registran en `admin_actions`
   - Incluye: quién, qué, cuándo, por qué

3. **Separación de Permisos**
   - Moderadores: solo moderación de contenido
   - Admins: gestión completa excepto roles
   - Super Admins: control total

4. **Protección de Datos Sensibles**
   - Emails y teléfonos solo visibles para admins
   - Información de denuncias protegida
   - Logs de auditoría solo para super admins

### Middleware de Protección (Frontend)

```typescript
// Hook para verificar permisos de admin
export const useAdminAuth = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role, permissions')
        .eq('profile_id', user.id)
        .eq('is_active', true)
        .single();

      if (data) {
        setRole(data.role);
        setPermissions(data.permissions || []);
      }
      
      setLoading(false);
    };

    checkAdminRole();
  }, [user]);

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const isAdmin = () => {
    return ['comuna', 'desarrollador'].includes(role || '');
  };

  const isModerator = () => {
    return ['moderador', 'comuna', 'desarrollador'].includes(role || '');
  };

  const canManageRoles = () => {
    return isAdmin() || permissions.includes('manage_roles');
  };

  return { role, permissions, hasPermission, isAdmin, isModerator, canManageRoles, loading };
};

// Componente de ruta protegida para admin
export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin()) {
      navigate('/app');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin()) {
    return null;
  }

  return <>{children}</>;
};
```

---

## Rutas y Navegación

### Estructura de Rutas

```typescript
// En src/App.tsx
const adminRoutes = [
  {
    path: '/admin',
    element: <AdminGateway />, // Pantalla de selección
  },
  {
    path: '/admin',
    element: <AdminLayout />, // Layout con sidebar
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />
      },
      {
        path: 'events',
        element: <EventsManagement />
      },
      {
        path: 'events/create',
        element: <CreateEvent />
      },
      {
        path: 'events/:id/edit',
        element: <EditEvent />
      },
      {
        path: 'reports',
        element: <ReportsManagement />
      },
      {
        path: 'reports/:id',
        element: <ReportDetail />
      },
      {
        path: 'moderation',
        element: <ContentModeration />
      },
      {
        path: 'users',
        element: <UsersManagement />
      },
      {
        path: 'users/:id',
        element: <UserDetailAdmin />
      },
      {
        path: 'analytics',
        element: <Analytics />
      },
      {
        path: 'settings',
        element: <SystemSettings />,
        // Solo super admins
      }
    ]
  }
];
```

### Navegación entre Contextos

**Desde App Normal a Admin:**
- Botón en el menú de usuario (solo visible para admins)
- Ruta: `/admin`

**Desde Admin a App Normal:**
- Botón "Volver a CirculApp" en sidebar
- Ruta: `/app`

---

## Plan de Implementación

### Fase 1: Fundamentos (Semana 1-2)

**Prioridad: Alta**

1. **Base de Datos**
   - ✅ Crear migración para `user_roles`
   - ✅ Crear migración para `collection_events`
   - ✅ Crear migración para `event_participants`
   - ✅ Implementar funciones de utilidad (`is_admin`, etc.)

2. **Autenticación y Roles**
   - ✅ Hook `useAdminAuth`
   - ✅ Componente `AdminRoute`
   - ✅ Lógica de verificación de roles

3. **Layout Básico**
   - ✅ Componente `AdminLayout` con sidebar
   - ✅ Pantalla `AdminGateway` (selección)
   - ✅ Navegación entre contextos

4. **Dashboard MVP**
   - ✅ Métricas básicas
   - ✅ Función `get_dashboard_stats()`
   - ✅ Cards de estadísticas

### Fase 2: Gestión de Eventos (Semana 3)

**Prioridad: Alta**

1. **CRUD de Eventos**
   - ✅ Formulario de creación
   - ✅ Lista de eventos
   - ✅ Edición de eventos
   - ✅ Cambio de estado

2. **Participantes**
   - ✅ Registro de usuarios en eventos
   - ✅ Lista de participantes
   - ✅ Exportación de datos

3. **Vista Pública**
   - ✅ Calendario de eventos en `/app/recoleccion`
   - ✅ Detalle de evento
   - ✅ Botón de registro

### Fase 3: Moderación (Semana 4)

**Prioridad: Media-Alta**

1. **Sistema de Denuncias**
   - ✅ Crear migración para `reports`
   - ✅ Formulario de denuncia (frontend usuario)
   - ✅ Vista de denuncias (admin)
   - ✅ Workflow de resolución

2. **Moderación de Contenido**
   - ✅ Vista de publicaciones con filtros
   - ✅ Acciones sobre publicaciones
   - ✅ Sistema de advertencias (`user_warnings`)

3. **Auditoría**
   - ✅ Tabla `admin_actions`
   - ✅ Función `log_admin_action()`
   - ✅ Triggers automáticos

### Fase 4: Gestión de Usuarios (Semana 5)

**Prioridad: Media**

1. **Vista de Usuarios**
   - ✅ Lista con filtros
   - ✅ Búsqueda
   - ✅ Perfil detallado (vista admin)

2. **Acciones Administrativas**
   - ✅ Sistema de advertencias
   - ✅ Suspensión temporal
   - ✅ Cambio de roles (super admin)

3. **Historial**
   - ✅ Historial de infracciones
   - ✅ Historial de actividad

### Fase 5: Analíticas (Semana 6)

**Prioridad: Media-Baja**

1. **Estadísticas Avanzadas**
   - ✅ Tabla `platform_stats`
   - ✅ Gráficos con Chart.js o Recharts
   - ✅ Filtros por fecha

2. **Reportes**
   - ✅ Exportación PDF
   - ✅ Exportación CSV
   - ✅ Reportes programados

3. **Impacto Ambiental**
   - ✅ Cálculo de CO2 ahorrado
   - ✅ Métricas de impacto
   - ✅ Comparativas

### Fase 6: Configuración (Semana 7)

**Prioridad: Baja**

1. **Gestión de Categorías**
   - ✅ CRUD de categorías de materiales
   - ✅ Iconos y colores

2. **Textos del Sistema**
   - ✅ Editor de términos y condiciones
   - ✅ Editor de políticas

3. **Parámetros**
   - ✅ Configuración de límites
   - ✅ Configuración de notificaciones

---

## Consideraciones Técnicas

### Stack Tecnológico

**Frontend:**
- React + TypeScript (ya existente)
- Tailwind CSS (ya existente)
- shadcn/ui components (ya existente)
- Nuevas librerías:
  - `recharts` o `chart.js` para gráficos
  - `react-big-calendar` para calendario de eventos
  - `react-table` o `@tanstack/react-table` para tablas avanzadas
  - `jspdf` para exportación PDF

**Backend:**
- Supabase (ya existente)
- Nuevas funciones RPC
- Triggers para auditoría automática

### Estructura de Archivos

```
src/
├── pages/
│   └── admin/
│       ├── AdminGateway.tsx
│       ├── Dashboard.tsx
│       ├── EventsManagement.tsx
│       ├── CreateEvent.tsx
│       ├── EditEvent.tsx
│       ├── ReportsManagement.tsx
│       ├── ReportDetail.tsx
│       ├── ContentModeration.tsx
│       ├── UsersManagement.tsx
│       ├── UserDetailAdmin.tsx
│       ├── Analytics.tsx
│       └── SystemSettings.tsx
├── components/
│   └── admin/
│       ├── AdminLayout.tsx
│       ├── AdminSidebar.tsx
│       ├── AdminRoute.tsx
│       ├── DashboardCard.tsx
│       ├── StatsChart.tsx
│       ├── EventCard.tsx
│       ├── ReportCard.tsx
│       ├── UserCard.tsx
│       └── AdminTable.tsx
├── hooks/
│   └── useAdminAuth.ts
└── types/
    └── admin.ts
```

### Migraciones a Crear

```
supabase/migrations/
├── 20251007000000_create_user_roles.sql
├── 20251007000001_create_collection_events.sql
├── 20251007000002_create_event_participants.sql
├── 20251007000003_create_reports.sql
├── 20251007000004_create_admin_actions.sql
├── 20251007000005_create_user_warnings.sql
├── 20251007000006_create_platform_stats.sql
└── 20251007000007_create_admin_functions.sql
```

---

## Mejoras Futuras

### Corto Plazo
- Notificaciones en tiempo real para admins (Supabase Realtime)
- Sistema de tickets de soporte
- Chat directo con usuarios desde el panel

### Mediano Plazo
- Dashboard personalizable (widgets arrastrables)
- Reportes automáticos por email
- Integración con analytics (Google Analytics, Mixpanel)
- Sistema de roles personalizados (permisos granulares)

### Largo Plazo
- Machine Learning para detección automática de spam
- Sistema de reputación de usuarios
- Gamificación para moderadores
- API pública para integraciones

---

## Resumen Ejecutivo

Este sistema de administración transformará Circulapp en una plataforma completamente gestionable, permitiendo:

1. **Control Total**: Gestión completa de usuarios, contenido y eventos
2. **Moderación Efectiva**: Sistema robusto de denuncias y moderación
3. **Visibilidad**: Dashboard con métricas clave y analíticas avanzadas
4. **Escalabilidad**: Arquitectura preparada para crecimiento
5. **Seguridad**: RLS y auditoría completa de acciones
6. **Experiencia de Usuario**: Interfaz intuitiva y eficiente

El sistema está diseñado para ser implementado en fases, priorizando las funcionalidades críticas (roles, eventos, moderación) antes que las complementarias (analíticas avanzadas, configuración).

---

**Última actualización**: 7 de Octubre, 2025  
**Versión**: 1.0  
**Estado**: Diseño Completo - Pendiente Implementación
