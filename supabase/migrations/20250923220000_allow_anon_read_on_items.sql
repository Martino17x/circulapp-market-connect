CREATE POLICY "Allow public read access to available items" 
ON public.items FOR SELECT
TO anon
USING (status = 'disponible');