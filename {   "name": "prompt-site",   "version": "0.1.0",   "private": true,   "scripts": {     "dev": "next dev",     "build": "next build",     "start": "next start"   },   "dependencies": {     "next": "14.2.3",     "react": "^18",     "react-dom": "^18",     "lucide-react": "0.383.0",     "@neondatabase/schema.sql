-- PromptSite — Neon PostgreSQL Schema
-- Run this in your Neon SQL Editor:
-- https://console.neon.tech/app/org-shy-sunset-45946907/projects

CREATE TABLE IF NOT EXISTS submissions (
  id          SERIAL PRIMARY KEY,
  name        TEXT        NOT NULL,
  contact     TEXT        NOT NULL,
  business    TEXT        NOT NULL,
  audience    TEXT,
  differentiator TEXT,
  plan        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional: index for querying by plan or date
CREATE INDEX IF NOT EXISTS idx_submissions_plan       ON submissions(plan);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
