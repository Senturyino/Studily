-- Studily Database Schema for Prepare Results System
-- Multi-Subject Results Management

-- ========================================
-- ADMINISTRATION TABLES
-- ========================================

-- Main Admins table
CREATE TABLE main_admins (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(10) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schools table
CREATE TABLE schools (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    location VARCHAR(200),
    contact_number VARCHAR(50),
    status VARCHAR(10) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- School Admins table
CREATE TABLE school_admins (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    school_id INTEGER NOT NULL,
    status VARCHAR(10) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- CORE TABLES
-- ========================================

-- Students table
CREATE TABLE students (
    Student_ID VARCHAR(50) PRIMARY KEY,
    St_Full_N VARCHAR(100) NOT NULL,
    St_Email VARCHAR(100) UNIQUE NOT NULL,
    St_Password VARCHAR(255) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    Acc_year VARCHAR(20) NOT NULL,
    status VARCHAR(10) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE classes (
    class_id VARCHAR(50) PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    class_level VARCHAR(20),
    capacity INTEGER DEFAULT 30,
    status VARCHAR(10) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Academic Years table
CREATE TABLE academic_years (
    Acc_year VARCHAR(20) PRIMARY KEY,
    year_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(10) DEFAULT 'inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
    subject_id VARCHAR(50) PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    subject_category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Marks table - overall results (multi-subject)
CREATE TABLE student_marks (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    total_score DECIMAL(5,2) DEFAULT 0.00,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    grade CHAR(1) DEFAULT 'F',
    position_in_class INTEGER DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Subject Marks table - individual subject results
CREATE TABLE student_subject_marks (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    classwork_marks DECIMAL(5,2) DEFAULT 0.00,
    midterm_marks DECIMAL(5,2) DEFAULT 0.00,
    endterm_marks DECIMAL(5,2) DEFAULT 0.00,
    total_score DECIMAL(5,2) DEFAULT 0.00,
    grade CHAR(1) DEFAULT 'F',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grading Configuration table
CREATE TABLE grading_config (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    config_name VARCHAR(100) NOT NULL,
    classwork_weight DECIMAL(5,2) DEFAULT 30.00,
    midterm_weight DECIMAL(5,2) DEFAULT 20.00,
    endterm_weight DECIMAL(5,2) DEFAULT 50.00,
    grade_a_min INTEGER DEFAULT 90,
    grade_a_max INTEGER DEFAULT 100,
    grade_b_min INTEGER DEFAULT 80,
    grade_b_max INTEGER DEFAULT 89,
    grade_c_min INTEGER DEFAULT 70,
    grade_c_max INTEGER DEFAULT 79,
    grade_d_min INTEGER DEFAULT 60,
    grade_d_max INTEGER DEFAULT 69,
    grade_f_min INTEGER DEFAULT 0,
    grade_f_max INTEGER DEFAULT 59,
    is_default BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- School Templates table
CREATE TABLE school_templates (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    template_name VARCHAR(100) NOT NULL,
    template_file VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    template_type VARCHAR(20) DEFAULT 'results',
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_by VARCHAR(50),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP,
    usage_count INTEGER DEFAULT 0
);

-- Generated Results table
CREATE TABLE generated_results (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    pdf_filename VARCHAR(255) NOT NULL,
    pdf_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    generation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    template_used INTEGER,
    generation_status VARCHAR(10) DEFAULT 'pending',
    error_message TEXT
);

-- Results Processing Log table
CREATE TABLE results_processing_log (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    operation_type VARCHAR(20) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    total_students INTEGER DEFAULT 0,
    processed_students INTEGER DEFAULT 0,
    failed_students INTEGER DEFAULT 0,
    processing_time_seconds INTEGER DEFAULT 0,
    initiated_by VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    error_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Student Performance History table
CREATE TABLE student_performance_history (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    subject_id VARCHAR(50),
    classwork_marks DECIMAL(5,2),
    midterm_marks DECIMAL(5,2),
    endterm_marks DECIMAL(5,2),
    total_score DECIMAL(5,2),
    percentage DECIMAL(5,2),
    grade CHAR(1),
    rank_in_class INTEGER,
    class_average DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INDEXES
-- ========================================

-- Student marks indexes
CREATE INDEX idx_student_marks_student ON student_marks(student_id);
CREATE INDEX idx_student_marks_class ON student_marks(class_id);
CREATE INDEX idx_student_marks_semester ON student_marks(semester);
CREATE INDEX idx_student_marks_academic_year ON student_marks(academic_year);
CREATE INDEX idx_student_marks_grade ON student_marks(grade);
CREATE INDEX idx_student_marks_position ON student_marks(position_in_class);

-- Subject marks indexes
CREATE INDEX idx_subject_marks_student ON student_subject_marks(student_id);
CREATE INDEX idx_subject_marks_subject ON student_subject_marks(subject_id);
CREATE INDEX idx_subject_marks_class ON student_subject_marks(class_id);
CREATE INDEX idx_subject_marks_semester ON student_subject_marks(semester);
CREATE INDEX idx_subject_marks_academic_year ON student_subject_marks(academic_year);
CREATE INDEX idx_subject_marks_grade ON student_subject_marks(grade);

-- Subjects indexes
CREATE INDEX idx_subjects_name ON subjects(subject_name);
CREATE INDEX idx_subjects_code ON subjects(subject_code);
CREATE INDEX idx_subjects_category ON subjects(subject_category);
CREATE INDEX idx_subjects_active ON subjects(is_active);

-- Generated results indexes
CREATE INDEX idx_generated_results_student ON generated_results(student_id);
CREATE INDEX idx_generated_results_class ON generated_results(class_id);
CREATE INDEX idx_generated_results_semester ON generated_results(semester);
CREATE INDEX idx_generated_results_status ON generated_results(generation_status);

-- Processing log indexes
CREATE INDEX idx_processing_log_class ON results_processing_log(class_id);
CREATE INDEX idx_processing_log_status ON results_processing_log(status);
CREATE INDEX idx_processing_log_created ON results_processing_log(created_at);

-- Performance history indexes
CREATE INDEX idx_performance_history_student ON student_performance_history(student_id);
CREATE INDEX idx_performance_history_class ON student_performance_history(class_id);
CREATE INDEX idx_performance_history_semester ON student_performance_history(semester);

-- ========================================
-- UNIQUE CONSTRAINTS
-- ========================================

-- Student marks unique constraints
ALTER TABLE student_marks ADD CONSTRAINT unique_student_semester 
UNIQUE (student_id, class_id, semester, academic_year);

-- Subject marks unique constraints
ALTER TABLE student_subject_marks ADD CONSTRAINT unique_subject_result 
UNIQUE (student_id, class_id, semester, academic_year, subject_id);

-- ========================================
-- FOREIGN KEY CONSTRAINTS
-- ========================================

-- School admins foreign keys
ALTER TABLE school_admins ADD CONSTRAINT fk_school_admins_school 
FOREIGN KEY (school_id) REFERENCES schools(id);

-- Student marks foreign keys
ALTER TABLE student_marks ADD CONSTRAINT fk_student_marks_student 
FOREIGN KEY (student_id) REFERENCES students(Student_ID);

ALTER TABLE student_marks ADD CONSTRAINT fk_student_marks_class 
FOREIGN KEY (class_id) REFERENCES classes(class_id);

ALTER TABLE student_marks ADD CONSTRAINT fk_student_marks_academic_year 
FOREIGN KEY (academic_year) REFERENCES academic_years(Acc_year);

-- Subject marks foreign keys
ALTER TABLE student_subject_marks ADD CONSTRAINT fk_subject_marks_student 
FOREIGN KEY (student_id) REFERENCES students(Student_ID);

ALTER TABLE student_subject_marks ADD CONSTRAINT fk_subject_marks_class 
FOREIGN KEY (class_id) REFERENCES classes(class_id);

ALTER TABLE student_subject_marks ADD CONSTRAINT fk_subject_marks_academic_year 
FOREIGN KEY (academic_year) REFERENCES academic_years(Acc_year);

ALTER TABLE student_subject_marks ADD CONSTRAINT fk_subject_marks_subject 
FOREIGN KEY (subject_id) REFERENCES subjects(subject_id);

-- Generated results foreign keys
ALTER TABLE generated_results ADD CONSTRAINT fk_generated_results_student 
FOREIGN KEY (student_id) REFERENCES students(Student_ID);

ALTER TABLE generated_results ADD CONSTRAINT fk_generated_results_class 
FOREIGN KEY (class_id) REFERENCES classes(class_id);

ALTER TABLE generated_results ADD CONSTRAINT fk_generated_results_academic_year 
FOREIGN KEY (academic_year) REFERENCES academic_years(Acc_year);

ALTER TABLE generated_results ADD CONSTRAINT fk_generated_results_template 
FOREIGN KEY (template_used) REFERENCES school_templates(id);

-- Processing log foreign keys
ALTER TABLE results_processing_log ADD CONSTRAINT fk_processing_log_class 
FOREIGN KEY (class_id) REFERENCES classes(class_id);

ALTER TABLE results_processing_log ADD CONSTRAINT fk_processing_log_academic_year 
FOREIGN KEY (academic_year) REFERENCES academic_years(Acc_year);

-- Performance history foreign keys
ALTER TABLE student_performance_history ADD CONSTRAINT fk_performance_history_student 
FOREIGN KEY (student_id) REFERENCES students(Student_ID);

ALTER TABLE student_performance_history ADD CONSTRAINT fk_performance_history_class 
FOREIGN KEY (class_id) REFERENCES classes(class_id);

ALTER TABLE student_performance_history ADD CONSTRAINT fk_performance_history_academic_year 
FOREIGN KEY (academic_year) REFERENCES academic_years(Acc_year);

ALTER TABLE student_performance_history ADD CONSTRAINT fk_performance_history_subject 
FOREIGN KEY (subject_id) REFERENCES subjects(subject_id);

-- ========================================
-- DEFAULT DATA
-- ========================================

-- Insert default grading configuration
INSERT INTO grading_config (config_name, is_default, created_by) VALUES 
('Default Grading System', TRUE, 'admin');

-- Insert sample academic years
INSERT INTO academic_years (Acc_year, year_name, start_date, end_date, status) VALUES 
('2023-2024', '2023-2024 Academic Year', '2023-09-01', '2024-06-30', 'inactive'),
('2024-2025', '2024-2025 Academic Year', '2024-09-01', '2025-06-30', 'active'),
('2025-2026', '2025-2026 Academic Year', '2025-09-01', '2026-06-30', 'upcoming');

-- Insert sample classes
INSERT INTO classes (class_id, class_name, class_level, capacity) VALUES 
('CLASS001', 'Grade 10A', '10', 30),
('CLASS002', 'Grade 10B', '10', 30),
('CLASS003', 'Grade 11A', '11', 30),
('CLASS004', 'Grade 11B', '11', 30);

-- Insert sample subjects
INSERT INTO subjects (subject_id, subject_name, subject_code, subject_category) VALUES 
('MATH001', 'Mathematics', 'MATH', 'Core'),
('ENG001', 'English', 'ENG', 'Core'),
('SCI001', 'Science', 'SCI', 'Core'),
('HIST001', 'History', 'HIST', 'Social Studies'),
('GEO001', 'Geography', 'GEO', 'Social Studies'),
('COMP001', 'Computer Science', 'COMP', 'Technology');

-- ========================================
-- ADDITIONAL TABLES FOR STUDENT RECORDS
-- ========================================

-- Attendance table
CREATE TABLE student_attendance (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    reason TEXT,
    recorded_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classwork assignments table
CREATE TABLE classwork_assignments (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    assignment_id VARCHAR(50) UNIQUE NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE,
    total_marks DECIMAL(5,2) DEFAULT 100.00,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student classwork submissions table
CREATE TABLE student_classwork (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id VARCHAR(50) NOT NULL,
    assignment_id VARCHAR(50) NOT NULL,
    marks_obtained DECIMAL(5,2) DEFAULT 0.00,
    submission_date TIMESTAMP,
    feedback TEXT,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late', 'missing')),
    graded_by VARCHAR(50),
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- School fees structure table
CREATE TABLE fees_structure (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    fee_id VARCHAR(50) UNIQUE NOT NULL,
    fee_name VARCHAR(100) NOT NULL,
    fee_type VARCHAR(50) NOT NULL CHECK (fee_type IN ('tuition', 'library', 'laboratory', 'sports', 'transport', 'other')),
    amount DECIMAL(10,2) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    class_id VARCHAR(50),
    is_mandatory BOOLEAN DEFAULT TRUE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student school fees table
CREATE TABLE student_fees (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id VARCHAR(50) NOT NULL,
    fee_id VARCHAR(50) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    payment_date DATE,
    payment_method VARCHAR(50),
    receipt_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'overdue')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ADDITIONAL INDEXES
-- ========================================

-- Attendance indexes
CREATE INDEX idx_attendance_student ON student_attendance(student_id);
CREATE INDEX idx_attendance_class ON student_attendance(class_id);
CREATE INDEX idx_attendance_date ON student_attendance(date);
CREATE INDEX idx_attendance_status ON student_attendance(status);

-- Classwork indexes
CREATE INDEX idx_classwork_assignments_class ON classwork_assignments(class_id);
CREATE INDEX idx_classwork_assignments_subject ON classwork_assignments(subject_id);
CREATE INDEX idx_student_classwork_student ON student_classwork(student_id);
CREATE INDEX idx_student_classwork_assignment ON student_classwork(assignment_id);
CREATE INDEX idx_student_classwork_status ON student_classwork(status);

-- School fees indexes
CREATE INDEX idx_fees_structure_type ON fees_structure(fee_type);
CREATE INDEX idx_fees_structure_academic_year ON fees_structure(academic_year);
CREATE INDEX idx_fees_structure_class ON fees_structure(class_id);
CREATE INDEX idx_student_fees_student ON student_fees(student_id);
CREATE INDEX idx_student_fees_fee ON student_fees(fee_id);
CREATE INDEX idx_student_fees_status ON student_fees(status);

-- ========================================
-- ADDITIONAL FOREIGN KEY CONSTRAINTS
-- ========================================

-- Attendance foreign keys
ALTER TABLE student_attendance ADD CONSTRAINT fk_attendance_student 
FOREIGN KEY (student_id) REFERENCES students(Student_ID);

ALTER TABLE student_attendance ADD CONSTRAINT fk_attendance_class 
FOREIGN KEY (class_id) REFERENCES classes(class_id);

-- Classwork foreign keys
ALTER TABLE classwork_assignments ADD CONSTRAINT fk_classwork_assignments_class 
FOREIGN KEY (class_id) REFERENCES classes(class_id);

ALTER TABLE classwork_assignments ADD CONSTRAINT fk_classwork_assignments_subject 
FOREIGN KEY (subject_id) REFERENCES subjects(subject_id);

ALTER TABLE student_classwork ADD CONSTRAINT fk_student_classwork_student 
FOREIGN KEY (student_id) REFERENCES students(Student_ID);

ALTER TABLE student_classwork ADD CONSTRAINT fk_student_classwork_assignment 
FOREIGN KEY (assignment_id) REFERENCES classwork_assignments(assignment_id);

-- School fees foreign keys
ALTER TABLE fees_structure ADD CONSTRAINT fk_fees_structure_academic_year 
FOREIGN KEY (academic_year) REFERENCES academic_years(Acc_year);

ALTER TABLE fees_structure ADD CONSTRAINT fk_fees_structure_class 
FOREIGN KEY (class_id) REFERENCES classes(class_id);

ALTER TABLE student_fees ADD CONSTRAINT fk_student_fees_student 
FOREIGN KEY (student_id) REFERENCES students(Student_ID);

ALTER TABLE student_fees ADD CONSTRAINT fk_student_fees_fee 
FOREIGN KEY (fee_id) REFERENCES fees_structure(fee_id);

-- ========================================
-- ADDITIONAL UNIQUE CONSTRAINTS
-- ========================================

-- Attendance unique constraint (one record per student per day)
ALTER TABLE student_attendance ADD CONSTRAINT unique_student_date 
UNIQUE (student_id, date);

-- Student classwork unique constraint
ALTER TABLE student_classwork ADD CONSTRAINT unique_student_assignment 
UNIQUE (student_id, assignment_id);

-- Student school fees unique constraint
ALTER TABLE student_fees ADD CONSTRAINT unique_student_fee 
UNIQUE (student_id, fee_id);

-- ========================================
-- SAMPLE DATA FOR NEW TABLES
-- ========================================

-- Insert sample school fees structure
INSERT INTO fees_structure (fee_id, fee_name, fee_type, amount, academic_year, class_id) VALUES 
('FEE001', 'Tuition Fee', 'tuition', 5000.00, '2024-2025', 'CLASS001'),
('FEE002', 'Library Fee', 'library', 200.00, '2024-2025', 'CLASS001'),
('FEE003', 'Laboratory Fee', 'laboratory', 300.00, '2024-2025', 'CLASS001'),
('FEE004', 'Sports Fee', 'sports', 150.00, '2024-2025', 'CLASS001'),
('FEE005', 'Transport Fee', 'transport', 800.00, '2024-2025', 'CLASS001');

-- Insert sample classwork assignments
INSERT INTO classwork_assignments (assignment_id, class_id, subject_id, title, description, due_date, total_marks) VALUES 
('ASSIGN001', 'CLASS001', 'MATH001', 'Algebra Quiz', 'Complete the algebra problems in Chapter 3', '2024-10-15', 50.00),
('ASSIGN002', 'CLASS001', 'ENG001', 'Essay Writing', 'Write a 500-word essay on Shakespeare', '2024-10-20', 100.00),
('ASSIGN003', 'CLASS001', 'SCI001', 'Lab Report', 'Submit lab report for Chemistry experiment', '2024-10-25', 75.00);

-- ========================================
-- VIEWS
-- ========================================

-- Student results summary view
CREATE VIEW student_results_summary AS
SELECT 
    sm.student_id,
    s.St_Full_N as student_name,
    sm.class_id,
    c.class_name,
    sm.semester,
    sm.academic_year,
    sm.total_score,
    sm.percentage,
    sm.grade,
    sm.position_in_class,
    sm.created_at,
    sm.updated_at
FROM student_marks sm
JOIN students s ON sm.student_id = s.Student_ID
JOIN classes c ON sm.class_id = c.class_id
ORDER BY sm.class_id, sm.semester, sm.percentage DESC;

-- Class performance statistics view
CREATE VIEW class_performance_stats AS
SELECT 
    class_id,
    semester,
    academic_year,
    COUNT(*) as total_students,
    AVG(percentage) as average_percentage,
    MAX(percentage) as highest_percentage,
    MIN(percentage) as lowest_percentage,
    COUNT(CASE WHEN grade = 'A' THEN 1 END) as grade_a_count,
    COUNT(CASE WHEN grade = 'B' THEN 1 END) as grade_b_count,
    COUNT(CASE WHEN grade = 'C' THEN 1 END) as grade_c_count,
    COUNT(CASE WHEN grade = 'D' THEN 1 END) as grade_d_count,
    COUNT(CASE WHEN grade = 'F' THEN 1 END) as grade_f_count
FROM student_marks
GROUP BY class_id, semester, academic_year;

-- Recent processing operations view
CREATE VIEW recent_processing_operations AS
SELECT 
    rpl.*,
    c.class_name,
    rpl.processed_students || '/' || rpl.total_students as completion_rate
FROM results_processing_log rpl
JOIN classes c ON rpl.class_id = c.class_id
ORDER BY rpl.created_at DESC;

-- ========================================
-- COMMENTS
-- ========================================

/*
This schema supports multi-subject results management with:

1. Overall student results in student_marks table
2. Individual subject results in student_subject_marks table
3. Configurable grading system in grading_config table
4. PDF template management in school_templates table
5. Generated results tracking in generated_results table
6. Processing history in results_processing_log table
7. Performance history in student_performance_history table

Key features:
- Total scores calculated across all subjects
- Average percentages for overall performance
- Position ranking based on total scores
- Flexible grading system configuration
- Comprehensive audit trail
- Performance optimization with indexes
*/ 

-- ========================================
-- INDEXES FOR ADMIN TABLES
-- ========================================

-- Main admins indexes
CREATE INDEX idx_main_admins_email ON main_admins(email);
CREATE INDEX idx_main_admins_status ON main_admins(status);

-- Schools indexes
CREATE INDEX idx_schools_name ON schools(name);
CREATE INDEX idx_schools_category ON schools(category);
CREATE INDEX idx_schools_status ON schools(status);

-- School admins indexes
CREATE INDEX idx_school_admins_email ON school_admins(email);
CREATE INDEX idx_school_admins_school ON school_admins(school_id);
CREATE INDEX idx_school_admins_status ON school_admins(status);

-- ========================================
-- INITIAL DATA
-- ========================================

-- Insert initial main admin account
INSERT INTO main_admins (email, password, name, status) 
VALUES ('wmillema1@gmail.com', '$2b$10$YourHashedPasswordHere', 'Main Administrator', 'active');

-- Note: The password should be hashed using bcrypt with salt rounds 10
-- For the password "Tessa1234", the actual hash would be generated by the application
-- This is a placeholder - the actual hash should be generated when creating the account 