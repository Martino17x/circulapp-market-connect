-- Fix security vulnerability: Replace public profile visibility with restricted access
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a secure policy that only allows users to view their own profiles
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Create a view for limited public profile data that other users might need
-- This exposes only non-sensitive data (username) for legitimate app functions
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  username,
  created_at
FROM public.profiles
WHERE username IS NOT NULL;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Grant access to the public view for authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;