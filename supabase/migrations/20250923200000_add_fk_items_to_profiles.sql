ALTER TABLE public.items
ADD CONSTRAINT items_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles (user_id)
ON DELETE CASCADE;
