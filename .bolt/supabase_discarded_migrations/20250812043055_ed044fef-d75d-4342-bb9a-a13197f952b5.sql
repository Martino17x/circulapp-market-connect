-- Create materials table for marketplace
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  material_type TEXT NOT NULL CHECK (material_type IN ('plastico', 'carton', 'vidrio', 'metal', 'papel', 'organico', 'textil', 'electronico', 'otro')),
  weight_kg DECIMAL(10,2) NOT NULL CHECK (weight_kg > 0),
  location_name TEXT NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'reservado', 'retirado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Create policies for materials table
CREATE POLICY "Users can view all available materials" 
ON public.materials 
FOR SELECT 
USING (status = 'disponible' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own materials" 
ON public.materials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials" 
ON public.materials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials" 
ON public.materials 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_materials_user_id ON public.materials(user_id);
CREATE INDEX idx_materials_status ON public.materials(status);
CREATE INDEX idx_materials_material_type ON public.materials(material_type);
CREATE INDEX idx_materials_created_at ON public.materials(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON public.materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create user statistics view
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  user_id,
  COUNT(*) as total_posts,
  SUM(weight_kg) as total_weight_kg,
  COUNT(CASE WHEN status = 'disponible' THEN 1 END) as active_posts,
  COUNT(CASE WHEN status = 'retirado' THEN 1 END) as completed_posts,
  MAX(created_at) as last_post_date,
  (SELECT material_type FROM public.materials m2 WHERE m2.user_id = materials.user_id GROUP BY material_type ORDER BY COUNT(*) DESC LIMIT 1) as most_frequent_type
FROM public.materials
GROUP BY user_id;