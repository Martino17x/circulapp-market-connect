-- Fix RLS policies to use authenticated role consistently
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all available materials" ON public.materials;
DROP POLICY IF EXISTS "Users can create their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can update their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can delete their own materials" ON public.materials;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;

-- Create corrected policies for materials table
CREATE POLICY "Users can view all available materials" 
ON public.materials 
FOR SELECT 
TO authenticated
USING ((status = 'disponible'::text) OR (auth.uid() = user_id));

CREATE POLICY "Users can create their own materials" 
ON public.materials 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials" 
ON public.materials 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials" 
ON public.materials 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create corrected policies for profiles table
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Also allow users to view basic profile info of other users (for displaying usernames in materials)
CREATE POLICY "Users can view public profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);