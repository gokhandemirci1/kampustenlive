-- ============================================
-- KAMPUSTEN.ORG - SUPABASE SCHEMA
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');

-- Course status enum
CREATE TYPE course_status AS ENUM ('pending', 'approved', 'published');

-- Content type enum
CREATE TYPE content_type AS ENUM ('video', 'pdf', 'question');

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher details table
CREATE TABLE teacher_details (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    university TEXT,
    department TEXT,
    yks_rank INTEGER,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student details table
CREATE TABLE student_details (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    grade_level TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) DEFAULT 0,
    schedule_text TEXT,
    status course_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contents table
CREATE TABLE contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type content_type NOT NULL,
    url TEXT NOT NULL,
    is_free BOOLEAN DEFAULT FALSE,
    category TEXT,
    uploader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments table (many-to-many: students to courses)
CREATE TABLE enrollments (
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (student_id, course_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    group_id UUID, -- Can reference course_id or other group identifiers
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_contents_uploader_id ON contents(uploader_id);
CREATE INDEX idx_contents_type ON contents(type);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_messages_group_id ON messages(group_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_details_updated_at BEFORE UPDATE ON teacher_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_details_updated_at BEFORE UPDATE ON student_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON contents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value user_role;
BEGIN
    -- Get role from metadata, default to 'student'
    user_role_value := COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        CASE 
            WHEN NEW.email = 'admin@kampus.org' THEN 'admin'::user_role
            ELSE 'student'::user_role
        END
    );
    
    INSERT INTO public.profiles (id, role, full_name)
    VALUES (
        NEW.id,
        user_role_value,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is teacher
CREATE OR REPLACE FUNCTION is_teacher(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id AND role = 'teacher'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to prevent non-admin from changing is_approved
CREATE OR REPLACE FUNCTION prevent_teacher_approval_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If is_approved is being changed and user is not admin, raise error
    IF OLD.is_approved IS DISTINCT FROM NEW.is_approved THEN
        IF NOT EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Only administrators can change is_approved status';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to prevent non-admin from changing is_approved
CREATE TRIGGER prevent_teacher_approval_change_trigger
    BEFORE UPDATE ON teacher_details
    FOR EACH ROW
    EXECUTE FUNCTION prevent_teacher_approval_change();

-- Function to prevent non-admin from changing course status
CREATE OR REPLACE FUNCTION prevent_course_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is being changed and user is not admin, raise error
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        IF NOT EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Only administrators can change course status';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to prevent non-admin from changing course status
CREATE TRIGGER prevent_course_status_change_trigger
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION prevent_course_status_change();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

-- Admin can do everything
CREATE POLICY "Admin full access on profiles"
    ON profiles FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Users can read all profiles
CREATE POLICY "Users can read all profiles"
    ON profiles FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can insert their own profile (for initial setup, though trigger handles this)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS POLICIES - TEACHER_DETAILS
-- ============================================

-- Admin can do everything
CREATE POLICY "Admin full access on teacher_details"
    ON teacher_details FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Anyone can read teacher details
CREATE POLICY "Anyone can read teacher_details"
    ON teacher_details FOR SELECT
    USING (true);

-- Teachers can read their own details
CREATE POLICY "Teachers can read own details"
    ON teacher_details FOR SELECT
    USING (auth.uid() = id);

-- Teachers can insert their own details
CREATE POLICY "Teachers can insert own details"
    ON teacher_details FOR INSERT
    WITH CHECK (
        auth.uid() = id AND
        is_teacher(auth.uid())
    );

-- Teachers can update their own details
-- Note: is_approved changes are prevented by trigger (only admin can change)
CREATE POLICY "Teachers can update own details"
    ON teacher_details FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS POLICIES - STUDENT_DETAILS
-- ============================================

-- Admin can do everything
CREATE POLICY "Admin full access on student_details"
    ON student_details FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Anyone can read student details
CREATE POLICY "Anyone can read student_details"
    ON student_details FOR SELECT
    USING (true);

-- Students can manage their own details
CREATE POLICY "Students can manage own details"
    ON student_details FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS POLICIES - COURSES
-- ============================================

-- Admin can do everything
CREATE POLICY "Admin full access on courses"
    ON courses FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Anyone can read published courses
CREATE POLICY "Anyone can read published courses"
    ON courses FOR SELECT
    USING (status = 'published' OR is_admin(auth.uid()));

-- Teachers can read their own courses
CREATE POLICY "Teachers can read own courses"
    ON courses FOR SELECT
    USING (teacher_id = auth.uid());

-- Teachers can create courses
CREATE POLICY "Teachers can create courses"
    ON courses FOR INSERT
    WITH CHECK (
        teacher_id = auth.uid() AND
        is_teacher(auth.uid())
    );

-- Teachers can update their own courses
-- Note: Status changes are prevented by trigger (only admin can change)
CREATE POLICY "Teachers can update own courses"
    ON courses FOR UPDATE
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

-- Teachers can delete their own courses
CREATE POLICY "Teachers can delete own courses"
    ON courses FOR DELETE
    USING (teacher_id = auth.uid());

-- ============================================
-- RLS POLICIES - CONTENTS
-- ============================================

-- Admin can do everything
CREATE POLICY "Admin full access on contents"
    ON contents FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Anyone can read free contents
CREATE POLICY "Anyone can read free contents"
    ON contents FOR SELECT
    USING (is_free = true OR is_admin(auth.uid()));

-- Uploaders can read their own contents
CREATE POLICY "Uploaders can read own contents"
    ON contents FOR SELECT
    USING (uploader_id = auth.uid());

-- Authenticated users can create contents
CREATE POLICY "Authenticated users can create contents"
    ON contents FOR INSERT
    WITH CHECK (auth.uid() = uploader_id);

-- Uploaders can update their own contents
CREATE POLICY "Uploaders can update own contents"
    ON contents FOR UPDATE
    USING (uploader_id = auth.uid())
    WITH CHECK (uploader_id = auth.uid());

-- Uploaders can delete their own contents
CREATE POLICY "Uploaders can delete own contents"
    ON contents FOR DELETE
    USING (uploader_id = auth.uid());

-- ============================================
-- RLS POLICIES - ENROLLMENTS
-- ============================================

-- Admin can do everything
CREATE POLICY "Admin full access on enrollments"
    ON enrollments FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Students can read their own enrollments
CREATE POLICY "Students can read own enrollments"
    ON enrollments FOR SELECT
    USING (student_id = auth.uid());

-- Teachers can read enrollments for their courses
CREATE POLICY "Teachers can read course enrollments"
    ON enrollments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = enrollments.course_id
            AND courses.teacher_id = auth.uid()
        )
    );

-- Students can enroll themselves
CREATE POLICY "Students can enroll in courses"
    ON enrollments FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- Students can unenroll themselves
CREATE POLICY "Students can unenroll from courses"
    ON enrollments FOR DELETE
    USING (student_id = auth.uid());

-- ============================================
-- RLS POLICIES - MESSAGES
-- ============================================

-- Admin can do everything
CREATE POLICY "Admin full access on messages"
    ON messages FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Users can read messages in groups they belong to
CREATE POLICY "Users can read group messages"
    ON messages FOR SELECT
    USING (
        sender_id = auth.uid() OR
        group_id IN (
            SELECT course_id FROM enrollments WHERE student_id = auth.uid()
            UNION
            SELECT id FROM courses WHERE teacher_id = auth.uid()
        ) OR
        is_admin(auth.uid())
    );

-- Authenticated users can send messages
CREATE POLICY "Authenticated users can send messages"
    ON messages FOR INSERT
    WITH CHECK (sender_id = auth.uid());

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
    ON messages FOR UPDATE
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
    ON messages FOR DELETE
    USING (sender_id = auth.uid());

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE profiles IS 'User profiles extending auth.users';
COMMENT ON TABLE teacher_details IS 'Additional details for teachers';
COMMENT ON TABLE student_details IS 'Additional details for students';
COMMENT ON TABLE courses IS 'Courses created by teachers';
COMMENT ON TABLE contents IS 'Educational content (videos, PDFs, questions)';
COMMENT ON TABLE enrollments IS 'Student course enrollments';
COMMENT ON TABLE messages IS 'Messages in course groups or general chat';

