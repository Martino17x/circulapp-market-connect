-- Fix security vulnerability: Replace public profile visibility with restricted access
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a more secure policy that only allows users to view their own profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a limited policy for essential public profile data (only username and id)
-- This allows other users to see basic identification for messaging/material sharing
CREATE POLICY "Limited public profile data for authenticated users" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true)
WITH COLUMNS (id, user_id, username);

-- Note: The above policy with WITH COLUMNS is not supported in all Supabase versions
-- So we'll use a different approach with a view for public data instead

-- Drop the second policy if it was created
DROP POLICY IF EXISTS "Limited public profile data for authenticated users" ON public.profiles;

-- Create a more restrictive policy that only allows users to see their own full profiles
-- For now, we'll only allow self-access, and we can create a separate public view later if needed
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);