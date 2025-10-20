-- Remove the security definer view and replace with a function approach
DROP VIEW IF EXISTS public.public_profiles;

-- Create a security definer function to get limited public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.id, p.user_id, p.username, p.created_at
  FROM public.profiles p
  WHERE p.user_id = profile_user_id 
    AND p.username IS NOT NULL;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profile TO authenticated;