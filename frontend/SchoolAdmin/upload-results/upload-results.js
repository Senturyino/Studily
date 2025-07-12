// ========================================
// UPLOAD RESULTS JAVASCRIPT
// ========================================

// Global variables
let selectedFiles = [];
let classes = [];
let currentUploadProgress = 0;

// API Base URL
const API_BASE_URL = "http://localhost:3000/api";

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    loadClasses();
    setupEventListeners();
});

// ========================================
// DATA LOADING
// ========================================

async function loadClasses() {
    try {
        const response = await fetch(`${API_BASE_URL}/classes`);
        if (!response.ok) {
            throw new Error("Failed to load classes");
        }
        
        classes = await response.json();
        populateClassSelect();
    } catch (error) {
        console.error("Error loading classes:", error);
        showError("Failed to load classes. Please refresh the page.");
    }
}

function populateClassSelect() {
    const classSelect = document.getElementById("classSelect");
    classSelect.innerHTML = "<option value=\"\">Choose a class...</option>";
    
    classes.forEach(cls => {
        const option = document.createElement("option");
        option.value = cls.class_id;
        option.textContent = cls.class_name;
        classSelect.appendChild(option);
    });
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // File upload area click
    const fileUploadArea = document.getElementById("fileUploadArea");
    const pdfFolderInput = document.getElementById("pdfFolder");
    
    fileUploadArea.addEventListener("click", () => {
        pdfFolderInput.click();
    });
    
    // File selection
    pdfFolderInput.addEventListener("change", handleFileSelection);
    
    // Form submission
    const uploadForm = document.getElementById("uploadForm");
    uploadForm.addEventListener("submit", handleFormSubmission);
    
    // Clear button
    const clearBtn = document.getElementById("clearBtn");
    clearBtn.addEventListener("click", clearForm);
    
    // Modal close buttons
    document.addEventListener("click", function(event) {
        if (event.target.classList.contains("close")) {
            closeAllModals();
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener("click", function(event) {
        const modals = document.querySelectorAll(".modal");
        modals.forEach(modal => {
            if (event.target === modal) {
                closeAllModals();
            }
        });
    });
}

// ========================================
// FILE HANDLING
// ========================================

function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    
    // Filter only PDF files
    const pdfFiles = files.filter(file => file.type === "application/pdf");
    
    if (pdfFiles.length === 0) {
        showError("No PDF files found in the selected folder.");
        return;
    }
    
    selectedFiles = pdfFiles;
    displayFileList();
    updateUploadButton();
}

function displayFileList() {
    const fileList = document.getElementById("fileList");
    const fileItems = document.getElementById("fileItems");
    
    if (selectedFiles.length === 0) {
        fileList.style.display = "none";
        return;
    }
    
    fileItems.innerHTML = "";
    
    selectedFiles.forEach(file => {
        const fileItem = document.createElement("div");
        fileItem.className = "file-item";
        
        const fileIcon = document.createElement("i");
        fileIcon.className = "fas fa-file-pdf file-icon";
        
        const fileName = document.createElement("span");
        fileName.className = "file-name";
        fileName.textContent = file.name;
        
        const fileSize = document.createElement("span");
        fileSize.className = "file-size";
        fileSize.textContent = formatFileSize(file.size);
        
        fileItem.appendChild(fileIcon);
        fileItem.appendChild(fileName);
        fileItem.appendChild(fileSize);
        fileItems.appendChild(fileItem);
    });
    
    fileList.style.display = "block";
}

function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function updateUploadButton() {
    const uploadBtn = document.getElementById("uploadBtn");
    const isFormValid = isFormComplete();
    
    uploadBtn.disabled = !isFormValid;
    uploadBtn.style.opacity = isFormValid ? "1" : "0.6";
}

function isFormComplete() {
    const classSelect = document.getElementById("classSelect");
    const semesterSelect = document.getElementById("semesterSelect");
    const academicYearSelect = document.getElementById("academicYear");
    
    return classSelect.value && 
           semesterSelect.value && 
           academicYearSelect.value && 
           selectedFiles.length > 0;
}

// ========================================
// FORM HANDLING
// ========================================

async function handleFormSubmission(event) {
    event.preventDefault();
    
    if (!isFormComplete()) {
        showError("Please fill in all required fields and select PDF files.");
        return;
    }
    
    const formData = new FormData();
    const classId = document.getElementById("classSelect").value;
    const semester = document.getElementById("semesterSelect").value;
    const academicYear = document.getElementById("academicYear").value;
    
    // Add form data
    formData.append("class_id", classId);
    formData.append("semester", semester);
    formData.append("academic_year", academicYear);
    
    // Add files
    selectedFiles.forEach(file => {
        formData.append("pdfs", file);
    });
    
    // Show progress
    showUploadProgress();
    
    try {
        const response = await fetch(`${API_BASE_URL}/results/upload`, {
            method: "POST",
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Upload failed");
        }
        
        const result = await response.json();
        hideUploadProgress();
        showUploadResults(result);
        showSuccessModal(classId, semester, selectedFiles.length);
        
    } catch (error) {
        console.error("Upload error:", error);
        hideUploadProgress();
        showError(`Upload failed: ${error.message}`);
    }
}

function clearForm() {
    document.getElementById("uploadForm").reset();
    selectedFiles = [];
    displayFileList();
    updateUploadButton();
    hideUploadResults();
}

// ========================================
// PROGRESS HANDLING
// ========================================

function showUploadProgress() {
    const progressSection = document.getElementById("uploadProgress");
    progressSection.style.display = "block";
    
    // Simulate progress (in real implementation, you'd track actual progress)
    simulateProgress();
}

function simulateProgress() {
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }, 200);
}

function hideUploadProgress() {
    const progressSection = document.getElementById("uploadProgress");
    progressSection.style.display = "none";
    
    // Reset progress
    document.getElementById("progressFill").style.width = "0%";
    document.getElementById("progressText").textContent = "0%";
}

// ========================================
// RESULTS DISPLAY
// ========================================

function showUploadResults(result) {
    const resultsSection = document.getElementById("uploadResults");
    const totalFiles = document.getElementById("totalFiles");
    const successFiles = document.getElementById("successFiles");
    const failedFiles = document.getElementById("failedFiles");
    const resultsList = document.getElementById("resultsList");
    
    // Update summary
    totalFiles.textContent = result.results.length;
    const successful = result.results.filter(r => r.status === "success").length;
    const failed = result.results.length - successful;
    
    successFiles.textContent = successful;
    failedFiles.textContent = failed;
    
    // Update results list
    resultsList.innerHTML = "";
    result.results.forEach(item => {
        const resultItem = document.createElement("div");
        resultItem.className = `result-item ${item.status === "error" ? "error" : ""}`;
        
        const icon = document.createElement("i");
        icon.className = `fas ${item.status === "success" ? "fa-check-circle result-icon success" : "fa-times-circle result-icon error"}`;
        
        const details = document.createElement("div");
        details.className = "result-details";
        
        const studentName = document.createElement("div");
        studentName.className = "result-student";
        studentName.textContent = `Student ID: ${item.student_id}`;
        
        const filename = document.createElement("div");
        filename.className = "result-filename";
        filename.textContent = `File: ${item.filename}`;
        
        details.appendChild(studentName);
        details.appendChild(filename);
        
        resultItem.appendChild(icon);
        resultItem.appendChild(details);
        resultsList.appendChild(resultItem);
    });
    
    resultsSection.style.display = "block";
}

function hideUploadResults() {
    const resultsSection = document.getElementById("uploadResults");
    resultsSection.style.display = "none";
}

// ========================================
// MODAL HANDLING
// ========================================

function showSuccessModal(classId, semester, fileCount) {
    const modal = document.getElementById("successModal");
    const modalClass = document.getElementById("modalClass");
    const modalSemester = document.getElementById("modalSemester");
    const modalFiles = document.getElementById("modalFiles");
    
    // Find class name
    const classInfo = classes.find(c => c.class_id === classId);
    modalClass.textContent = classInfo ? classInfo.class_name : classId;
    modalSemester.textContent = semester;
    modalFiles.textContent = fileCount;
    
    modal.style.display = "block";
}

function showErrorModal(message) {
    const modal = document.getElementById("errorModal");
    const errorMessage = document.getElementById("errorMessage");
    
    errorMessage.textContent = message;
    modal.style.display = "block";
}

function closeSuccessModal() {
    document.getElementById("successModal").style.display = "none";
}

function closeErrorModal() {
    document.getElementById("errorModal").style.display = "none";
}

function closeAllModals() {
    document.getElementById("successModal").style.display = "none";
    document.getElementById("errorModal").style.display = "none";
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function showError(message) {
    showErrorModal(message);
}

function showSuccess(message) {
    // You can implement a success notification here
    console.log("Success:", message);
}

// ========================================
// VALIDATION
// ========================================

function validateStudentIds() {
    const invalidFiles = [];
    
    selectedFiles.forEach(file => {
        const studentId = file.name.replace(".pdf", "");
        // Basic validation - you might want to check against actual student database
        if (!studentId || studentId.length < 3) {
            invalidFiles.push(file.name);
        }
    });
    
    if (invalidFiles.length > 0) {
        showError(`Invalid file names found: ${invalidFiles.join(", ")}. Files should be named with student IDs.`);
        return false;
    }
    
    return true;
}

// ========================================
// FORM VALIDATION LISTENERS
// ========================================

// Add real-time validation
document.addEventListener("DOMContentLoaded", function() {
    const formInputs = document.querySelectorAll("#uploadForm select, #uploadForm input");
    
    formInputs.forEach(input => {
        input.addEventListener("change", updateUploadButton);
        input.addEventListener("input", updateUploadButton);
    });
}); 