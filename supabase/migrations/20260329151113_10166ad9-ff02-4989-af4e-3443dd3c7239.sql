
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Problems table
CREATE TABLE public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('local', 'global')),
  difficulty TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Problems viewable by everyone" ON public.problems FOR SELECT USING (true);

-- Solutions table
CREATE TABLE public.solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  ai_score INTEGER,
  ai_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solutions viewable by everyone" ON public.solutions FOR SELECT USING (true);
CREATE POLICY "Users can insert own solutions" ON public.solutions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (solution_id, user_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ratings viewable by everyone" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert own ratings" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.ratings FOR UPDATE USING (auth.uid() = user_id);

-- Seed problems
INSERT INTO public.problems (title, description, category, difficulty) VALUES
('Urban Traffic Congestion', 'Design a solution to reduce traffic congestion in growing cities using technology, policy changes, or infrastructure improvements.', 'local', 'medium'),
('Food Waste Reduction', 'Create a system to minimize food waste in local restaurants and grocery stores, potentially connecting surplus food with those in need.', 'local', 'easy'),
('Community Safety App', 'Design a neighborhood safety platform that helps residents report issues, share alerts, and coordinate with local authorities.', 'local', 'medium'),
('Local Water Conservation', 'Develop strategies and tools for households and businesses to reduce water consumption and improve water recycling.', 'local', 'hard'),
('Climate Change Mitigation', 'Propose a scalable solution for reducing carbon emissions globally, considering economic, social, and technological factors.', 'global', 'hard'),
('Ocean Plastic Pollution', 'Design a system to significantly reduce plastic pollution in oceans, addressing collection, prevention, and alternative materials.', 'global', 'hard'),
('Digital Literacy for All', 'Create a platform or program to improve digital literacy in underserved communities worldwide.', 'global', 'medium'),
('Pandemic Preparedness', 'Design a global early-warning and response system for future pandemics, incorporating lessons from COVID-19.', 'global', 'hard'),
('Affordable Housing Crisis', 'Propose innovative solutions for the global affordable housing shortage using technology, policy, or new construction methods.', 'global', 'medium'),
('Mental Health Access', 'Create a solution to improve access to mental health resources in communities with limited healthcare infrastructure.', 'local', 'medium');
