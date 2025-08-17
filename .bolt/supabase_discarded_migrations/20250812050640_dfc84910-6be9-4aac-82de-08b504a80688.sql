-- Add price field to materials table
ALTER TABLE public.materials 
ADD COLUMN price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN is_free BOOLEAN DEFAULT false;

-- Add comment to clarify usage
COMMENT ON COLUMN public.materials.price IS 'Price in local currency. If is_free is true, this should be 0';
COMMENT ON COLUMN public.materials.is_free IS 'True if the material is offered for free';