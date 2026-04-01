
-- Add tags and organization columns to problems
ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS organization text DEFAULT '';

-- Add endorsements table  
CREATE TABLE IF NOT EXISTS public.endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endorser_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('internship', 'job', 'collaboration')),
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Endorsements viewable by everyone" ON public.endorsements FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert endorsements" ON public.endorsements FOR INSERT TO public WITH CHECK (auth.uid() = endorser_id);

-- Add bio, linkedin, github to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_email text DEFAULT '';

-- Update existing problems with tags and org
UPDATE public.problems SET tags = ARRAY['environment', 'urban'], organization = 'City Planning Board' WHERE title ILIKE '%traffic%';
UPDATE public.problems SET tags = ARRAY['environment', 'sustainability'], organization = 'Green Earth NGO' WHERE title ILIKE '%waste%';
UPDATE public.problems SET tags = ARRAY['healthcare', 'infrastructure'], organization = 'WHO Regional' WHERE title ILIKE '%water%';
UPDATE public.problems SET tags = ARRAY['technology', 'urban'], organization = 'Smart City Initiative' WHERE title ILIKE '%parking%';
UPDATE public.problems SET tags = ARRAY['environment', 'data-analytics'], organization = 'Climate Action Now' WHERE title ILIKE '%climate%';
UPDATE public.problems SET tags = ARRAY['energy', 'sustainability'], organization = 'Global Energy Forum' WHERE title ILIKE '%renewable%' OR title ILIKE '%energy%';
UPDATE public.problems SET tags = ARRAY['healthcare', 'AI'], organization = 'WHO' WHERE title ILIKE '%health%';
UPDATE public.problems SET tags = ARRAY['education', 'technology'], organization = 'UNESCO' WHERE title ILIKE '%education%';
UPDATE public.problems SET tags = ARRAY['logistics', 'AI'], organization = 'Supply Chain Institute' WHERE title ILIKE '%supply%';
UPDATE public.problems SET tags = ARRAY['agriculture', 'data-analytics'], organization = 'FAO' WHERE title ILIKE '%food%' OR title ILIKE '%agriculture%';

-- Insert more problems to get to 15
INSERT INTO public.problems (title, description, category, difficulty, tags, organization) VALUES
('Urban Flood Prevention System', 'Design a smart drainage and early warning system to prevent urban flooding in coastal cities.', 'local', 'hard', ARRAY['environment', 'infrastructure', 'IoT'], 'Coastal Cities Alliance'),
('Community Mental Health Platform', 'Create a platform connecting people with mental health resources and peer support in their local area.', 'local', 'medium', ARRAY['healthcare', 'community', 'technology'], 'Mental Health Foundation'),
('Deforestation Monitoring Dashboard', 'Build a real-time dashboard using satellite data to track and alert on deforestation activities globally.', 'global', 'hard', ARRAY['environment', 'AI', 'data-analytics'], 'World Wildlife Fund'),
('Digital Literacy for Rural Areas', 'Design a program and platform to improve digital literacy in underserved rural communities.', 'global', 'easy', ARRAY['education', 'community', 'technology'], 'Digital Divide Initiative'),
('Smart Energy Grid Optimization', 'Develop an AI-powered system to optimize energy distribution in smart grids to reduce waste.', 'global', 'hard', ARRAY['energy', 'AI', 'infrastructure'], 'Global Energy Forum')
ON CONFLICT DO NOTHING;
