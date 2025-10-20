-- Habilitar el almacenamiento de múltiples imágenes por ítem

-- 1. Añadir una nueva columna de tipo array de texto para las URLs de las imágenes.
ALTER TABLE public.items
ADD COLUMN image_urls TEXT[];

-- 2. Copiar las URLs de la columna antigua a la nueva, envolviéndolas en un array.
UPDATE public.items
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL;

-- 3. Eliminar la columna antigua que solo permitía una imagen.
ALTER TABLE public.items
DROP COLUMN image_url;

-- 4. (Opcional pero recomendado) Añadir un constraint para asegurar que el array no esté vacío si se provee.
ALTER TABLE public.items
ADD CONSTRAINT check_image_urls_not_empty
CHECK (image_urls IS NULL OR array_length(image_urls, 1) > 0);
