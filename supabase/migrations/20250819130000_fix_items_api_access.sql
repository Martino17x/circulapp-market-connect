-- Verificar si la tabla materials existe y renombrarla a items si es necesario
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'materials') THEN
        EXECUTE 'ALTER TABLE public.materials RENAME TO items';
    END IF;
    
    -- Si la tabla items no existe, crearla
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'items') THEN
        CREATE TABLE public.items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id),
            title TEXT NOT NULL,
            description TEXT,
            material_type TEXT NOT NULL,
            weight_kg NUMERIC(10,2),
            location_name TEXT,
            latitude NUMERIC(10,6),
            longitude NUMERIC(10,6),
            image_url TEXT,
            status TEXT DEFAULT 'disponible',
            price NUMERIC(10,2) DEFAULT 0,
            is_free BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Crear trigger para actualizar updated_at
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.items
        FOR EACH ROW
        EXECUTE FUNCTION public.set_updated_at();
        
        -- Crear índices para mejorar el rendimiento
        CREATE INDEX items_user_id_idx ON public.items (user_id);
        CREATE INDEX items_status_idx ON public.items (status);
        CREATE INDEX items_material_type_idx ON public.items (material_type);
    END IF;
END
$$;

-- Asegurar que la tabla items esté correctamente expuesta en la API REST
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Recrear las políticas de seguridad para la tabla items
DROP POLICY IF EXISTS "Users can view all available items" ON public.items;
DROP POLICY IF EXISTS "Users can create their own items" ON public.items;
DROP POLICY IF EXISTS "Users can update their own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete their own items" ON public.items;

-- Crear políticas de seguridad para la tabla items
CREATE POLICY "Users can view all available items" 
ON public.items 
FOR SELECT 
USING (status = 'disponible' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own items" 
ON public.items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" 
ON public.items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" 
ON public.items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Asegurar que la API REST tenga acceso a la tabla items
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO anon, authenticated;