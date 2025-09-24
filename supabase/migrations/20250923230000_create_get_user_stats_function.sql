-- Drop the existing function first to avoid conflicts
DROP FUNCTION IF EXISTS public.get_user_stats(uuid);

-- Create the function with the new definition
CREATE OR REPLACE FUNCTION public.get_user_stats(target_user_id uuid)
 RETURNS TABLE(
  total_posts bigint,
  total_weight_kg numeric,
  active_posts bigint,
  completed_posts bigint,
  most_frequent_type text
 )
 LANGUAGE plpgsql
AS $function$
BEGIN
 RETURN QUERY
 SELECT
  COUNT(i.id) AS total_posts,
  COALESCE(SUM(i.weight_kg), 0) AS total_weight_kg,
  COUNT(CASE WHEN i.status = 'disponible' THEN 1 ELSE NULL END) AS active_posts,
  COUNT(CASE WHEN i.status = 'retirado' THEN 1 ELSE NULL END) AS completed_posts,
  (SELECT material_type FROM public.items WHERE user_id = target_user_id GROUP BY material_type ORDER BY COUNT(id) DESC LIMIT 1) AS most_frequent_type
 FROM
  public.items i
 WHERE
  i.user_id = target_user_id;
END;
$function$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_user_stats(uuid) TO authenticated;
