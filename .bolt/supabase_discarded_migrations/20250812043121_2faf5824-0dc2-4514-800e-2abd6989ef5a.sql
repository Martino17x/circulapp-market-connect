-- Fix security definer view by recreating without SECURITY DEFINER
DROP VIEW public.user_stats;

-- Create function to get user statistics safely
CREATE OR REPLACE FUNCTION public.get_user_stats(target_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  total_posts bigint,
  total_weight_kg numeric,
  active_posts bigint,
  completed_posts bigint,
  last_post_date timestamp with time zone,
  most_frequent_type text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    m.user_id,
    COUNT(*)::bigint as total_posts,
    COALESCE(SUM(m.weight_kg), 0) as total_weight_kg,
    COUNT(CASE WHEN m.status = 'disponible' THEN 1 END)::bigint as active_posts,
    COUNT(CASE WHEN m.status = 'retirado' THEN 1 END)::bigint as completed_posts,
    MAX(m.created_at) as last_post_date,
    (SELECT m2.material_type FROM public.materials m2 WHERE m2.user_id = target_user_id GROUP BY m2.material_type ORDER BY COUNT(*) DESC LIMIT 1) as most_frequent_type
  FROM public.materials m
  WHERE m.user_id = target_user_id
  GROUP BY m.user_id;
$$;