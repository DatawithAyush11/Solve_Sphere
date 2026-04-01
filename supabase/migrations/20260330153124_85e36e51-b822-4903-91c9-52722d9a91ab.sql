
-- Fix: Ratings INSERT should require authenticated (drop public, add authenticated)
DROP POLICY IF EXISTS "Users can insert own ratings" ON public.ratings;
CREATE POLICY "Users can insert own ratings" ON public.ratings
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix: Ratings UPDATE should require authenticated
DROP POLICY IF EXISTS "Users can update own ratings" ON public.ratings;
CREATE POLICY "Users can update own ratings" ON public.ratings
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Fix: Endorsements INSERT should require authenticated
DROP POLICY IF EXISTS "Users can insert endorsements" ON public.endorsements;
CREATE POLICY "Users can insert endorsements" ON public.endorsements
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = endorser_id);

-- Add: Endorsement owners can delete their own
CREATE POLICY "Users can delete own endorsements" ON public.endorsements
FOR DELETE TO authenticated
USING (auth.uid() = endorser_id);

-- Add: Endorsement owners can update their own
CREATE POLICY "Users can update own endorsements" ON public.endorsements
FOR UPDATE TO authenticated
USING (auth.uid() = endorser_id);

-- Fix: Solutions INSERT should require authenticated
DROP POLICY IF EXISTS "Users can insert own solutions" ON public.solutions;
CREATE POLICY "Users can insert own solutions" ON public.solutions
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
