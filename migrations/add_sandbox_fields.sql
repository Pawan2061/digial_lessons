

ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS sandbox_id TEXT,
ADD COLUMN IF NOT EXISTS sandbox_url TEXT,
ADD COLUMN IF NOT EXISTS executed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_lessons_sandbox_id ON lessons(sandbox_id);
COMMENT ON COLUMN lessons.sandbox_id IS 'E2B Sandbox ID where the lesson is executed';
COMMENT ON COLUMN lessons.sandbox_url IS 'Public URL to access the executed lesson in the sandbox';
COMMENT ON COLUMN lessons.executed_at IS 'Timestamp when the lesson was executed in the sandbox';

