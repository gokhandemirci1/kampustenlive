-- Add YKS rank field to teacher_details table
ALTER TABLE teacher_details 
ADD COLUMN IF NOT EXISTS yks_rank INTEGER;

-- Add comment
COMMENT ON COLUMN teacher_details.yks_rank IS 'YKS sıralaması (Örn: 1234)';
