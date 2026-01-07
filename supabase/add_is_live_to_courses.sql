-- ============================================
-- Add is_live column to courses table
-- ============================================

-- Add is_live column to track if course is currently live
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN courses.is_live IS 'Indicates if the course is currently live/started by the teacher';


