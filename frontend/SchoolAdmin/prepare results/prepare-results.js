// Prepare Results Management System - Multi-Subject

// Global variables
let currentClass = null;
let currentStudents = [];
let currentResults = [];
let currentSubjects = [];
let gradingSystem = {
    weights: {
        classwork: 30,
        midterm: 20,
        endterm: 50
    },
    gradeScale: {
        A: { min: 90, max: 100 },
        B: { min: 80, max: 89 },
        C: { min: 70, max: 79 },
        D: { min: 60, max: 69 },
        F: { min: 0, max: 59 }
    }
};
let selectedTemplate = null;
let currentStudentModal = null;

// Data containers for real data
let classes = [];
let subjects = [];
let students = {};

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    initializePage();
    setupEventListeners();
    loadClasses();
});

// Initialize page
function initializePage() {
    // Set up weight calculation
    setupWeightCalculation();
    
    // Set up grade scale validation
    setupGradeScaleValidation();
}

// Set up event listeners
function setupEventListeners() {
    // Load students button
    document.getElementById("loadStudentsBtn").addEventListener("click", loadStudents);
    
    // Weight inputs
    document.getElementById("classworkWeight").addEventListener("input", updateTotalWeight);
    document.getElementById("midtermWeight").addEventListener("input", updateTotalWeight);
    document.getElementById("endtermWeight").addEventListener("input", updateTotalWeight);
    
    // Import and calculate buttons
    document.getElementById("importDataBtn").addEventListener("click", importStudentData);
    document.getElementById("calculateResultsBtn").addEventListener("click", calculateAllResults);
    document.getElementById("showGenerateSectionBtn").addEventListener("click", showGenerateSection);
    
    // Template upload
    const templateUploadArea = document.getElementById("templateUploadArea");
    const templateFile = document.getElementById("templateFile");
    
    templateUploadArea.addEventListener("click", () => templateFile.click());
    templateUploadArea.addEventListener("dragover", handleDragOver);
    templateUploadArea.addEventListener("drop", handleFileDrop);
    templateFile.addEventListener("change", handleTemplateUpload);
    
    // Generate results
    document.getElementById("generateResultsBtn").addEventListener("click", generateAllResults);
    document.getElementById("previewResultsBtn").addEventListener("click", previewSampleResults);
    document.getElementById("generateAllPdfBtn").addEventListener("click", generateAllPdfResults);
    document.getElementById("downloadZipBtn").addEventListener("click", downloadAllPdfResults);
    document.getElementById("viewFolderBtn").addEventListener("click", viewPdfFolder);
    document.getElementById("emailResultsBtn").addEventListener("click", emailResultsToStudents);
    
    // Template actions
    document.getElementById("proceedToGenerateBtn").addEventListener("click", showGenerateSection);
    
    // Modal close buttons
    document.querySelectorAll(".close").forEach(closeBtn => {
        closeBtn.addEventListener("click", function() {
            this.closest(".modal").style.display = "none";
        });
    });
    
    // Search and filter
    document.getElementById("studentSearch").addEventListener("input", filterStudents);
    document.getElementById("gradeFilter").addEventListener("change", filterStudents);
    
    // Save student marks
    document.getElementById("saveStudentMarks").addEventListener("click", saveStudentMarks);
}

// Load classes
function loadClasses() {
    const classSelect = document.getElementById("classSelect");
    classSelect.innerHTML = "<option value=\"\">Choose a class...</option>";
    
    mockClasses.forEach(cls => {
        const option = document.createElement("option");
        option.value = cls.id;
        option.textContent = `${cls.name} (${cls.students} students)`;
        classSelect.appendChild(option);
    });
}

// Load students for selected class
function loadStudents() {
    const classSelect = document.getElementById("classSelect");
    const semesterSelect = document.getElementById("semesterSelect");
    const academicYearSelect = document.getElementById("academicYearSelect");
    
    // Validate selections
    if (!classSelect.value || !semesterSelect.value || !academicYearSelect.value) {
        showError("Please select class, semester, and academic year before loading students.");
        return;
    }
    
    currentClass = {
        id: classSelect.value,
        name: classSelect.options[classSelect.selectedIndex].text,
        semester: semesterSelect.value,
        academicYear: academicYearSelect.value
    };
    
    // Get students for the selected class
    currentStudents = mockStudents[classSelect.value] || [];
    
    if (currentStudents.length === 0) {
        showError("No students found for the selected class.");
        return;
    }
    
    // Set subjects for this class
    currentSubjects = mockSubjects;
    
    // Initialize results array
    currentResults = currentStudents.map(student => ({
        studentId: student.id,
        studentName: student.name,
        subjects: student.subjects || {},
        totalScore: 0,
        averagePercentage: 0,
        overallGrade: "",
        position: 0
    }));
    
    // Calculate initial results
    calculateAllResults();
    
    // Show next steps
    document.getElementById("gradingSystemCard").style.display = "block";
    document.getElementById("studentResultsCard").style.display = "block";
    document.getElementById("templateCard").style.display = "block";
    
    // Update display
    updateResultsDisplay();
    updateClassInfo();
    
    showSuccess(`Loaded ${currentStudents.length} students for ${currentClass.name}`);
}

// Update class information display
function updateClassInfo() {
    document.getElementById("classNameDisplay").textContent = currentClass.name;
    document.getElementById("studentCountDisplay").textContent = currentStudents.length;
    document.getElementById("subjectsCountDisplay").textContent = currentSubjects.length;
}

// Set up weight calculation
function setupWeightCalculation() {
    updateTotalWeight();
}

// Update total weight display
function updateTotalWeight() {
    const classworkWeight = parseInt(document.getElementById("classworkWeight").value) || 0;
    const midtermWeight = parseInt(document.getElementById("midtermWeight").value) || 0;
    const endtermWeight = parseInt(document.getElementById("endtermWeight").value) || 0;
    
    const total = classworkWeight + midtermWeight + endtermWeight;
    document.getElementById("totalWeight").textContent = total;
    
    // Update global grading system
    gradingSystem.weights = {
        classwork: classworkWeight,
        midterm: midtermWeight,
        endterm: endtermWeight
    };
    
    // Highlight if total is not 100%
    const totalElement = document.getElementById("totalWeight");
    if (total !== 100) {
        totalElement.style.color = "#dc2626";
    } else {
        totalElement.style.color = "#059669";
    }
}

// Set up grade scale validation
function setupGradeScaleValidation() {
    const gradeInputs = [
        "gradeAMin", "gradeAMax", "gradeBMin", "gradeBMax",
        "gradeCMin", "gradeCMax", "gradeDMin", "gradeDMax",
        "gradeFMin", "gradeFMax"
    ];
    
    gradeInputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener("input", updateGradeScale);
    });
}

// Update grade scale
function updateGradeScale() {
    gradingSystem.gradeScale = {
        A: {
            min: parseInt(document.getElementById("gradeAMin").value) || 90,
            max: parseInt(document.getElementById("gradeAMax").value) || 100
        },
        B: {
            min: parseInt(document.getElementById("gradeBMin").value) || 80,
            max: parseInt(document.getElementById("gradeBMax").value) || 89
        },
        C: {
            min: parseInt(document.getElementById("gradeCMin").value) || 70,
            max: parseInt(document.getElementById("gradeCMax").value) || 79
        },
        D: {
            min: parseInt(document.getElementById("gradeDMin").value) || 60,
            max: parseInt(document.getElementById("gradeDMax").value) || 69
        },
        F: {
            min: parseInt(document.getElementById("gradeFMin").value) || 0,
            max: parseInt(document.getElementById("gradeFMax").value) || 59
        }
    };
}

// Import student data
function importStudentData() {
    // Simulate importing data from teachers' records
    showSuccess("Student data imported successfully from teacher records.");
    
    // Update results with imported data
    currentResults.forEach(result => {
        const student = currentStudents.find(s => s.id === result.studentId);
        if (student) {
            result.subjects = student.subjects || {};
        }
    });
    
    calculateAllResults();
    updateResultsDisplay();
}

// Calculate all results
function calculateAllResults() {
    currentResults.forEach(result => {
        // Calculate total score across all subjects
        let totalScore = 0;
        let totalSubjects = 0;
        
        currentSubjects.forEach(subject => {
            const subjectMarks = result.subjects[subject.id];
            if (subjectMarks) {
                // Calculate weighted score for this subject
                const subjectScore = (
                    (subjectMarks.classwork * gradingSystem.weights.classwork) +
                    (subjectMarks.midterm * gradingSystem.weights.midterm) +
                    (subjectMarks.endterm * gradingSystem.weights.endterm)
                ) / 100;
                
                totalScore += subjectScore;
                totalSubjects++;
            }
        });
        
        // Calculate average percentage
        const averagePercentage = totalSubjects > 0 ? totalScore / totalSubjects : 0;
        
        result.totalScore = Math.round(totalScore);
        result.averagePercentage = Math.round(averagePercentage);
        result.overallGrade = calculateGrade(averagePercentage);
    });
    
    // Calculate positions
    calculatePositions();
    
    updateResultsDisplay();
    showSuccess("Results calculated successfully using current grading system.");
}

// Calculate positions based on total scores
function calculatePositions() {
    // Sort students by total score (descending)
    const sortedResults = [...currentResults].sort((a, b) => b.totalScore - a.totalScore);
    
    // Assign positions
    sortedResults.forEach((result, index) => {
        const originalResult = currentResults.find(r => r.studentId === result.studentId);
        if (originalResult) {
            originalResult.position = index + 1;
        }
    });
}

// Calculate grade based on percentage
function calculateGrade(percentage) {
    if (percentage >= gradingSystem.gradeScale.A.min) return "A";
    if (percentage >= gradingSystem.gradeScale.B.min) return "B";
    if (percentage >= gradingSystem.gradeScale.C.min) return "C";
    if (percentage >= gradingSystem.gradeScale.D.min) return "D";
    return "F";
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
            <td class="total-score">${result.totalScore}</td>
            <td class="percentage">${result.averagePercentage}%</td>
            <td>
                <span class="grade-badge grade-${result.overallGrade.toLowerCase()}">${result.overallGrade}</span>
            </td>
            <td class="position">${result.position}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-primary" onclick="editStudentDetails(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="viewStudentHistory(${index})">
                        <i class="fas fa-history"></i> History
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Edit student details
function editStudentDetails(index) {
    const result = currentResults[index];
    currentStudentModal = index;
    
    // Populate modal
    document.getElementById("modalStudentName").textContent = result.studentName;
    document.getElementById("modalStudentId").textContent = result.studentId;
    
    // Populate subjects table
    populateSubjectsTable(result);
    
    // Update modal summary
    updateModalSummary();
    
    // Show modal
    document.getElementById("studentDetailsModal").style.display = "flex";
}

// Populate subjects table in modal
function populateSubjectsTable(result) {
    const subjectsTable = document.getElementById("subjectsTable");
    subjectsTable.innerHTML = "";
    
    currentSubjects.forEach(subject => {
        const subjectMarks = result.subjects[subject.id] || { classwork: 0, midterm: 0, endterm: 0 };
        
        // Calculate subject total
        const subjectTotal = (
            (subjectMarks.classwork * gradingSystem.weights.classwork) +
            (subjectMarks.midterm * gradingSystem.weights.midterm) +
            (subjectMarks.endterm * gradingSystem.weights.endterm)
        ) / 100;
        
        const subjectGrade = calculateGrade(subjectTotal);
        
        const subjectRow = document.createElement("div");
        subjectRow.className = "subject-row";
        subjectRow.innerHTML = `
            <div class="subject-header">
                <h5>${subject.name} (${subject.code})</h5>
            </div>
            <div class="subject-marks">
                <div class="mark-input-group">
                    <label>Classwork:</label>
                    <input type="number" 
                           data-subject="${subject.id}" 
                           data-type="classwork"
                           value="${subjectMarks.classwork}" 
                           min="0" 
                           max="100" 
                           placeholder="0-100">
                </div>
                <div class="mark-input-group">
                    <label>Midterm:</label>
                    <input type="number" 
                           data-subject="${subject.id}" 
                           data-type="midterm"
                           value="${subjectMarks.midterm}" 
                           min="0" 
                           max="100" 
                           placeholder="0-100">
                </div>
                <div class="mark-input-group">
                    <label>End Term:</label>
                    <input type="number" 
                           data-subject="${subject.id}" 
                           data-type="endterm"
                           value="${subjectMarks.endterm}" 
                           min="0" 
                           max="100" 
                           placeholder="0-100">
                </div>
                <div class="subject-total">
                    <span class="label">Total:</span>
                    <span class="value">${Math.round(subjectTotal)}</span>
                    <span class="grade-badge grade-${subjectGrade.toLowerCase()}">${subjectGrade}</span>
                </div>
            </div>
        `;
        
        subjectsTable.appendChild(subjectRow);
    });
    
    // Add event listeners to mark inputs
    addModalMarkInputListeners();
}

// Add event listeners to modal mark inputs
function addModalMarkInputListeners() {
    const markInputs = document.querySelectorAll("#subjectsTable input[type=\"number\"]");
    markInputs.forEach(input => {
        input.addEventListener("change", updateModalSummary);
    });
}

// Update modal summary
function updateModalSummary() {
    const result = currentResults[currentStudentModal];
    if (!result) return;
    
    // Recalculate totals from modal inputs
    let totalScore = 0;
    let totalSubjects = 0;
    
    currentSubjects.forEach(subject => {
        const classworkInput = document.querySelector(`input[data-subject="${subject.id}"][data-type="classwork"]`);
        const midtermInput = document.querySelector(`input[data-subject="${subject.id}"][data-type="midterm"]`);
        const endtermInput = document.querySelector(`input[data-subject="${subject.id}"][data-type="endterm"]`);
        
        if (classworkInput && midtermInput && endtermInput) {
            const classwork = parseInt(classworkInput.value) || 0;
            const midterm = parseInt(midtermInput.value) || 0;
            const endterm = parseInt(endtermInput.value) || 0;
            
            // Calculate subject total
            const subjectTotal = (
                (classwork * gradingSystem.weights.classwork) +
                (midterm * gradingSystem.weights.midterm) +
                (endterm * gradingSystem.weights.endterm)
            ) / 100;
            
            totalScore += subjectTotal;
            totalSubjects++;
            
            // Update subject total display
            const subjectRow = classworkInput.closest(".subject-row");
            const totalElement = subjectRow.querySelector(".subject-total .value");
            const gradeElement = subjectRow.querySelector(".subject-total .grade-badge");
            
            if (totalElement) totalElement.textContent = Math.round(subjectTotal);
            if (gradeElement) {
                const grade = calculateGrade(subjectTotal);
                gradeElement.textContent = grade;
                gradeElement.className = `grade-badge grade-${grade.toLowerCase()}`;
            }
        }
    });
    
    // Calculate average percentage
    const averagePercentage = totalSubjects > 0 ? totalScore / totalSubjects : 0;
    const overallGrade = calculateGrade(averagePercentage);
    
    // Update modal summary
    document.getElementById("modalTotalScore").textContent = Math.round(totalScore);
    document.getElementById("modalAveragePercentage").textContent = Math.round(averagePercentage) + "%";
    
    const overallGradeElement = document.getElementById("modalOverallGrade");
    overallGradeElement.textContent = overallGrade;
    overallGradeElement.className = `grade-badge grade-${overallGrade.toLowerCase()}`;
    
    // Update position (will be recalculated when saved)
    document.getElementById("modalPosition").textContent = result.position;
}

// Save student marks
function saveStudentMarks() {
    if (currentStudentModal === null) return;
    
    const result = currentResults[currentStudentModal];
    
    // Update marks from modal inputs
    currentSubjects.forEach(subject => {
        const classworkInput = document.querySelector(`input[data-subject="${subject.id}"][data-type="classwork"]`);
        const midtermInput = document.querySelector(`input[data-subject="${subject.id}"][data-type="midterm"]`);
        const endtermInput = document.querySelector(`input[data-subject="${subject.id}"][data-type="endterm"]`);
        
        if (classworkInput && midtermInput && endtermInput) {
            if (!result.subjects[subject.id]) {
                result.subjects[subject.id] = {};
            }
            
            result.subjects[subject.id].classwork = parseInt(classworkInput.value) || 0;
            result.subjects[subject.id].midterm = parseInt(midtermInput.value) || 0;
            result.subjects[subject.id].endterm = parseInt(endtermInput.value) || 0;
        }
    });
    
    // Recalculate totals
    let totalScore = 0;
    let totalSubjects = 0;
    
    currentSubjects.forEach(subject => {
        const subjectMarks = result.subjects[subject.id];
        if (subjectMarks) {
            const subjectScore = (
                (subjectMarks.classwork * gradingSystem.weights.classwork) +
                (subjectMarks.midterm * gradingSystem.weights.midterm) +
                (subjectMarks.endterm * gradingSystem.weights.endterm)
            ) / 100;
            
            totalScore += subjectScore;
            totalSubjects++;
        }
    });
    
    const averagePercentage = totalSubjects > 0 ? totalScore / totalSubjects : 0;
    
    result.totalScore = Math.round(totalScore);
    result.averagePercentage = Math.round(averagePercentage);
    result.overallGrade = calculateGrade(averagePercentage);
    
    // Recalculate positions
    calculatePositions();
    
    // Update display
    updateResultsDisplay();
    
    // Close modal
    closeStudentModal();
    
    showSuccess(`Marks updated for ${result.studentName}`);
}

// Close student modal
function closeStudentModal() {
    document.getElementById("studentDetailsModal").style.display = "none";
    currentStudentModal = null;
}

// View student history
function viewStudentHistory(index) {
    const result = currentResults[index];
    showInfo(`Viewing history for ${result.studentName} (${result.studentId})`);
    // TODO: Implement history view
}

// Filter students
function filterStudents() {
    const searchTerm = document.getElementById("studentSearch").value.toLowerCase();
    const gradeFilter = document.getElementById("gradeFilter").value;
    
    const filteredResults = currentResults.filter(result => {
        const matchesSearch = result.studentName.toLowerCase().includes(searchTerm) ||
                            result.studentId.toLowerCase().includes(searchTerm);
        const matchesGrade = !gradeFilter || result.overallGrade === gradeFilter;
        
        return matchesSearch && matchesGrade;
    });
    
    // Update table with filtered results
    const tableBody = document.getElementById("resultsTableBody");
    tableBody.innerHTML = "";
    
    filteredResults.forEach((result, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <div class="student-info">
                    <span class="student-name">${result.studentName}</span>
                    <span class="student-id">${result.studentId}</span>
                </div>
            </td>
            <td>${result.studentName}</td>
            <td class="total-score">${result.totalScore}</td>
            <td class="percentage">${result.averagePercentage}%</td>
            <td>
                <span class="grade-badge grade-${result.overallGrade.toLowerCase()}">${result.overallGrade}</span>
            </td>
            <td class="position">${result.position}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-primary" onclick="editStudentDetails(${currentResults.indexOf(result)})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="viewStudentHistory(${currentResults.indexOf(result)})">
                        <i class="fas fa-history"></i> History
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Handle template upload
function handleTemplateUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
        selectedTemplate = file;
        showTemplatePreview(file);
        document.getElementById("templateCard").style.display = "block";
        document.getElementById("generateCard").style.display = "block";
        updateGenerationSummary();
        showSuccess("School template uploaded successfully");
    } else {
        showError("Please select a valid PDF file");
    }
}

// Handle drag and drop
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add("dragover");
}

function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove("dragover");
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === "application/pdf") {
            selectedTemplate = file;
            showTemplatePreview(file);
            document.getElementById("templateCard").style.display = "block";
            document.getElementById("generateCard").style.display = "block";
            updateGenerationSummary();
            showSuccess("School template uploaded successfully");
        } else {
            showError("Please select a valid PDF file");
        }
    }
}

// Show template preview
function showTemplatePreview(file) {
    const preview = document.getElementById("templatePreview");
    const fileName = document.getElementById("templateFileName");
    const fileSize = document.getElementById("templateFileSize");
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    preview.style.display = "block";
    
    // Show generate section if students are loaded
    if (currentResults.length > 0) {
        document.getElementById("generateCard").style.display = "block";
        updateGenerationSummary();
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Update generation summary
function updateGenerationSummary() {
    if (currentClass && currentResults.length > 0) {
        document.getElementById("totalStudentsCount").textContent = currentResults.length;
        document.getElementById("resultsToGenerate").textContent = currentResults.length;
        document.getElementById("outputFolder").textContent = `Results/${currentClass.name}/${currentClass.semester}`;
    }
}

// Show generate section
function showGenerateSection() {
    if (!selectedTemplate) {
        showError("Please upload a school template first.");
        return;
    }
    
    if (currentResults.length === 0) {
        showError("Please load students first before generating results.");
        return;
    }
    
    document.getElementById("generateCard").style.display = "block";
    updateGenerationSummary();
    showSuccess("Ready to generate results!");
}

// Preview sample results
function previewSampleResults() {
    if (currentResults.length === 0) {
        showError("No results to preview. Please load students first.");
        return;
    }
    
    const sampleResult = currentResults[0];
    const previewContent = document.getElementById("previewContent");
    
    let subjectsHtml = "";
    currentSubjects.forEach(subject => {
        const subjectMarks = sampleResult.subjects[subject.id];
        if (subjectMarks) {
            const subjectTotal = (
                (subjectMarks.classwork * gradingSystem.weights.classwork) +
                (subjectMarks.midterm * gradingSystem.weights.midterm) +
                (subjectMarks.endterm * gradingSystem.weights.endterm)
            ) / 100;
            const grade = calculateGrade(subjectTotal);
            
            subjectsHtml += `
                <tr>
                    <td>${subject.name}</td>
                    <td>${subjectMarks.classwork}%</td>
                    <td>${subjectMarks.midterm}%</td>
                    <td>${subjectMarks.endterm}%</td>
                    <td>${Math.round(subjectTotal)}</td>
                    <td><span class="grade-badge grade-${grade.toLowerCase()}">${grade}</span></td>
                </tr>
            `;
        }
    });
    
    previewContent.innerHTML = `
        <div class="preview-header">
            <h3>Sample Result Preview</h3>
            <p>This is how the generated result will look for ${sampleResult.studentName}</p>
        </div>
        <div class="preview-body">
            <div class="result-card">
                <div class="result-header">
                    <h4>${currentClass.name} - ${currentClass.semester}</h4>
                    <p>Academic Year: ${currentClass.academicYear}</p>
                </div>
                <div class="student-details">
                    <p><strong>Student ID:</strong> ${sampleResult.studentId}</p>
                    <p><strong>Student Name:</strong> ${sampleResult.studentName}</p>
                    <p><strong>Position:</strong> ${sampleResult.position}</p>
                </div>
                <div class="subjects-breakdown">
                    <h5>Subjects Breakdown</h5>
                    <table class="subjects-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Classwork</th>
                                <th>Midterm</th>
                                <th>End Term</th>
                                <th>Total</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjectsHtml}
                        </tbody>
                    </table>
                </div>
                <div class="final-result">
                    <h5>Final Result</h5>
                    <div class="result-summary">
                        <div class="result-item">
                            <span>Total Score:</span>
                            <span>${sampleResult.totalScore}</span>
                        </div>
                        <div class="result-item">
                            <span>Average Percentage:</span>
                            <span>${sampleResult.averagePercentage}%</span>
                        </div>
                        <div class="result-item">
                            <span>Overall Grade:</span>
                            <span class="grade-badge grade-${sampleResult.overallGrade.toLowerCase()}">${sampleResult.overallGrade}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById("previewModal").style.display = "flex";
}

// Close preview modal
function closePreviewModal() {
    document.getElementById("previewModal").style.display = "none";
}

// Generate all results
function generateAllResults() {
    if (!selectedTemplate) {
        showError("Please upload a school template first.");
        return;
    }
    
    if (currentResults.length === 0) {
        showError("No results to generate. Please load students first.");
        return;
    }
    
    // Show progress section
    document.getElementById("progressSection").style.display = "block";
    document.getElementById("generateCard").style.display = "none";
    
    // Simulate generation process
    let progress = 0;
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const progressDetails = document.getElementById("progressDetails");
    
    const interval = setInterval(() => {
        progress += 10;
        progressFill.style.width = progress + "%";
        progressText.textContent = progress + "%";
        
        if (progress <= 30) {
            progressDetails.innerHTML = "<p>Preparing student data...</p>";
        } else if (progress <= 60) {
            progressDetails.innerHTML = "<p>Generating individual results...</p>";
        } else if (progress <= 90) {
            progressDetails.innerHTML = "<p>Applying school template...</p>";
        } else {
            progressDetails.innerHTML = "<p>Saving results to folder...</p>";
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                showResultsSummary();
            }, 1000);
        }
    }, 200);
}

// Generate all PDF results and save in class folder
function generateAllPdfResults() {
    if (!selectedTemplate) {
        showError("Please upload a school template first.");
        return;
    }
    
    if (currentResults.length === 0) {
        showError("No results to generate. Please load students first.");
        return;
    }
    
    if (!currentClass) {
        showError("Please select a class first.");
        return;
    }
    
    // Show progress section
    document.getElementById("progressSection").style.display = "block";
    document.getElementById("generateCard").style.display = "none";
    
    // Update progress details for PDF generation
    const progressDetails = document.getElementById("progressDetails");
    progressDetails.innerHTML = "<p>Preparing PDF generation for " + currentClass.name + "...</p>";
    
    // Simulate PDF generation process
    let progress = 0;
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    
    const interval = setInterval(() => {
        progress += 5;
        progressFill.style.width = progress + "%";
        progressText.textContent = progress + "%";
        
        if (progress <= 20) {
            progressDetails.innerHTML = "<p>Creating folder: " + currentClass.name + "</p>";
        } else if (progress <= 40) {
            progressDetails.innerHTML = "<p>Processing student data...</p>";
        } else if (progress <= 60) {
            progressDetails.innerHTML = "<p>Generating PDF files...</p>";
        } else if (progress <= 80) {
            progressDetails.innerHTML = "<p>Applying school template to each result...</p>";
        } else if (progress <= 95) {
            progressDetails.innerHTML = "<p>Saving PDF files to folder...</p>";
        } else {
            progressDetails.innerHTML = "<p>Finalizing and organizing files...</p>";
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                showPdfResultsSummary();
            }, 1000);
        }
    }, 150);
}

// Show results summary
function showResultsSummary() {
    document.getElementById("progressSection").style.display = "none";
    document.getElementById("resultsSummary").style.display = "block";
    
    const generatedCount = currentResults.length;
    const successRate = 100; // Assuming all successful
    const outputLocation = `Results/${currentClass.name}/${currentClass.semester}`;
    
    document.getElementById("generatedCount").textContent = generatedCount;
    document.getElementById("successRate").textContent = successRate + "%";
    document.getElementById("outputLocation").textContent = outputLocation;
    
    showSuccess(`Successfully generated ${generatedCount} result files`);
}

// Show PDF results summary
function showPdfResultsSummary() {
    document.getElementById("progressSection").style.display = "none";
    document.getElementById("resultsSummary").style.display = "block";
    
    const generatedCount = currentResults.length;
    const successRate = 100; // Assuming all successful
    const outputLocation = `Results/${currentClass.name}/${currentClass.semester}`;
    
    document.getElementById("generatedCount").textContent = generatedCount;
    document.getElementById("successRate").textContent = successRate + "%";
    document.getElementById("outputLocation").textContent = outputLocation;
    
    // Update summary actions for PDF results
    const summaryActions = document.querySelector(".summary-actions");
    summaryActions.innerHTML = `
        <button class="btn btn-primary" id="downloadAllPdfBtn">
            <i class="fas fa-download"></i> Download All PDF Results
        </button>
        <button class="btn btn-secondary" id="viewPdfFolderBtn">
            <i class="fas fa-folder-open"></i> Open PDF Results Folder
        </button>
        <button class="btn btn-info" id="emailResultsBtn">
            <i class="fas fa-envelope"></i> Email Results to Students
        </button>
    `;
    
    // Add event listeners for new buttons
    document.getElementById("downloadAllPdfBtn").addEventListener("click", downloadAllPdfResults);
    document.getElementById("viewPdfFolderBtn").addEventListener("click", viewPdfFolder);
    document.getElementById("emailResultsBtn").addEventListener("click", emailResultsToStudents);
    
    showSuccess(`Successfully generated ${generatedCount} PDF results in folder: ${currentClass.name}`);
}

// Download all PDF results
function downloadAllPdfResults() {
    const folderName = currentClass.name.replace(/\s+/g, "_");
    const semester = currentClass.semester.replace(/\s+/g, "_");
    const academicYear = currentClass.academicYear.replace(/\s+/g, "_");
    
    showInfo(`Preparing download for ${currentResults.length} PDF files from folder: ${folderName}`);
    
    // Call backend API to download zip file
    const downloadUrl = `/api/results/download/${currentClass.id}/${encodeURIComponent(currentClass.semester)}/${encodeURIComponent(currentClass.academicYear)}`;
    
    // Create download link
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = `${folderName}_${semester}_${academicYear}_results.zip`;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    showSuccess(`Download started for ${currentResults.length} PDF files`);
}

// View PDF folder
function viewPdfFolder() {
    const folderPath = `Results/${currentClass.name}/${currentClass.semester}`;
    
    showInfo(`Getting folder information: ${folderPath}`);
    
    // Call backend API to get folder information
    fetch(`/api/results/folder/${currentClass.id}/${encodeURIComponent(currentClass.semester)}/${encodeURIComponent(currentClass.academicYear)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
                return;
            }
            
            const folderContent = data.files.filter(file => file.endsWith(".pdf")).join("\n");
            const message = `Folder: ${data.folder_path}\n\nClass: ${data.class_name}\nSemester: ${data.semester}\nAcademic Year: ${data.academic_year}\n\nTotal Files: ${data.total_files}\nPDF Files: ${data.pdf_files}\n\nPDF Files:\n${folderContent}`;
            
            alert(message);
        })
        .catch(error => {
            console.error("Error getting folder information:", error);
            showError("Failed to get folder information");
        });
}

// Email results to students
function emailResultsToStudents() {
    if (currentResults.length === 0) {
        showError("No results to email.");
        return;
    }
    
    showInfo(`Preparing to email ${currentResults.length} results to students`);
    
    // Simulate email preparation
    setTimeout(() => {
        const emailCount = currentResults.length;
        showSuccess(`Email preparation completed for ${emailCount} students`);
        
        // Show email summary
        const emailSummary = currentResults.map(result => 
            `${result.studentName} (${result.studentId}) - ${result.overallGrade}`
        ).join("\n");
        
        alert(`Email Summary:\n\n${emailSummary}\n\nEmails will be sent to student email addresses.`);
    }, 1500);
}

// Utility functions
function showSuccess(message) {
    // Create success notification
    const notification = document.createElement("div");
    notification.className = "notification success";
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    showNotification(notification);
}

function showError(message) {
    // Create error notification
    const notification = document.createElement("div");
    notification.className = "notification error";
    notification.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;
    showNotification(notification);
}

function showInfo(message) {
    // Create info notification
    const notification = document.createElement("div");
    notification.className = "notification info";
    notification.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
    `;
    showNotification(notification);
}

function showNotification(notification) {
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease;
    `;
    
    if (notification.className.includes("success")) {
        notification.style.background = "#059669";
    } else if (notification.className.includes("error")) {
        notification.style.background = "#dc2626";
    } else {
        notification.style.background = "#3b82f6";
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 