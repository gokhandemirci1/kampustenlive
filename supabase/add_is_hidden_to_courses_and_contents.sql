-- Add is_hidden column to courses table
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

COMMENT ON COLUMN courses.is_hidden IS 'If true, course will be hidden from student dashboard';

-- Add is_hidden column to contents table
ALTER TABLE contents
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

COMMENT ON COLUMN contents.is_hidden IS 'If true, content will be hidden from student dashboard';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_is_hidden ON courses(is_hidden);
CREATE INDEX IF NOT EXISTS idx_contents_is_hidden ON contents(is_hidden);
