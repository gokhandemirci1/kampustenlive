-- ============================================
-- LIVE SESSIONS TABLE FOR AGORA INTEGRATION
-- ============================================

-- Live sessions table (canlı ders oturumları)
CREATE TABLE IF NOT EXISTS live_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    channel_name TEXT NOT NULL UNIQUE, -- Agora channel name (course_id + timestamp formatı)
    agora_app_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'live', 'ended'
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_live_sessions_course_id ON live_sessions(course_id);
CREATE INDEX idx_live_sessions_teacher_id ON live_sessions(teacher_id);
CREATE INDEX idx_live_sessions_channel_name ON live_sessions(channel_name);
CREATE INDEX idx_live_sessions_status ON live_sessions(status);

-- Function to update updated_at timestamp
CREATE TRIGGER update_live_sessions_updated_at 
    BEFORE UPDATE ON live_sessions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES - LIVE_SESSIONS
-- ============================================

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin full access on live_sessions"
    ON live_sessions FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Anyone can read live sessions
CREATE POLICY "Anyone can read live sessions"
    ON live_sessions FOR SELECT
    USING (true);

-- Teachers can create live sessions for their courses
CREATE POLICY "Teachers can create live sessions"
    ON live_sessions FOR INSERT
    WITH CHECK (
        teacher_id = auth.uid() AND
        is_teacher(auth.uid()) AND
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_id 
            AND courses.teacher_id = auth.uid()
        )
    );

-- Teachers can update their own live sessions
CREATE POLICY "Teachers can update own live sessions"
    ON live_sessions FOR UPDATE
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

-- Teachers can delete their own live sessions
CREATE POLICY "Teachers can delete own live sessions"
    ON live_sessions FOR DELETE
    USING (teacher_id = auth.uid());

COMMENT ON TABLE live_sessions IS 'Canlı ders oturumları (Agora entegrasyonu)';

