-- Drop indexes
DROP INDEX IF EXISTS idx_pomodoros_deleted_at;
DROP INDEX IF EXISTS idx_pomodoros_created_at;
DROP INDEX IF EXISTS idx_pomodoros_user_id;

-- Drop table
DROP TABLE IF EXISTS pomodoros;
