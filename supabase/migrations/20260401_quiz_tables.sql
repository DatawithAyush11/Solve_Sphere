-- Quiz Module Database Migration
-- Run this in your Supabase Dashboard → SQL Editor

-- ─── Quiz Attempts Table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  accuracy NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN total > 0 THEN (score::NUMERIC / total::NUMERIC) * 100 ELSE 0 END
  ) STORED,
  xp_earned INTEGER GENERATED ALWAYS AS (score * 10) STORED,
  time_taken INTEGER, -- seconds
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS quiz_attempts_user_id_idx ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_domain_idx ON quiz_attempts(domain);
CREATE INDEX IF NOT EXISTS quiz_attempts_created_at_idx ON quiz_attempts(created_at DESC);

-- RLS Policies
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz attempts"
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── Coding Submissions Table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coding_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id TEXT NOT NULL, -- matches CodingProblem.id in frontend data
  language TEXT NOT NULL CHECK (language IN ('javascript', 'python', 'java')),
  code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'attempted' CHECK (status IN ('attempted', 'failed', 'passed')),
  test_cases_passed INTEGER DEFAULT 0,
  test_cases_total INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS coding_submissions_user_id_idx ON coding_submissions(user_id);
CREATE INDEX IF NOT EXISTS coding_submissions_problem_id_idx ON coding_submissions(problem_id);
CREATE INDEX IF NOT EXISTS coding_submissions_status_idx ON coding_submissions(status);

-- RLS Policies
ALTER TABLE coding_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coding submissions"
  ON coding_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coding submissions"
  ON coding_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── Optional: Quiz Leaderboard View ──────────────────────────────────────
CREATE OR REPLACE VIEW quiz_leaderboard AS
SELECT
  qa.user_id,
  p.username,
  COUNT(qa.id) AS total_attempts,
  SUM(qa.xp_earned) AS total_quiz_xp,
  ROUND(AVG(qa.accuracy), 1) AS avg_accuracy,
  MAX(qa.score) AS best_score,
  MAX(qa.created_at) AS last_attempt_at
FROM quiz_attempts qa
LEFT JOIN profiles p ON p.id = qa.user_id
GROUP BY qa.user_id, p.username
ORDER BY total_quiz_xp DESC;

-- ─── Grant permissions on view ─────────────────────────────────────────────
GRANT SELECT ON quiz_leaderboard TO authenticated;

-- ─── Summary ──────────────────────────────────────────────────────────────
-- Tables created:
--   quiz_attempts   - tracks MCQ quiz sessions (score, domain, time, XP)
--   coding_submissions - tracks code editor submissions
-- Views created:
--   quiz_leaderboard - aggregated quiz stats per user
