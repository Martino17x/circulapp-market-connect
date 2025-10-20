-- Crear bucket para imágenes de items
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Crear políticas RLS para el bucket
CREATE POLICY "Usuarios pueden ver todas las imágenes de items" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'item-images');

CREATE POLICY "Usuarios autenticados pueden subir imágenes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'item-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuarios pueden actualizar sus propias imágenes" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'item-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuarios pueden eliminar sus propias imágenes" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'item-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);