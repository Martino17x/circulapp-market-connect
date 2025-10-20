-- Renombrar la tabla de 'materials' a 'items'
ALTER TABLE public.materials RENAME TO items;

-- Renombrar las políticas de RLS para mayor claridad
ALTER POLICY "Users can view all available materials" ON public.items RENAME TO "Users can view all available items";
ALTER POLICY "Users can create their own materials" ON public.items RENAME TO "Users can create their own items";
ALTER POLICY "Users can update their own materials" ON public.items RENAME TO "Users can update their own items";
ALTER POLICY "Users can delete their own materials" ON public.items RENAME TO "Users can delete their own items";
