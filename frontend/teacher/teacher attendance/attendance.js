// ========================================
// TEACHER ATTENDANCE MANAGEMENT
// ========================================

// Global Variables
let currentClass = null;
let currentDate = null;
let students = [];
let attendanceData = {};
let currentStudentIndex = null;

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    initializePage();
    setupEventListeners();
    setDefaultDate();
});

// Initialize page
function initializePage() {
    updateOverviewStats();
    setupSearchAndFilter();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById("studentSearch").addEventListener("input", filterStudents);
    
    // Status filter
    document.getElementById("statusFilter").addEventListener("change", filterStudents);
    
    // Date change
    document.getElementById("dateSelect").addEventListener("change", function() {
        currentDate = this.value;
        loadAttendanceData();
    });
    

}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("dateSelect").value = today;
    currentDate = today;
}

// Load class students
function loadClassStudents() {
    const classSelect = document.getElementById("classSelect");
    const selectedClass = classSelect.value;
    
    if (!selectedClass) {
        students = [];
        renderAttendanceTable();
        return;
    }
    
    currentClass = selectedClass;
    // TODO: Load students from database for the selected class
    students = [];
    
    // Load attendance data for the selected class and date
    loadAttendanceData();
    
    // Update class name in reports
    document.getElementById("reportClass").textContent = classSelect.options[classSelect.selectedIndex].text;
    
    // Update overview stats
    updateOverviewStats();
}

// Load attendance data
function loadAttendanceData() {
    if (!currentClass || !currentDate) return;
    
    // In a real application, this would fetch from the server
    // For now, we'll use the sample data
    attendanceData = students.map(student => ({
        ...student,
        // Randomize some attendance for demo
        status: student.status || (Math.random() > 0.2 ? "present" : "absent"),
        time: student.time || (student.status === "present" ? generateRandomTime() : ""),
        notes: student.notes || "",
        date: currentDate
    }));
    
    renderAttendanceTable();
    updateReportStats();
}

// Generate random time for demo
function generateRandomTime() {
    const hour = 8;
    const minute = Math.floor(Math.random() * 30);
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

// Render attendance table
function renderAttendanceTable() {
    const tbody = document.getElementById("attendanceTableBody");
    tbody.innerHTML = "";
    
    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <p>Please select a class to view students</p>
                </td>
            </tr>
        `;
        return;
    }
    
    students.forEach((student, index) => {
        const row = document.createElement("tr");
        row.className = "fade-in";
        
        const statusClass = `status-${student.status || "unmarked"}`;
        const statusText = student.status || "Unmarked";
        
        row.innerHTML = `
            <td>${student.rollNo}</td>
            <td>${student.name}</td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>${student.time || "-"}</td>
            <td>${student.notes || "-"}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-edit" onclick="editAttendance(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteAttendance(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Filter students
function filterStudents() {
    const searchTerm = document.getElementById("studentSearch").value.toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;
    
    const rows = document.querySelectorAll("#attendanceTableBody tr");
    
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const status = row.cells[2].textContent.toLowerCase();
        
        const matchesSearch = name.includes(searchTerm);
        const matchesStatus = !statusFilter || status.includes(statusFilter);
        
        row.style.display = matchesSearch && matchesStatus ? "" : "none";
    });
}

// Edit attendance
function editAttendance(index) {
    currentStudentIndex = index;
    const student = students[index];
    
    // Populate modal
    document.getElementById("modalStudentName").textContent = student.name;
    document.getElementById("modalStudentRoll").textContent = student.rollNo;
    document.getElementById("modalStudentClass").textContent = document.getElementById("classSelect").options[document.getElementById("classSelect").selectedIndex].text;
    document.getElementById("modalStatus").value = student.status || "present";
    document.getElementById("modalTime").value = student.time || "";
    document.getElementById("modalNotes").value = student.notes || "";
    
    // Show modal
    document.getElementById("attendanceModal").style.display = "block";
}

// Save attendance detail
function saveAttendanceDetail() {
    if (currentStudentIndex === null) return;
    
    const status = document.getElementById("modalStatus").value;
    const time = document.getElementById("modalTime").value;
    const notes = document.getElementById("modalNotes").value;
    
    students[currentStudentIndex] = {
        ...students[currentStudentIndex],
        status: status,
        time: time,
        notes: notes
    };
    
    renderAttendanceTable();
    updateOverviewStats();
    updateReportStats();
    closeAttendanceModal();
    
    showMessage("Attendance updated successfully!", "success");
}

// Close attendance modal
function closeAttendanceModal() {
    document.getElementById("attendanceModal").style.display = "none";
    currentStudentIndex = null;
}

// Delete attendance
function deleteAttendance(index) {
    if (confirm("Are you sure you want to delete this attendance record?")) {
        students[index] = {
            ...students[index],
            status: "unmarked",
            time: "",
            notes: ""
        };
        
        renderAttendanceTable();
        updateOverviewStats();
        updateReportStats();
        
        showMessage("Attendance record cleared!", "warning");
    }
}

// Bulk actions
function markAllPresent() {
    if (students.length === 0) {
        showMessage("Please select a class first!", "error");
        return;
    }
    
    students.forEach(student => {
        student.status = "present";
        student.time = student.time || generateRandomTime();
    });
    
    renderAttendanceTable();
    updateOverviewStats();
    updateReportStats();
    
    showMessage("All students marked as present!", "success");
}

function markAllAbsent() {
    if (students.length === 0) {
        showMessage("Please select a class first!", "error");
        return;
    }
    
    students.forEach(student => {
        student.status = "absent";
        student.time = "";
    });
    
    renderAttendanceTable();
    updateOverviewStats();
    updateReportStats();
    
    showMessage("All students marked as absent!", "warning");
}

function clearAllAttendance() {
    if (students.length === 0) {
        showMessage("Please select a class first!", "error");
        return;
    }
    
    if (confirm("Are you sure you want to clear all attendance records?")) {
        students.forEach(student => {
            student.status = "unmarked";
            student.time = "";
            student.notes = "";
        });
        
        renderAttendanceTable();
        updateOverviewStats();
        updateReportStats();
        
        showMessage("All attendance records cleared!", "warning");
    }
}

// Save attendance
function saveAttendance() {
    if (students.length === 0) {
        showMessage("Please select a class first!", "error");
        return;
    }
    
    // Simulate saving to server
    const saveButton = document.querySelector("button[onclick=\"saveAttendance()\"]");
    const originalText = saveButton.innerHTML;
    
    saveButton.innerHTML = "<i class=\"fas fa-spinner fa-spin\"></i> Saving...";
    saveButton.disabled = true;
    
    setTimeout(() => {
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
        showMessage("Attendance saved successfully!", "success");
        
        // In a real application, this would send data to the server
        console.log("Saving attendance data:", {
            class: currentClass,
            date: currentDate,
            students: students
        });
    }, 1500);
}

// Update overview statistics
function updateOverviewStats() {
    const total = students.length;
    const present = students.filter(s => s.status === "present").length;
    const absent = students.filter(s => s.status === "absent").length;
    const late = students.filter(s => s.status === "late").length;
    const excused = students.filter(s => s.status === "excused").length;
    const unmarked = students.filter(s => !s.status || s.status === "unmarked").length;
    
    const rate = total > 0 ? ((present + late + excused) / total * 100).toFixed(1) : 0;
    
    document.getElementById("totalStudents").textContent = total;
    document.getElementById("presentToday").textContent = present + late + excused;
    document.getElementById("absentToday").textContent = absent + unmarked;
    document.getElementById("attendanceRate").textContent = rate + "%";
}

// Update report statistics
function updateReportStats() {
    const total = students.length;
    const present = students.filter(s => s.status === "present").length;
    const absent = students.filter(s => s.status === "absent").length;
    const late = students.filter(s => s.status === "late").length;
    const excused = students.filter(s => s.status === "excused").length;
    const rate = total > 0 ? ((present + late + excused) / total * 100).toFixed(1) : 0;
    
    document.getElementById("reportTotal").textContent = total;
    document.getElementById("reportPresent").textContent = present;
    document.getElementById("reportAbsent").textContent = absent;
    document.getElementById("reportLate").textContent = late;
    document.getElementById("reportRate").textContent = rate + "%";
    
    // Update report date
    const dateElement = document.getElementById("reportDate");
    if (currentDate) {
        const date = new Date(currentDate);
        dateElement.textContent = date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }
}

// Setup search and filter
function setupSearchAndFilter() {
    // Search functionality is already set up in setupEventListeners
    // This function can be used for additional search/filter setup
}

// Export attendance report
function exportAttendanceReport() {
    if (students.length === 0) {
        showMessage("No data to export!", "error");
        return;
    }
    
    const data = {
        class: document.getElementById("classSelect").options[document.getElementById("classSelect").selectedIndex].text,
        date: currentDate,
        students: students
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_report_${currentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showMessage("Report exported successfully!", "success");
}

// Print attendance report
function printAttendanceReport() {
    if (students.length === 0) {
        showMessage("No data to print!", "error");
        return;
    }
    
    window.print();
}

// Generate full attendance report
function generateAttendanceReport() {
    if (students.length === 0) {
        showMessage("No data to generate report!", "error");
        return;
    }
    
    // Simulate report generation
    const reportButton = document.querySelector("button[onclick=\"generateAttendanceReport()\"]");
    const originalText = reportButton.innerHTML;
    
    reportButton.innerHTML = "<i class=\"fas fa-spinner fa-spin\"></i> Generating...";
    reportButton.disabled = true;
    
    setTimeout(() => {
        reportButton.innerHTML = originalText;
        reportButton.disabled = false;
        
        // In a real application, this would generate a comprehensive report
        const report = {
            summary: {
                totalStudents: students.length,
                present: students.filter(s => s.status === "present").length,
                absent: students.filter(s => s.status === "absent").length,
                late: students.filter(s => s.status === "late").length,
                excused: students.filter(s => s.status === "excused").length,
                attendanceRate: ((students.filter(s => ["present", "late", "excused"].includes(s.status)).length / students.length) * 100).toFixed(1)
            },
            details: students,
            metadata: {
                class: document.getElementById("classSelect").options[document.getElementById("classSelect").selectedIndex].text,
                date: currentDate,
                generatedAt: new Date().toISOString()
            }
        };
        
        console.log("Generated report:", report);
        showMessage("Full report generated successfully!", "success");
    }, 2000);
}

// Show message
function showMessage(message, type = "success") {
    // Remove existing messages
    const existingMessages = document.querySelectorAll(".message");
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement("div");
    messageDiv.className = `message message-${type}`;
    
    const icon = type === "success" ? "fas fa-check-circle" : 
                 type === "error" ? "fas fa-exclamation-circle" : 
                 "fas fa-exclamation-triangle";
    
    messageDiv.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    // Insert at the top of the content container
    const contentContainer = document.querySelector(".content-container");
    contentContainer.insertBefore(messageDiv, contentContainer.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById("attendanceModal");
    if (event.target === modal) {
        closeAttendanceModal();
    }
};

// Keyboard shortcuts
document.addEventListener("keydown", function(event) {
    // Ctrl/Cmd + S to save
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        saveAttendance();
    }
    
    // Escape to close modal
    if (event.key === "Escape") {
        closeAttendanceModal();
    }
});

// Sidebar toggle functionality
document.querySelector(".sidebar-toggle").addEventListener("click", function() {
    document.querySelector(".sidebar-container").classList.toggle("sidebar-collapsed");
}); 