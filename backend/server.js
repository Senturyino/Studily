const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const archiver = require("archiver");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "studily",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Keep original filename (should be student ID)
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Only allow PDF files
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed!"), false);
        }
    }
});

// Database helper function
async function getConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        return connection;
    } catch (error) {
        console.error("Database connection error:", error);
        throw error;
    }
}

// ========================================
// API ENDPOINTS
// ========================================

// 1. Upload PDF results for a class
app.post("/api/results/upload", upload.array("pdfs"), async (req, res) => {
    try {
        const { class_id, semester } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No PDF files uploaded" });
        }

        if (!class_id || !semester) {
            return res.status(400).json({ error: "Class ID and semester are required" });
        }

        const connection = await getConnection();
        
        // Process each uploaded file
        const results = [];
        for (const file of files) {
            const student_id = path.parse(file.originalname).name; // Remove .pdf extension
            
            // Check if student exists (you might want to validate this)
            const [students] = await connection.execute(
                "SELECT Student_ID FROM students WHERE Student_ID = ?",
                [student_id]
            );

            if (students.length === 0) {
                console.warn(`Student ${student_id} not found in database`);
                continue;
            }

            // Check if result already exists for this student/semester
            const [existingResults] = await connection.execute(
                "SELECT id FROM results WHERE student_id = ? AND class_id = ? AND semester = ?",
                [student_id, class_id, semester]
            );

            if (existingResults.length > 0) {
                // Update existing record
                await connection.execute(
                    "UPDATE results SET pdf_path = ?, upload_date = NOW() WHERE student_id = ? AND class_id = ? AND semester = ?",
                    [file.filename, student_id, class_id, semester]
                );
            } else {
                // Insert new record
                await connection.execute(
                    "INSERT INTO results (student_id, class_id, semester, pdf_path) VALUES (?, ?, ?, ?)",
                    [student_id, class_id, semester, file.filename]
                );
            }

            results.push({
                student_id,
                filename: file.filename,
                status: "success"
            });
        }

        await connection.end();

        res.json({
            message: `Successfully processed ${results.length} PDF files`,
            results: results
        });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Failed to upload results" });
    }
});

// 2. Get all results for a specific student
app.get("/api/results/student/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const connection = await getConnection();
        
        const [results] = await connection.execute(`
            SELECT r.*, c.class_name 
            FROM results r 
            LEFT JOIN classes c ON r.class_id = c.class_id 
            WHERE r.student_id = ? 
            ORDER BY r.upload_date DESC
        `, [studentId]);

        await connection.end();

        res.json({
            student_id: studentId,
            results: results
        });

    } catch (error) {
        console.error("Error fetching student results:", error);
        res.status(500).json({ error: "Failed to fetch student results" });
    }
});

// 3. Serve PDF file
app.get("/api/results/file/:filename", (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadsDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "File not found" });
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error("Error serving file:", error);
        res.status(500).json({ error: "Failed to serve file" });
    }
});

// 4. Get all classes (for admin upload form)
app.get("/api/classes", async (req, res) => {
    try {
        const connection = await getConnection();
        
        const [classes] = await connection.execute("SELECT * FROM classes ORDER BY class_name");
        
        await connection.end();
        
        res.json(classes);
    } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json({ error: "Failed to fetch classes" });
    }
});

// 5. Get all students for a class (for validation)
app.get("/api/students/class/:classId", async (req, res) => {
    try {
        const { classId } = req.params;
        
        const connection = await getConnection();
        
        const [students] = await connection.execute(`
            SELECT Student_ID, St_Full_N 
            FROM students 
            WHERE class_id = ? AND status = 'active'
            ORDER BY St_Full_N
        `, [classId]);
        
        await connection.end();
        
        res.json(students);
    } catch (error) {
        console.error("Error fetching class students:", error);
        res.status(500).json({ error: "Failed to fetch class students" });
    }
});

// 6. Get student marks for prepare results
app.get("/api/students/:studentId/marks", async (req, res) => {
    try {
        const { studentId } = req.params;
        const { class_id, semester, academic_year } = req.query;
        
        const connection = await getConnection();
        
        const [marks] = await connection.execute(`
            SELECT classwork_marks, midterm_marks, endterm_marks, total_score, percentage, grade
            FROM student_marks 
            WHERE student_id = ? AND class_id = ? AND semester = ? AND academic_year = ?
            ORDER BY created_at DESC
            LIMIT 1
        `, [studentId, class_id, semester, academic_year]);
        
        await connection.end();
        
        res.json(marks[0] || {});
    } catch (error) {
        console.error("Error fetching student marks:", error);
        res.status(500).json({ error: "Failed to fetch student marks" });
    }
});

// 7. Calculate and save multi-subject results
app.post("/api/results/calculate", async (req, res) => {
    try {
        const { class_id, semester, academic_year, grading_config, student_results } = req.body;
        
        const connection = await getConnection();
        
        const results = [];
        
        for (const studentResult of student_results) {
            const { student_id, subjects } = studentResult;
            
            // Calculate total score across all subjects
            let totalScore = 0;
            let totalSubjects = 0;
            
            for (const [subject_id, marks] of Object.entries(subjects)) {
                // Calculate weighted score for this subject
                const subjectScore = (
                    (marks.classwork * grading_config.weights.classwork) +
                    (marks.midterm * grading_config.weights.midterm) +
                    (marks.endterm * grading_config.weights.endterm)
                ) / 100;
                
                totalScore += subjectScore;
                totalSubjects++;
                
                // Save individual subject marks
                await connection.execute(`
                    INSERT INTO student_subject_marks 
                    (student_id, class_id, semester, academic_year, subject_id, classwork_marks, midterm_marks, endterm_marks, total_score, grade)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    classwork_marks = VALUES(classwork_marks),
                    midterm_marks = VALUES(midterm_marks),
                    endterm_marks = VALUES(endterm_marks),
                    total_score = VALUES(total_score),
                    grade = VALUES(grade),
                    updated_at = NOW()
                `, [
                    student_id, class_id, semester, academic_year, subject_id,
                    marks.classwork, marks.midterm, marks.endterm,
                    Math.round(subjectScore), calculateGrade(subjectScore, grading_config.gradeScale)
                ]);
            }
            
            // Calculate average percentage
            const averagePercentage = totalSubjects > 0 ? totalScore / totalSubjects : 0;
            const overallGrade = calculateGrade(averagePercentage, grading_config.gradeScale);
            
            // Save overall student result
            await connection.execute(`
                INSERT INTO student_marks 
                (student_id, class_id, semester, academic_year, total_score, percentage, grade)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                total_score = VALUES(total_score),
                percentage = VALUES(percentage),
                grade = VALUES(grade),
                updated_at = NOW()
            `, [
                student_id, class_id, semester, academic_year,
                Math.round(totalScore), Math.round(averagePercentage), overallGrade
            ]);
            
            results.push({
                student_id: student_id,
                total_score: Math.round(totalScore),
                average_percentage: Math.round(averagePercentage),
                overall_grade: overallGrade,
                subjects_count: totalSubjects
            });
        }
        
        await connection.end();
        
        res.json({
            message: `Successfully calculated results for ${results.length} students`,
            results: results
        });
        
    } catch (error) {
        console.error("Error calculating results:", error);
        res.status(500).json({ error: "Failed to calculate results" });
    }
});

// 8. Generate PDF results with multi-subject data
app.post("/api/results/generate", upload.single("template"), async (req, res) => {
    try {
        const { class_id, semester, academic_year, student_ids } = req.body;
        const templateFile = req.file;
        
        if (!templateFile) {
            return res.status(400).json({ error: "School template is required" });
        }
        
        const connection = await getConnection();
        
        // Get class information
        const [classInfo] = await connection.execute(`
            SELECT class_name FROM classes WHERE class_id = ?
        `, [class_id]);
        
        if (classInfo.length === 0) {
            await connection.end();
            return res.status(404).json({ error: "Class not found" });
        }
        
        const className = classInfo[0].class_name;
        
        // Get student marks with subject details
        const [studentMarks] = await connection.execute(`
            SELECT sm.*, s.St_Full_N as student_name
            FROM student_marks sm
            JOIN students s ON sm.student_id = s.Student_ID
            WHERE sm.class_id = ? AND sm.semester = ? AND sm.academic_year = ?
            AND sm.student_id IN (${student_ids.map(() => "?").join(",")})
        `, [class_id, semester, academic_year, ...student_ids]);
        
        // Get subject marks for each student
        const studentSubjectMarks = {};
        for (const studentMark of studentMarks) {
            const [subjectMarks] = await connection.execute(`
                SELECT ssm.*, sub.subject_name
                FROM student_subject_marks ssm
                JOIN subjects sub ON ssm.subject_id = sub.subject_id
                WHERE ssm.student_id = ? AND ssm.class_id = ? AND ssm.semester = ? AND ssm.academic_year = ?
                ORDER BY sub.subject_name
            `, [studentMark.student_id, class_id, semester, academic_year]);
            
            studentSubjectMarks[studentMark.student_id] = subjectMarks;
        }
        
        await connection.end();
        
        // Generate PDF for each student
        const generatedFiles = [];
        
        // Create folder structure: Results/ClassName/Semester/
        const sanitizedClassName = className.replace(/[^a-zA-Z0-9]/g, "_");
        const sanitizedSemester = semester.replace(/[^a-zA-Z0-9]/g, "_");
        const sanitizedAcademicYear = academic_year.replace(/[^a-zA-Z0-9]/g, "_");
        
        const outputDir = path.join(uploadsDir, "Results", sanitizedClassName, sanitizedSemester);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Create a README file in the folder
        const readmeContent = `
Results Folder: ${className}
Semester: ${semester}
Academic Year: ${academic_year}
Generated: ${new Date().toLocaleString()}
Total Students: ${studentMarks.length}

Files in this folder:
${studentMarks.map(sm => `- ${sm.student_id}_result.pdf`).join("\n")}

Generated by Studily School Management System
        `;
        
        fs.writeFileSync(path.join(outputDir, "README.txt"), readmeContent);
        
        for (const studentMark of studentMarks) {
            const subjectMarks = studentSubjectMarks[studentMark.student_id] || [];
            const pdfPath = await generateStudentPDF(studentMark, subjectMarks, templateFile.path, outputDir);
            generatedFiles.push({
                student_id: studentMark.student_id,
                student_name: studentMark.student_name,
                pdf_path: pdfPath,
                folder_path: outputDir
            });
        }
        
        res.json({
            message: `Successfully generated ${generatedFiles.length} PDF results`,
            files: generatedFiles,
            output_directory: outputDir,
            folder_name: sanitizedClassName,
            class_name: className,
            semester: semester,
            academic_year: academic_year
        });
        
    } catch (error) {
        console.error("Error generating PDF results:", error);
        res.status(500).json({ error: "Failed to generate PDF results" });
    }
});

// 9. Upload school template
app.post("/api/templates/upload", upload.single("template"), async (req, res) => {
    try {
        const templateFile = req.file;
        
        if (!templateFile) {
            return res.status(400).json({ error: "Template file is required" });
        }
        
        // Validate PDF file
        if (templateFile.mimetype !== "application/pdf") {
            return res.status(400).json({ error: "Only PDF files are allowed" });
        }
        
        // Save template info to database (optional)
        const templateInfo = {
            filename: templateFile.filename,
            original_name: templateFile.originalname,
            size: templateFile.size,
            upload_date: new Date()
        };
        
        res.json({
            message: "Template uploaded successfully",
            template: templateInfo
        });
        
    } catch (error) {
        console.error("Error uploading template:", error);
        res.status(500).json({ error: "Failed to upload template" });
    }
});

// 9. Download all PDF results as zip file
app.get("/api/results/download/:classId/:semester/:academicYear", async (req, res) => {
    try {
        const { classId, semester, academicYear } = req.params;
        
        const connection = await getConnection();
        
        // Get class information
        const [classInfo] = await connection.execute(`
            SELECT class_name FROM classes WHERE class_id = ?
        `, [classId]);
        
        if (classInfo.length === 0) {
            await connection.end();
            return res.status(404).json({ error: "Class not found" });
        }
        
        const className = classInfo[0].class_name;
        const sanitizedClassName = className.replace(/[^a-zA-Z0-9]/g, "_");
        const sanitizedSemester = semester.replace(/[^a-zA-Z0-9]/g, "_");
        const sanitizedAcademicYear = academicYear.replace(/[^a-zA-Z0-9]/g, "_");
        
        const folderPath = path.join(uploadsDir, "Results", sanitizedClassName, sanitizedSemester);
        
        if (!fs.existsSync(folderPath)) {
            await connection.end();
            return res.status(404).json({ error: "Results folder not found" });
        }
        
        await connection.end();
        
        // Create zip file
        const zipFileName = `${sanitizedClassName}_${sanitizedSemester}_${sanitizedAcademicYear}_results.zip`;
        const zipPath = path.join(uploadsDir, zipFileName);
        
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", {
            zlib: { level: 9 } // Sets the compression level
        });
        
        output.on("close", () => {
            res.download(zipPath, zipFileName, (err) => {
                if (err) {
                    console.error("Error downloading zip file:", err);
                }
                // Clean up zip file after download
                fs.unlinkSync(zipPath);
            });
        });
        
        archive.on("error", (err) => {
            throw err;
        });
        
        archive.pipe(output);
        
        // Add all PDF files to zip
        const files = fs.readdirSync(folderPath);
        files.forEach(file => {
            if (file.endsWith(".pdf")) {
                archive.file(path.join(folderPath, file), { name: file });
            }
        });
        
        archive.finalize();
        
    } catch (error) {
        console.error("Error downloading PDF results:", error);
        res.status(500).json({ error: "Failed to download PDF results" });
    }
});

// 10. Get folder information
app.get("/api/results/folder/:classId/:semester/:academicYear", async (req, res) => {
    try {
        const { classId, semester, academicYear } = req.params;
        
        const connection = await getConnection();
        
        // Get class information
        const [classInfo] = await connection.execute(`
            SELECT class_name FROM classes WHERE class_id = ?
        `, [classId]);
        
        if (classInfo.length === 0) {
            await connection.end();
            return res.status(404).json({ error: "Class not found" });
        }
        
        const className = classInfo[0].class_name;
        const sanitizedClassName = className.replace(/[^a-zA-Z0-9]/g, "_");
        const sanitizedSemester = semester.replace(/[^a-zA-Z0-9]/g, "_");
        const sanitizedAcademicYear = academicYear.replace(/[^a-zA-Z0-9]/g, "_");
        
        const folderPath = path.join(uploadsDir, "Results", sanitizedClassName, sanitizedSemester);
        
        if (!fs.existsSync(folderPath)) {
            await connection.end();
            return res.status(404).json({ error: "Results folder not found" });
        }
        
        // Get folder contents
        const files = fs.readdirSync(folderPath);
        const pdfFiles = files.filter(file => file.endsWith(".pdf"));
        
        await connection.end();
        
        res.json({
            folder_path: folderPath,
            class_name: className,
            semester: semester,
            academic_year: academicYear,
            total_files: files.length,
            pdf_files: pdfFiles.length,
            files: files
        });
        
    } catch (error) {
        console.error("Error getting folder information:", error);
        res.status(500).json({ error: "Failed to get folder information" });
    }
});

// ========================================
// STUDENT RECORDS API ENDPOINTS
// ========================================

// 11. Get student attendance records
app.get("/api/student/attendance/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        const { start_date, end_date, status } = req.query;
        
        const connection = await getConnection();
        
        let query = `
            SELECT sa.*, c.class_name, s.St_Full_N as student_name
            FROM student_attendance sa
            JOIN classes c ON sa.class_id = c.class_id
            JOIN students s ON sa.student_id = s.Student_ID
            WHERE sa.student_id = ?
        `;
        
        const params = [studentId];
        
        if (start_date) {
            query += " AND sa.date >= ?";
            params.push(start_date);
        }
        
        if (end_date) {
            query += " AND sa.date <= ?";
            params.push(end_date);
        }
        
        if (status) {
            query += " AND sa.status = ?";
            params.push(status);
        }
        
        query += " ORDER BY sa.date DESC";
        
        const [attendance] = await connection.execute(query, params);
        
        // Calculate attendance statistics
        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === "present").length;
        const absentDays = attendance.filter(a => a.status === "absent").length;
        const lateDays = attendance.filter(a => a.status === "late").length;
        const excusedDays = attendance.filter(a => a.status === "excused").length;
        
        const attendanceRate = totalDays > 0 ? ((presentDays + lateDays) / totalDays * 100).toFixed(2) : 0;
        
        await connection.end();
        
        res.json({
            student_id: studentId,
            attendance_records: attendance,
            statistics: {
                total_days: totalDays,
                present_days: presentDays,
                absent_days: absentDays,
                late_days: lateDays,
                excused_days: excusedDays,
                attendance_rate: attendanceRate
            }
        });
        
    } catch (error) {
        console.error("Error fetching student attendance:", error);
        res.status(500).json({ error: "Failed to fetch attendance records" });
    }
});

// 12. Get student classwork records
app.get("/api/student/classwork/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status, subject_id } = req.query;
        
        const connection = await getConnection();
        
        let query = `
            SELECT sc.*, ca.title, ca.description, ca.due_date, ca.total_marks,
                   sub.subject_name, c.class_name, s.St_Full_N as student_name
            FROM student_classwork sc
            JOIN classwork_assignments ca ON sc.assignment_id = ca.assignment_id
            JOIN subjects sub ON ca.subject_id = sub.subject_id
            JOIN classes c ON ca.class_id = c.class_id
            JOIN students s ON sc.student_id = s.Student_ID
            WHERE sc.student_id = ?
        `;
        
        const params = [studentId];
        
        if (status) {
            query += " AND sc.status = ?";
            params.push(status);
        }
        
        if (subject_id) {
            query += " AND ca.subject_id = ?";
            params.push(subject_id);
        }
        
        query += " ORDER BY ca.due_date DESC";
        
        const [classwork] = await connection.execute(query, params);
        
        // Calculate classwork statistics
        const totalAssignments = classwork.length;
        const completedAssignments = classwork.filter(c => c.status === "graded").length;
        const pendingAssignments = classwork.filter(c => c.status === "submitted").length;
        const lateAssignments = classwork.filter(c => c.status === "late").length;
        const missingAssignments = classwork.filter(c => c.status === "missing").length;
        
        const averageScore = completedAssignments > 0 
            ? (classwork.filter(c => c.status === "graded")
                .reduce((sum, c) => sum + parseFloat(c.marks_obtained || 0), 0) / completedAssignments).toFixed(2)
            : 0;
        
        await connection.end();
        
        res.json({
            student_id: studentId,
            classwork_records: classwork,
            statistics: {
                total_assignments: totalAssignments,
                completed_assignments: completedAssignments,
                pending_assignments: pendingAssignments,
                late_assignments: lateAssignments,
                missing_assignments: missingAssignments,
                average_score: averageScore
            }
        });
        
    } catch (error) {
        console.error("Error fetching student classwork:", error);
        res.status(500).json({ error: "Failed to fetch classwork records" });
    }
});

// 13. Get student school fees records
app.get("/api/student/fees/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status, fee_type } = req.query;
        
        const connection = await getConnection();
        
        let query = `
            SELECT sf.*, fs.fee_name, fs.fee_type, fs.amount as total_amount,
                   fs.due_date, c.class_name, s.St_Full_N as student_name
            FROM student_fees sf
            JOIN fees_structure fs ON sf.fee_id = fs.fee_id
            JOIN classes c ON fs.class_id = c.class_id
            JOIN students s ON sf.student_id = s.Student_ID
            WHERE sf.student_id = ?
        `;
        
        const params = [studentId];
        
        if (status) {
            query += " AND sf.status = ?";
            params.push(status);
        }
        
        if (fee_type) {
            query += " AND fs.fee_type = ?";
            params.push(fee_type);
        }
        
        query += " ORDER BY fs.due_date ASC";
        
        const [fees] = await connection.execute(query, params);
        
        // Calculate school fees statistics
        const totalFees = fees.length;
        const paidFees = fees.filter(f => f.status === "paid").length;
        const pendingFees = fees.filter(f => f.status === "pending").length;
        const partialFees = fees.filter(f => f.status === "partial").length;
        const overdueFees = fees.filter(f => f.status === "overdue").length;
        
        const totalAmount = fees.reduce((sum, f) => sum + parseFloat(f.total_amount || 0), 0);
        const totalPaid = fees.reduce((sum, f) => sum + parseFloat(f.amount_paid || 0), 0);
        const totalOutstanding = totalAmount - totalPaid;
        
        await connection.end();
        
        res.json({
            student_id: studentId,
            fees_records: fees,
            statistics: {
                total_fees: totalFees,
                paid_fees: paidFees,
                pending_fees: pendingFees,
                partial_fees: partialFees,
                overdue_fees: overdueFees,
                total_amount: totalAmount.toFixed(2),
                total_paid: totalPaid.toFixed(2),
                total_outstanding: totalOutstanding.toFixed(2)
            }
        });
        
    } catch (error) {
        console.error("Error fetching student school fees:", error);
        res.status(500).json({ error: "Failed to fetch school fees records" });
    }
});

// 14. Get student overall records summary
app.get("/api/student/summary/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const connection = await getConnection();
        
        // Get student basic info
        const [studentInfo] = await connection.execute(`
            SELECT s.*, c.class_name 
            FROM students s
            JOIN classes c ON s.class_id = c.class_id
            WHERE s.Student_ID = ?
        `, [studentId]);
        
        if (studentInfo.length === 0) {
            await connection.end();
            return res.status(404).json({ error: "Student not found" });
        }
        
        const student = studentInfo[0];
        
        // Get attendance summary
        const [attendanceStats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_days,
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
                COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
                COUNT(CASE WHEN status = 'late' THEN 1 END) as late_days
            FROM student_attendance 
            WHERE student_id = ?
        `, [studentId]);
        
        // Get classwork summary
        const [classworkStats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_assignments,
                COUNT(CASE WHEN status = 'graded' THEN 1 END) as completed_assignments,
                AVG(CASE WHEN status = 'graded' THEN marks_obtained END) as average_score
            FROM student_classwork 
            WHERE student_id = ?
        `, [studentId]);
        
        // Get school fees summary
        const [feesStats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_fees,
                COUNT(CASE WHEN sf.status = 'paid' THEN 1 END) as paid_fees,
                SUM(fs.amount) as total_amount,
                SUM(sf.amount_paid) as total_paid
            FROM student_fees sf
            JOIN fees_structure fs ON sf.fee_id = fs.fee_id
            WHERE sf.student_id = ?
        `, [studentId]);
        
        // Get academic results summary
        const [resultsStats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_semesters,
                AVG(percentage) as average_percentage,
                MAX(percentage) as highest_percentage,
                MIN(percentage) as lowest_percentage
            FROM student_marks 
            WHERE student_id = ?
        `, [studentId]);
        
        await connection.end();
        
        res.json({
            student_info: student,
            summary: {
                attendance: attendanceStats[0] || {},
                classwork: classworkStats[0] || {},
                fees: feesStats[0] || {},
                results: resultsStats[0] || {}
            }
        });
        
    } catch (error) {
        console.error("Error fetching student summary:", error);
        res.status(500).json({ error: "Failed to fetch student summary" });
    }
});

// Helper function to calculate grade
function calculateGrade(percentage, gradeScale) {
    if (percentage >= gradeScale.A.min) return "A";
    if (percentage >= gradeScale.B.min) return "B";
    if (percentage >= gradeScale.C.min) return "C";
    if (percentage >= gradeScale.D.min) return "D";
    return "F";
}

// Helper function to generate student PDF with multi-subject data
async function generateStudentPDF(studentMark, subjectMarks, templatePath, outputDir) {
    try {
        // For now, create a comprehensive PDF with all subject data
        // In a real implementation, you would use a PDF library like PDFKit or Puppeteer
        let subjectsTable = "";
        if (subjectMarks.length > 0) {
            subjectsTable = `
            SUBJECTS BREAKDOWN:
            ===================
            ${subjectMarks.map(subject => `
            ${subject.subject_name}:
            - Classwork: ${subject.classwork_marks}%
            - Midterm: ${subject.midterm_marks}%
            - End Term: ${subject.endterm_marks}%
            - Total: ${subject.total_score}%
            - Grade: ${subject.grade}
            `).join("\n")}
            `;
        }
        
        const pdfContent = `
            STUDENT RESULT REPORT
            =====================
            
            Student ID: ${studentMark.student_id}
            Student Name: ${studentMark.student_name}
            Class: ${studentMark.class_id}
            Semester: ${studentMark.semester}
            Academic Year: ${studentMark.academic_year}
            
            ${subjectsTable}
            
            OVERALL RESULT:
            ================
            - Total Score (All Subjects): ${studentMark.total_score}
            - Average Percentage: ${studentMark.percentage}%
            - Overall Grade: ${studentMark.grade}
            - Subjects Count: ${subjectMarks.length}
            
            Generated on: ${new Date().toLocaleDateString()}
            Template used: ${path.basename(templatePath)}
        `;
        
        const fileName = `${studentMark.student_id}_result.pdf`;
        const filePath = path.join(outputDir, fileName);
        
        // Write content to file (simplified - in real implementation, generate actual PDF)
        fs.writeFileSync(filePath, pdfContent);
        
        return filePath;
        
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
}

// ========================================
// MAIN ADMIN ENDPOINTS
// ========================================

// Main admin login
app.post("/api/main-admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const connection = await getConnection();
        
        const [admins] = await connection.execute(
            "SELECT * FROM main_admins WHERE email = ? AND status = \"active\"",
            [email]
        );

        await connection.end();

        if (admins.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const admin = admins[0];
        const isValidPassword = await bcrypt.compare(password, admin.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: admin.id, 
                email: admin.email, 
                role: "main_admin" 
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login successful",
            token: token,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name
            }
        });

    } catch (error) {
        console.error("Main admin login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

// Get main admin statistics
app.get("/api/main-admin/stats", async (req, res) => {
    try {
        const connection = await getConnection();
        
        // Get total schools
        const [schools] = await connection.execute("SELECT COUNT(*) as total FROM schools WHERE status = \"active\"");
        
        // Get total school admins
        const [schoolAdmins] = await connection.execute("SELECT COUNT(*) as total FROM school_admins WHERE status = \"active\"");
        
        // Get total main admins
        const [mainAdmins] = await connection.execute("SELECT COUNT(*) as total FROM main_admins WHERE status = \"active\"");
        
        // Get total students across all schools
        const [students] = await connection.execute("SELECT COUNT(*) as total FROM students WHERE status = \"active\"");
        
        await connection.end();

        res.json({
            totalSchools: schools[0].total,
            totalSchoolAdmins: schoolAdmins[0].total,
            totalMainAdmins: mainAdmins[0].total,
            totalUsers: students[0].total
        });

    } catch (error) {
        console.error("Error fetching main admin stats:", error);
        res.status(500).json({ error: "Failed to fetch statistics" });
    }
});

// Get student statistics for main admin
app.get("/api/main-admin/student-stats", async (req, res) => {
    try {
        const connection = await getConnection();
        
        // Get total students
        const [totalStudents] = await connection.execute("SELECT COUNT(*) as total FROM students WHERE status = \"active\"");
        
        // Get total schools
        const [totalSchools] = await connection.execute("SELECT COUNT(*) as total FROM schools WHERE status = \"active\"");
        
        await connection.end();

        const avgStudentsPerSchool = totalSchools[0].total > 0 ? 
            Math.round(totalStudents[0].total / totalSchools[0].total) : 0;

        res.json({
            totalStudents: totalStudents[0].total,
            averageStudentsPerSchool: avgStudentsPerSchool
        });

    } catch (error) {
        console.error("Error fetching student stats:", error);
        res.status(500).json({ error: "Failed to fetch student statistics" });
    }
});

// Get all schools
app.get("/api/schools", async (req, res) => {
    try {
        const connection = await getConnection();
        
        const [schools] = await connection.execute(
            "SELECT * FROM schools WHERE status = \"active\" ORDER BY name"
        );

        await connection.end();

        res.json(schools);

    } catch (error) {
        console.error("Error fetching schools:", error);
        res.status(500).json({ error: "Failed to fetch schools" });
    }
});

// Add new school
app.post("/api/schools", async (req, res) => {
    try {
        const { name, category, location, contact } = req.body;

        if (!name || !category) {
            return res.status(400).json({ error: "School name and category are required" });
        }

        const connection = await getConnection();
        
        const [result] = await connection.execute(
            "INSERT INTO schools (name, category, location, contact_number) VALUES (?, ?, ?, ?)",
            [name, category, location, contact]
        );

        await connection.end();

        res.json({
            message: "School added successfully",
            schoolId: result.insertId
        });

    } catch (error) {
        console.error("Error adding school:", error);
        res.status(500).json({ error: "Failed to add school" });
    }
});

// Create school admin
app.post("/api/school-admins", async (req, res) => {
    try {
        const { email, name, password, schoolId } = req.body;

        if (!email || !name || !password || !schoolId) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const connection = await getConnection();
        
        const [result] = await connection.execute(
            "INSERT INTO school_admins (email, name, password, school_id) VALUES (?, ?, ?, ?)",
            [email, name, hashedPassword, schoolId]
        );

        await connection.end();

        res.json({
            message: "School admin created successfully",
            adminId: result.insertId
        });

    } catch (error) {
        console.error("Error creating school admin:", error);
        res.status(500).json({ error: "Failed to create school admin" });
    }
});

// Create main admin
app.post("/api/main-admins", async (req, res) => {
    try {
        const { email, name, password } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const connection = await getConnection();
        
        const [result] = await connection.execute(
            "INSERT INTO main_admins (email, name, password) VALUES (?, ?, ?)",
            [email, name, hashedPassword]
        );

        await connection.end();

        res.json({
            message: "Main admin created successfully",
            adminId: result.insertId
        });

    } catch (error) {
        console.error("Error creating main admin:", error);
        res.status(500).json({ error: "Failed to create main admin" });
    }
});

// Get school-specific student statistics
app.get("/api/schools/:schoolId/student-stats", async (req, res) => {
    try {
        const { schoolId } = req.params;
        const connection = await getConnection();
        
        // Get school info
        const [schools] = await connection.execute(
            "SELECT * FROM schools WHERE id = ?",
            [schoolId]
        );

        if (schools.length === 0) {
            await connection.end();
            return res.status(404).json({ error: "School not found" });
        }

        const school = schools[0];

        // Get student statistics for this school
        // Note: This assumes students are linked to schools through classes
        const [students] = await connection.execute(`
            SELECT 
                COUNT(*) as totalStudents,
                SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as maleStudents,
                SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as femaleStudents
            FROM students s
            JOIN classes c ON s.class_id = c.class_id
            WHERE s.status = 'active'
        `);

        await connection.end();

        const stats = students[0];

        res.json({
            school: school,
            stats: {
                totalStudents: stats.totalStudents || 0,
                maleStudents: stats.maleStudents || 0,
                femaleStudents: stats.femaleStudents || 0
            }
        });

    } catch (error) {
        console.error("Error fetching school student stats:", error);
        res.status(500).json({ error: "Failed to fetch school statistics" });
    }
});

// Get students for a specific school
app.get("/api/schools/:schoolId/students", async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const connection = await getConnection();
        
        // Get total count
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total
            FROM students s
            JOIN classes c ON s.class_id = c.class_id
            WHERE s.status = 'active'
        `);

        // Get students with pagination
        const [students] = await connection.execute(`
            SELECT 
                s.Student_ID as student_id,
                s.St_Full_N as name,
                c.class_name as class,
                s.gender,
                s.contact,
                s.status
            FROM students s
            JOIN classes c ON s.class_id = c.class_id
            WHERE s.status = 'active'
            ORDER BY s.St_Full_N
            LIMIT ? OFFSET ?
        `, [parseInt(limit), offset]);

        await connection.end();

        const totalPages = Math.ceil(countResult[0].total / limit);

        res.json({
            students: students,
            pagination: {
                currentPage: parseInt(page),
                totalPages: totalPages,
                totalStudents: countResult[0].total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error("Error fetching school students:", error);
        res.status(500).json({ error: "Failed to fetch students" });
    }
});

// Export students for a school
app.get("/api/schools/:schoolId/students/export", async (req, res) => {
    try {
        const { schoolId } = req.params;
        const connection = await getConnection();
        
        const [students] = await connection.execute(`
            SELECT 
                s.Student_ID as student_id,
                s.St_Full_N as name,
                c.class_name as class,
                s.gender,
                s.contact,
                s.status
            FROM students s
            JOIN classes c ON s.class_id = c.class_id
            WHERE s.status = 'active'
            ORDER BY s.St_Full_N
        `);

        await connection.end();

        // Create CSV content
        const csvHeader = "Student ID,Name,Class,Gender,Contact,Status\n";
        const csvContent = students.map(student => 
            `${student.student_id},${student.name},${student.class},${student.gender},${student.contact},${student.status}`
        ).join("\n");

        const csvData = csvHeader + csvContent;

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="students_${schoolId}_${new Date().toISOString().split("T")[0]}.csv"`);
        res.send(csvData);

    } catch (error) {
        console.error("Error exporting students:", error);
        res.status(500).json({ error: "Failed to export students" });
    }
});

// Delete admin account
app.delete("/api/:accountType-admins/:accountId", async (req, res) => {
    try {
        const { accountType, accountId } = req.params;
        
        let tableName;
        switch (accountType) {
            case "main":
                tableName = "main_admins";
                break;
            case "school":
                tableName = "school_admins";
                break;
            case "teacher":
                tableName = "teachers";
                break;
            case "student":
                tableName = "students";
                break;
            default:
                return res.status(400).json({ error: "Invalid account type" });
        }

        const connection = await getConnection();
        
        // Soft delete by setting status to 'deleted'
        await connection.execute(
            `UPDATE ${tableName} SET status = 'deleted', updated_at = NOW() WHERE id = ?`,
            [accountId]
        );

        await connection.end();

        res.json({
            message: `${accountType} admin account deleted successfully`
        });

    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ error: "Failed to delete account" });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File too large" });
        }
    }
    
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Uploads directory: ${uploadsDir}`);
}); 