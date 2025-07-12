// ========================================
// STUDENT RESULTS JAVASCRIPT
// ========================================

// Global variables
let studentResults = [];
let filteredResults = [];
let currentStudentId = "STU001"; // This should come from login session
let currentPdfFile = null;

// API Base URL
const API_BASE_URL = "http://localhost:3000/api";

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    loadStudentInfo();
    loadStudentResults();
    setupEventListeners();
});

// ========================================
// DATA LOADING
// ========================================

async function loadStudentInfo() {
    try {
        // In a real application, this would come from the login session
        // For now, we'll use mock data
        const studentInfo = {
            name: "John Doe",
            id: currentStudentId,
            class: "Class 10A"
        };
        
        updateStudentInfo(studentInfo);
    } catch (error) {
        console.error("Error loading student info:", error);
        showError("Failed to load student information.");
    }
}

async function loadStudentResults() {
    try {
        showLoadingState();
        
        const response = await fetch(`${API_BASE_URL}/results/student/${currentStudentId}`);
        if (!response.ok) {
            throw new Error("Failed to load results");
        }
        
        const data = await response.json();
        studentResults = data.results || [];
        filteredResults = [...studentResults];
        
        updateResultsDisplay();
        updateStudentStats();
        updateAcademicSummary();
        
    } catch (error) {
        console.error("Error loading results:", error);
        showEmptyState();
    }
}

// ========================================
// UI UPDATES
// ========================================

function updateStudentInfo(studentInfo) {
    document.getElementById("studentName").textContent = studentInfo.name;
    document.getElementById("studentId").textContent = `Student ID: ${studentInfo.id}`;
    document.getElementById("studentClass").textContent = `Class: ${studentInfo.class}`;
}

function updateStudentStats() {
    document.getElementById("totalResults").textContent = studentResults.length;
    
    if (studentResults.length > 0) {
        const latestResult = studentResults[0]; // Results are sorted by date desc
        const uploadDate = new Date(latestResult.upload_date).toLocaleDateString();
        document.getElementById("latestUpload").textContent = uploadDate;
    } else {
        document.getElementById("latestUpload").textContent = "-";
    }
}

function updateAcademicSummary() {
    if (studentResults.length === 0) {
        document.getElementById("bestPerformance").textContent = "No data available";
        document.getElementById("progressTrend").textContent = "No data available";
        document.getElementById("latestResult").textContent = "No data available";
        return;
    }
    
    // Mock academic summary - in real app, this would be calculated from actual grades
    document.getElementById("bestPerformance").textContent = "Second Semester 2024";
    document.getElementById("progressTrend").textContent = "Improving";
    document.getElementById("latestResult").textContent = studentResults[0].semester;
}

function updateResultsDisplay() {
    const resultsList = document.getElementById("resultsList");
    const loadingState = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    
    // Hide loading state
    loadingState.style.display = "none";
    
    if (filteredResults.length === 0) {
        emptyState.style.display = "block";
        resultsList.style.display = "none";
        return;
    }
    
    emptyState.style.display = "none";
    resultsList.style.display = "block";
    
    // Clear existing results
    resultsList.innerHTML = "";
    
    // Display filtered results
    filteredResults.forEach(result => {
        const resultItem = createResultItem(result);
        resultsList.appendChild(resultItem);
    });
}

function createResultItem(result) {
    const resultItem = document.createElement("div");
    resultItem.className = "result-item";
    
    const uploadDate = new Date(result.upload_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    
    resultItem.innerHTML = `
        <div class="result-header">
            <h3 class="result-title">${result.semester} - ${result.class_name || result.class_id}</h3>
            <span class="result-date">${uploadDate}</span>
        </div>
        <div class="result-details">
            <div class="detail-item">
                <span class="detail-label">Semester</span>
                <span class="detail-value">${result.semester}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Class</span>
                <span class="detail-value">${result.class_name || result.class_id}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Upload Date</span>
                <span class="detail-value">${uploadDate}</span>
            </div>
        </div>
        <div class="result-actions">
            <button class="btn btn-primary" onclick="viewPdf('${result.pdf_path}', '${result.semester} - ${result.class_name || result.class_id}')">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="btn btn-outline" onclick="downloadPdf('${result.pdf_path}', '${result.semester}_${result.class_id}')">
                <i class="fas fa-download"></i> Download
            </button>
        </div>
    `;
    
    return resultItem;
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Filter controls
    const semesterFilter = document.getElementById("semesterFilter");
    const yearFilter = document.getElementById("yearFilter");
    const clearFiltersBtn = document.getElementById("clearFilters");
    
    semesterFilter.addEventListener("change", filterResults);
    yearFilter.addEventListener("change", filterResults);
    clearFiltersBtn.addEventListener("click", clearFilters);
    
    // Quick action buttons
    const downloadAllBtn = document.getElementById("downloadAllBtn");
    const printResultsBtn = document.getElementById("printResultsBtn");
    const shareResultsBtn = document.getElementById("shareResultsBtn");
    
    downloadAllBtn.addEventListener("click", downloadAllResults);
    printResultsBtn.addEventListener("click", printResults);
    shareResultsBtn.addEventListener("click", shareResults);
    
    // PDF modal controls
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");
    const printPdfBtn = document.getElementById("printPdfBtn");
    const sharePdfBtn = document.getElementById("sharePdfBtn");
    
    downloadPdfBtn.addEventListener("click", () => {
        if (currentPdfFile) {
            downloadPdf(currentPdfFile, "result");
        }
    });
    
    printPdfBtn.addEventListener("click", printCurrentPdf);
    sharePdfBtn.addEventListener("click", shareCurrentPdf);
}

// ========================================
// FILTERING
// ========================================

function filterResults() {
    const semesterFilter = document.getElementById("semesterFilter").value;
    const yearFilter = document.getElementById("yearFilter").value;
    
    filteredResults = studentResults.filter(result => {
        const matchesSemester = !semesterFilter || result.semester === semesterFilter;
        const matchesYear = !yearFilter || result.upload_date.includes(yearFilter.split("-")[0]);
        
        return matchesSemester && matchesYear;
    });
    
    updateResultsDisplay();
}

function clearFilters() {
    document.getElementById("semesterFilter").value = "";
    document.getElementById("yearFilter").value = "";
    filteredResults = [...studentResults];
    updateResultsDisplay();
}

// ========================================
// PDF HANDLING
// ========================================

function viewPdf(filename, title) {
    currentPdfFile = filename;
    
    const modal = document.getElementById("pdfModal");
    const modalTitle = document.getElementById("pdfModalTitle");
    const pdfViewer = document.getElementById("pdfViewer");
    
    modalTitle.textContent = title;
    pdfViewer.src = `${API_BASE_URL}/results/file/${filename}`;
    
    modal.style.display = "block";
}

function downloadPdf(filename, customName = null) {
    const link = document.createElement("a");
    link.href = `${API_BASE_URL}/results/file/${filename}`;
    link.download = customName || filename;
    link.target = "_blank";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function printCurrentPdf() {
    if (currentPdfFile) {
        const printWindow = window.open(`${API_BASE_URL}/results/file/${currentPdfFile}`, "_blank");
        printWindow.onload = function() {
            printWindow.print();
        };
    }
}

function shareCurrentPdf() {
    if (currentPdfFile && navigator.share) {
        navigator.share({
            title: "My Academic Result",
            url: `${API_BASE_URL}/results/file/${currentPdfFile}`
        });
    } else {
        // Fallback: copy link to clipboard
        const url = `${API_BASE_URL}/results/file/${currentPdfFile}`;
        navigator.clipboard.writeText(url).then(() => {
            showSuccess("Link copied to clipboard!");
        });
    }
}

// ========================================
// QUICK ACTIONS
// ========================================

function downloadAllResults() {
    if (filteredResults.length === 0) {
        showError("No results to download.");
        return;
    }
    
    // In a real implementation, you would create a ZIP file on the server
    // For now, we'll download them one by one
    filteredResults.forEach((result, index) => {
        setTimeout(() => {
            downloadPdf(result.pdf_path, `${result.semester}_${result.class_id}_${index + 1}`);
        }, index * 1000); // Stagger downloads by 1 second
    });
    
    showSuccess("Starting download of all results...");
}

function printResults() {
    if (filteredResults.length === 0) {
        showError("No results to print.");
        return;
    }
    
    // Create a printable version of the results page
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
            <head>
                <title>Academic Results - ${document.getElementById("studentName").textContent}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .result-item { border: 1px solid #ccc; margin: 10px 0; padding: 15px; }
                    .result-title { font-weight: bold; color: #333; }
                    .result-details { margin: 10px 0; }
                    .detail-item { margin: 5px 0; }
                    .detail-label { font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>Academic Results</h1>
                <h2>${document.getElementById("studentName").textContent}</h2>
                <p>${document.getElementById("studentId").textContent}</p>
                <p>${document.getElementById("studentClass").textContent}</p>
                <hr>
                ${Array.from(document.querySelectorAll(".result-item")).map(item => item.outerHTML).join("")}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function shareResults() {
    if (filteredResults.length === 0) {
        showError("No results to share.");
        return;
    }
    
    const shareData = {
        title: "My Academic Results",
        text: `Academic results for ${document.getElementById("studentName").textContent}`,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        // Fallback: copy link to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showSuccess("Results page link copied to clipboard!");
        });
    }
}

// ========================================
// MODAL HANDLING
// ========================================

function closePdfModal() {
    const modal = document.getElementById("pdfModal");
    const pdfViewer = document.getElementById("pdfViewer");
    
    pdfViewer.src = "";
    modal.style.display = "none";
    currentPdfFile = null;
}

function closeErrorModal() {
    document.getElementById("errorModal").style.display = "none";
}

// Close modal when clicking outside
window.addEventListener("click", function(event) {
    const modals = document.querySelectorAll(".modal");
    modals.forEach(modal => {
        if (event.target === modal) {
            if (modal.id === "pdfModal") {
                closePdfModal();
            } else {
                modal.style.display = "none";
            }
        }
    });
});

// ========================================
// STATE MANAGEMENT
// ========================================

function showLoadingState() {
    document.getElementById("loadingState").style.display = "block";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("resultsList").style.display = "none";
}

function showEmptyState() {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("emptyState").style.display = "block";
    document.getElementById("resultsList").style.display = "none";
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function showError(message) {
    const modal = document.getElementById("errorModal");
    const errorMessage = document.getElementById("errorMessage");
    
    errorMessage.textContent = message;
    modal.style.display = "block";
}

function showSuccess(message) {
    // Create a simple success notification
    const notification = document.createElement("div");
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add CSS animation for notifications
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
`;
document.head.appendChild(style); 