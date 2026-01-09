-- Add total_hours column to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS total_hours INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN courses.total_hours IS 'Total number of hours for the course';
