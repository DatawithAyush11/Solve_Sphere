
-- Allow solution owners to delete their own solutions
CREATE POLICY "Users can delete own solutions" ON public.solutions
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Allow solution owners to update their own solutions
CREATE POLICY "Users can update own solutions" ON public.solutions
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Add unique constraint for one rating per user per solution
ALTER TABLE public.ratings ADD CONSTRAINT ratings_solution_user_unique UNIQUE (solution_id, user_id);
