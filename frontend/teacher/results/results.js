// Teacher Results Management System

// Global variables
let currentTeacher = null;
let currentStudents = [];
let currentResults = [];
let editingStudentId = null;
let students = {};
let previousResults = [];

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    initializePage();
    setupEventListeners();
    loadTeacherInfo();
    loadClasses();
    loadPreviousResults();
});

// Initialize page
function initializePage() {
    // TODO: Load teacher info from database
    // currentTeacher = await loadTeacherFromDatabase();
    updateTeacherInfo();
}

// Setup event listeners
function setupEventListeners() {
    // Load students button
    document.getElementById("loadStudentsBtn").addEventListener("click", loadStudents);
    
    // Save all results button
    document.getElementById("saveAllBtn").addEventListener("click", saveAllResults);
    
    // Preview button
    document.getElementById("previewBtn").addEventListener("click", previewResults);
    
    // Clear button
    document.getElementById("clearBtn").addEventListener("click", clearAllResults);
    
    // Bulk actions
    document.getElementById("bulkEditBtn").addEventListener("click", bulkEdit);
    document.getElementById("exportBtn").addEventListener("click", exportResults);
    document.getElementById("importBtn").addEventListener("click", importResults);
    
    // Filter buttons
    document.getElementById("applyFiltersBtn").addEventListener("click", applyFilters);
    
    // Modal close buttons
    document.querySelectorAll(".close").forEach(closeBtn => {
        closeBtn.addEventListener("click", function() {
            const modal = this.closest(".modal");
            if (modal) {
                modal.style.display = "none";
            }
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener("click", function(event) {
        if (event.target.classList.contains("modal")) {
            event.target.style.display = "none";
        }
    });
}

// Load teacher information
function loadTeacherInfo() {
    // In a real application, this would fetch from the server
    console.log("Loading teacher info...");
}

// Update teacher info display
function updateTeacherInfo() {
    document.getElementById("teacherName").textContent = currentTeacher.name;
    document.getElementById("teacherSubject").textContent = `Subject: ${currentTeacher.subject}`;
    document.getElementById("teacherClasses").textContent = `Classes: ${currentTeacher.classes.join(", ")}`;
    document.getElementById("totalStudents").textContent = currentTeacher.totalStudents;
    document.getElementById("totalClasses").textContent = currentTeacher.classes.length;
}

// Load classes into dropdown
function loadClasses() {
    const classSelect = document.getElementById("classSelect");
    const filterClass = document.getElementById("filterClass");
    
    // Clear existing options
    classSelect.innerHTML = "<option value=\"\">Choose a class...</option>";
    filterClass.innerHTML = "<option value=\"\">All Classes</option>";
    
    // Add class options
    currentTeacher.classes.forEach(className => {
        const option = document.createElement("option");
        option.value = className;
        option.textContent = className;
        classSelect.appendChild(option.cloneNode(true));
        filterClass.appendChild(option);
    });
}

// Load students for selected class
function loadStudents() {
    const classSelect = document.getElementById("classSelect");
    const examTypeSelect = document.getElementById("examTypeSelect");
    const academicYearSelect = document.getElementById("academicYearSelect");
    const semesterSelect = document.getElementById("semesterSelect");
    
    // Validate selections
    if (!classSelect.value || !examTypeSelect.value || !academicYearSelect.value || !semesterSelect.value) {
        showError("Please select all required fields before loading students.");
        return;
    }
    
    const selectedClass = classSelect.value;
    const examType = examTypeSelect.value;
    const academicYear = academicYearSelect.value;
    const semester = semesterSelect.value;
    
    // Get students for the selected class
    currentStudents = mockStudents[selectedClass] || [];
    
    if (currentStudents.length === 0) {
        showError("No students found for the selected class.");
        return;
    }
    
    // Initialize results array
    currentResults = currentStudents.map(student => ({
        studentId: student.id,
        studentName: student.name,
        marks: "",
        grade: "",
        remarks: ""
    }));
    
    // Update display
    updateResultsDisplay();
    updateResultsSummary();
    
    // Show results section
    document.getElementById("resultsSection").style.display = "block";
    
    // Update summary information
    document.getElementById("studentCount").textContent = currentStudents.length;
    document.getElementById("subjectName").textContent = currentTeacher.subject;
    document.getElementById("examTypeDisplay").textContent = examType === "midterm" ? "Midterm" : "End of Term";
    
    showSuccess(`Loaded ${currentStudents.length} students for ${selectedClass}`);
}

// Update results table display
function updateResultsDisplay() {
    const tableBody = document.getElementById("resultsTableBody");
    tableBody.innerHTML = "";
    
    currentResults.forEach((result, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <div class="student-info">
                    <span class="student-name">${result.studentName}</span>
                    <span class="student-id">${result.studentId}</span>
                </div>
            </td>
            <td>${result.studentName}</td>
            <td>
                <input type="number" 
                       class="marks-input" 
                       value="${result.marks}" 
                       min="0" 
                       max="100" 
                       placeholder="0-100"
                       onchange="updateGrade(${index}, this.value)"
                       onblur="validateMarks(this)">
            </td>
            <td>
                <span class="grade-display ${getGradeClass(result.grade)}">${result.grade}</span>
            </td>
            <td>
                <textarea class="remarks-input" 
                          placeholder="Enter remarks..."
                          onchange="updateRemarks(${index}, this.value)">${result.remarks}</textarea>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-primary" onclick="editResult(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="viewHistory(${index})">
                        <i class="fas fa-history"></i> History
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update grade based on marks
function updateGrade(index, marks) {
    const grade = calculateGrade(marks);
    currentResults[index].marks = marks;
    currentResults[index].grade = grade;
    
    // Update the grade display in the table
    const row = document.getElementById("resultsTableBody").children[index];
    const gradeCell = row.children[3];
    gradeCell.innerHTML = `<span class="grade-display ${getGradeClass(grade)}">${grade}</span>`;
}

// Calculate grade based on marks
function calculateGrade(marks) {
    if (!marks || marks === "") return "";
    
    const numMarks = parseInt(marks);
    if (numMarks >= 90) return "A";
    if (numMarks >= 80) return "B";
    if (numMarks >= 70) return "C";
    if (numMarks >= 60) return "D";
    return "F";
}

// Get CSS class for grade
function getGradeClass(grade) {
    switch (grade) {
        case "A": return "grade-a";
        case "B": return "grade-b";
        case "C": return "grade-c";
        case "D": return "grade-d";
        case "F": return "grade-f";
        default: return "";
    }
}

// Update remarks
function updateRemarks(index, remarks) {
    currentResults[index].remarks = remarks;
}

// Validate marks input
function validateMarks(input) {
    const value = parseInt(input.value);
    if (value < 0) input.value = 0;
    if (value > 100) input.value = 100;
}

// Update results summary
function updateResultsSummary() {
    const filledResults = currentResults.filter(r => r.marks !== "");
    const totalMarks = filledResults.reduce((sum, r) => sum + parseInt(r.marks || 0), 0);
    const average = filledResults.length > 0 ? (totalMarks / filledResults.length).toFixed(1) : 0;
    
    document.getElementById("studentCount").textContent = currentStudents.length;
    document.getElementById("subjectName").textContent = currentTeacher.subject;
}

// Edit individual result
function editResult(index) {
    const result = currentResults[index];
    editingStudentId = result.studentId;
    
    // Populate modal
    document.getElementById("editStudentName").value = result.studentName;
    document.getElementById("editStudentId").value = result.studentId;
    document.getElementById("editMarks").value = result.marks;
    document.getElementById("editGrade").value = result.grade;
    document.getElementById("editRemarks").value = result.remarks;
    
    // Show modal
    document.getElementById("editResultModal").style.display = "block";
}

// Save edit result
function saveEditResult() {
    const marks = document.getElementById("editMarks").value;
    const remarks = document.getElementById("editRemarks").value;
    const grade = calculateGrade(marks);
    
    // Update the result
    const index = currentResults.findIndex(r => r.studentId === editingStudentId);
    if (index !== -1) {
        currentResults[index].marks = marks;
        currentResults[index].grade = grade;
        currentResults[index].remarks = remarks;
        
        // Update display
        updateResultsDisplay();
        updateResultsSummary();
    }
    
    // Close modal
    closeEditModal();
    showSuccess("Result updated successfully!");
}

// Close edit modal
function closeEditModal() {
    document.getElementById("editResultModal").style.display = "none";
    editingStudentId = null;
}

// View student history
function viewHistory(index) {
    const student = currentResults[index];
    showInfo(`Viewing history for ${student.studentName} (${student.studentId})`);
    // In a real application, this would fetch and display student's result history
}

// Preview results
function previewResults() {
    const filledResults = currentResults.filter(r => r.marks !== "");
    
    if (filledResults.length === 0) {
        showError("No results to preview. Please enter marks for at least one student.");
        return;
    }
    
    // Calculate statistics
    const totalMarks = filledResults.reduce((sum, r) => sum + parseInt(r.marks), 0);
    const average = (totalMarks / filledResults.length).toFixed(1);
    const highest = Math.max(...filledResults.map(r => parseInt(r.marks)));
    
    // Update preview modal
    document.getElementById("previewTitle").textContent = `${document.getElementById("classSelect").value} - ${document.getElementById("examTypeSelect").value === "midterm" ? "Midterm" : "End of Term"} Results`;
    document.getElementById("previewStudentCount").textContent = filledResults.length;
    document.getElementById("previewAverage").textContent = average;
    document.getElementById("previewHighest").textContent = highest;
    
    // Populate preview table
    const previewTableBody = document.getElementById("previewTableBody");
    previewTableBody.innerHTML = "";
    
    filledResults.forEach(result => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${result.studentId}</td>
            <td>${result.studentName}</td>
            <td>${result.marks}</td>
            <td><span class="grade-display ${getGradeClass(result.grade)}">${result.grade}</span></td>
            <td>${result.remarks || "-"}</td>
        `;
        previewTableBody.appendChild(row);
    });
    
    // Show modal
    document.getElementById("previewModal").style.display = "block";
}

// Close preview modal
function closePreviewModal() {
    document.getElementById("previewModal").style.display = "none";
}

// Save from preview
function saveFromPreview() {
    saveAllResults();
    closePreviewModal();
}

// Save all results
function saveAllResults() {
    const filledResults = currentResults.filter(r => r.marks !== "");
    
    if (filledResults.length === 0) {
        showError("No results to save. Please enter marks for at least one student.");
        return;
    }
    
    // Validate all marks
    const invalidResults = filledResults.filter(r => {
        const marks = parseInt(r.marks);
        return isNaN(marks) || marks < 0 || marks > 100;
    });
    
    if (invalidResults.length > 0) {
        showError("Please ensure all marks are between 0 and 100.");
        return;
    }
    
    // In a real application, this would send data to the server
    console.log("Saving results:", filledResults);
    
    // Simulate API call
    setTimeout(() => {
        showSuccess(`Successfully saved ${filledResults.length} results!`);
        
        // Add to previous results
        const newResult = {
            id: "RES" + Date.now(),
            class: document.getElementById("classSelect").value,
            examType: document.getElementById("examTypeSelect").value,
            academicYear: document.getElementById("academicYearSelect").value,
            semester: document.getElementById("semesterSelect").value,
            studentCount: filledResults.length,
            average: (filledResults.reduce((sum, r) => sum + parseInt(r.marks), 0) / filledResults.length).toFixed(1),
            lastUpdated: new Date().toISOString().split("T")[0]
        };
        
        mockPreviousResults.unshift(newResult);
        loadPreviousResults();
        
    }, 1000);
}

// Clear all results
function clearAllResults() {
    if (confirm("Are you sure you want to clear all results? This action cannot be undone.")) {
        currentResults = currentResults.map(result => ({
            ...result,
            marks: "",
            grade: "",
            remarks: ""
        }));
        
        updateResultsDisplay();
        updateResultsSummary();
        showSuccess("All results cleared successfully!");
    }
}

// Bulk edit functionality
function bulkEdit() {
    showInfo("Bulk edit feature coming soon!");
}

// Export results
function exportResults() {
    const filledResults = currentResults.filter(r => r.marks !== "");
    
    if (filledResults.length === 0) {
        showError("No results to export.");
        return;
    }
    
    // Create CSV content
    const csvContent = [
        ["Student ID", "Student Name", "Marks", "Grade", "Remarks"],
        ...filledResults.map(r => [r.studentId, r.studentName, r.marks, r.grade, r.remarks])
    ].map(row => row.join(",")).join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results_${document.getElementById("classSelect").value}_${document.getElementById("examTypeSelect").value}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showSuccess("Results exported successfully!");
}

// Import results
function importResults() {
    showInfo("Import feature coming soon!");
}

// Load previous results
function loadPreviousResults() {
    const tableBody = document.getElementById("previousResultsTableBody");
    tableBody.innerHTML = "";
    
    mockPreviousResults.forEach(result => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${result.class}</td>
            <td>${result.examType === "midterm" ? "Midterm" : "End of Term"}</td>
            <td>${result.academicYear}</td>
            <td>${result.semester}</td>
            <td>${result.studentCount}</td>
            <td>${result.average}</td>
            <td>${formatDate(result.lastUpdated)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-primary" onclick="viewPreviousResult('${result.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="editPreviousResult('${result.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deletePreviousResult('${result.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Apply filters
function applyFilters() {
    const filterClass = document.getElementById("filterClass").value;
    const filterExamType = document.getElementById("filterExamType").value;
    const filterYear = document.getElementById("filterYear").value;
    
    // In a real application, this would filter the results from the server
    console.log("Applying filters:", { filterClass, filterExamType, filterYear });
    showInfo("Filters applied successfully!");
}

// View previous result
function viewPreviousResult(resultId) {
    const result = mockPreviousResults.find(r => r.id === resultId);
    if (result) {
        loadPreviousResultDetails(result);
        document.getElementById("viewPreviousResultsModal").style.display = "block";
    }
}

// Load previous result details
function loadPreviousResultDetails(result) {
    // Mock detailed results data
    const mockDetailedResults = [
        { studentId: "STU001", studentName: "John Smith", marks: 85, grade: "B", remarks: "Good performance" },
        { studentId: "STU002", studentName: "Emma Wilson", marks: 92, grade: "A", remarks: "Excellent work" },
        { studentId: "STU003", studentName: "Michael Brown", marks: 78, grade: "C", remarks: "Needs improvement" },
        { studentId: "STU004", studentName: "Sarah Davis", marks: 88, grade: "B", remarks: "Good effort" },
        { studentId: "STU005", studentName: "David Miller", marks: 95, grade: "A", remarks: "Outstanding performance" }
    ];
    
    // Update modal header information
    document.getElementById("previousResultTitle").textContent = `${result.class} - ${result.examType === "midterm" ? "Midterm" : "End of Term"} Results`;
    document.getElementById("previousResultDate").textContent = formatDate(result.lastUpdated);
    document.getElementById("previousResultStudents").textContent = result.studentCount;
    document.getElementById("previousResultAverage").textContent = result.average;
    
    // Calculate statistics
    const marks = mockDetailedResults.map(r => r.marks);
    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);
    
    document.getElementById("previousResultHighest").textContent = highest;
    document.getElementById("previousResultLowest").textContent = lowest;
    
    // Load grade distribution
    loadGradeDistribution(mockDetailedResults);
    
    // Load performance summary
    loadPerformanceSummary(mockDetailedResults);
    
    // Load detailed results table
    loadDetailedResultsTable(mockDetailedResults);
}

// Load grade distribution
function loadGradeDistribution(results) {
    const gradeCounts = {};
    results.forEach(result => {
        gradeCounts[result.grade] = (gradeCounts[result.grade] || 0) + 1;
    });
    
    const gradeDistribution = document.getElementById("gradeDistribution");
    gradeDistribution.innerHTML = "";
    
    const grades = ["A", "B", "C", "D", "F"];
    grades.forEach(grade => {
        const count = gradeCounts[grade] || 0;
        const percentage = results.length > 0 ? ((count / results.length) * 100).toFixed(1) : 0;
        
        const gradeItem = document.createElement("div");
        gradeItem.className = "grade-item";
        gradeItem.innerHTML = `
            <span class="grade-label ${getGradeClass(grade)}">${grade}</span>
            <span>${count} students (${percentage}%)</span>
        `;
        gradeDistribution.appendChild(gradeItem);
    });
}

// Load performance summary
function loadPerformanceSummary(results) {
    const performanceSummary = document.getElementById("performanceSummary");
    performanceSummary.innerHTML = "";
    
    const marks = results.map(r => r.marks);
    const average = (marks.reduce((sum, mark) => sum + mark, 0) / marks.length).toFixed(1);
    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);
    const passingCount = marks.filter(mark => mark >= 60).length;
    const passingPercentage = ((passingCount / marks.length) * 100).toFixed(1);
    
    const performanceItems = [
        { label: "Class Average", value: average },
        { label: "Highest Score", value: highest },
        { label: "Lowest Score", value: lowest },
        { label: "Passing Rate", value: `${passingPercentage}%` },
        { label: "Total Students", value: results.length }
    ];
    
    performanceItems.forEach(item => {
        const performanceItem = document.createElement("div");
        performanceItem.className = "performance-item";
        performanceItem.innerHTML = `
            <span class="performance-label">${item.label}</span>
            <span class="performance-value">${item.value}</span>
        `;
        performanceSummary.appendChild(performanceItem);
    });
}

// Load detailed results table
function loadDetailedResultsTable(results) {
    const tableBody = document.getElementById("previousResultsDetailTableBody");
    tableBody.innerHTML = "";
    
    // Sort results by marks (descending) for ranking
    const sortedResults = [...results].sort((a, b) => b.marks - a.marks);
    
    sortedResults.forEach((result, index) => {
        const rank = index + 1;
        const percentage = result.marks;
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <span class="rank-badge ${rank <= 3 ? `rank-${rank}` : "rank-other"}">${rank}</span>
            </td>
            <td>${result.studentId}</td>
            <td>${result.studentName}</td>
            <td>${result.marks}</td>
            <td><span class="grade-display ${getGradeClass(result.grade)}">${result.grade}</span></td>
            <td><span class="percentage-display">${percentage}%</span></td>
            <td>${result.remarks || "-"}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Close view previous results modal
function closeViewPreviousResultsModal() {
    document.getElementById("viewPreviousResultsModal").style.display = "none";
}

// Export previous results
function exportPreviousResults() {
    const result = mockPreviousResults.find(r => r.id === "RES001"); // For demo purposes
    if (result) {
        showSuccess(`Exporting results for ${result.class}...`);
        // In a real application, this would generate and download a CSV file
    }
}

// Print previous results
function printPreviousResults() {
    const result = mockPreviousResults.find(r => r.id === "RES001"); // For demo purposes
    if (result) {
        showSuccess(`Printing results for ${result.class}...`);
        // In a real application, this would open the print dialog
    }
}

// Edit previous results from modal
function editPreviousResultsFromModal() {
    const result = mockPreviousResults.find(r => r.id === "RES001"); // For demo purposes
    if (result) {
        closeViewPreviousResultsModal();
        showInfo(`Editing results for ${result.class} - ${result.examType === "midterm" ? "Midterm" : "End of Term"}`);
        // In a real application, this would load the results for editing
    }
}

// Edit previous result
function editPreviousResult(resultId) {
    const result = mockPreviousResults.find(r => r.id === resultId);
    if (result) {
        showInfo(`Editing results for ${result.class} - ${result.examType === "midterm" ? "Midterm" : "End of Term"}`);
    }
}

// Delete previous result
function deletePreviousResult(resultId) {
    if (confirm("Are you sure you want to delete this result? This action cannot be undone.")) {
        const index = mockPreviousResults.findIndex(r => r.id === resultId);
        if (index !== -1) {
            mockPreviousResults.splice(index, 1);
            loadPreviousResults();
            showSuccess("Result deleted successfully!");
        }
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Show success message
function showSuccess(message) {
    document.getElementById("successMessage").textContent = message;
    document.getElementById("successModal").style.display = "block";
}

// Show error message
function showError(message) {
    document.getElementById("errorMessage").textContent = message;
    document.getElementById("errorModal").style.display = "block";
}

// Show info message
function showInfo(message) {
    alert(message); // In a real application, this would use a proper notification system
}

// Close success modal
function closeSuccessModal() {
    document.getElementById("successModal").style.display = "none";
}

// Close error modal
function closeErrorModal() {
    document.getElementById("errorModal").style.display = "none";
}

// Close preview modal
function closePdfModal() {
    document.getElementById("previewModal").style.display = "none";
} 