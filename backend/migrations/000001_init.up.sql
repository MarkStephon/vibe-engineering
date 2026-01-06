-- Create pomodoros table
CREATE TABLE IF NOT EXISTS pomodoros (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255),
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration INTEGER NOT NULL DEFAULT 25,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pomodoros_user_id ON pomodoros(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoros_created_at ON pomodoros(created_at);
CREATE INDEX IF NOT EXISTS idx_pomodoros_deleted_at ON pomodoros(deleted_at);

-- Add comments
COMMENT ON TABLE pomodoros IS 'Pomodoro sessions for users';
COMMENT ON COLUMN pomodoros.duration IS 'Duration in minutes';
