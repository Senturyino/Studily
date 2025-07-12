// Classwork Page JavaScript
class ClassworkManager {
    constructor() {
        this.studentId = this.getStudentIdFromUrl();
        this.classworkData = [];
        this.filteredData = [];
        this.charts = {};
        this.currentView = "grid";
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadClassworkData();
        this.setupCharts();
    }

    getStudentIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("studentId") || localStorage.getItem("studentId") || "STUDENT001";
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById("statusFilter").addEventListener("change", this.applyFilters.bind(this));
        document.getElementById("subjectFilter").addEventListener("change", this.applyFilters.bind(this));
        document.getElementById("sortBy").addEventListener("change", this.applyFilters.bind(this));
        document.getElementById("applyFilters").addEventListener("click", this.applyFilters.bind(this));
        
        // View toggle
        document.getElementById("gridView").addEventListener("click", () => this.switchView("grid"));
        document.getElementById("listView").addEventListener("click", () => this.switchView("list"));
        
        // Table controls
        document.getElementById("refreshBtn").addEventListener("click", this.loadClassworkData.bind(this));
        document.getElementById("exportBtn").addEventListener("click", this.exportData.bind(this));
        document.getElementById("exportTableBtn").addEventListener("click", this.exportTableData.bind(this));
        
        // Modal
        document.querySelector(".close").addEventListener("click", this.closeAssignmentModal.bind(this));
        window.addEventListener("click", (event) => {
            if (event.target.classList.contains("modal")) {
                this.closeAssignmentModal();
            }
        });
    }

    async loadClassworkData() {
        this.showLoading(true);
        
        try {
            const response = await fetch(`http://localhost:3000/api/student/classwork/${this.studentId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.classworkData = data.classwork_records || [];
            this.filteredData = [...this.classworkData];
            
            this.updateStatistics(data.statistics);
            this.updateStudentInfo();
            this.populateSubjectFilter();
            this.renderAssignments();
            this.renderTable();
            this.updateCharts();
            
        } catch (error) {
            console.error("Error loading classwork data:", error);
            this.showError("Failed to load classwork data. Please try again.");
        } finally {
            this.showLoading(false);
        }
    }

    updateStatistics(stats) {
        document.getElementById("totalAssignments").textContent = stats.total_assignments || 0;
        document.getElementById("completedAssignments").textContent = stats.completed_assignments || 0;
        document.getElementById("pendingAssignments").textContent = stats.pending_assignments || 0;
        document.getElementById("averageScore").textContent = `${stats.average_score || 0}%`;
    }

    updateStudentInfo() {
        if (this.classworkData.length > 0) {
            const firstRecord = this.classworkData[0];
            document.getElementById("studentName").textContent = firstRecord.student_name || "Student";
            document.getElementById("studentClass").textContent = firstRecord.class_name || "Class";
        }
    }

    populateSubjectFilter() {
        const subjects = [...new Set(this.classworkData.map(item => item.subject_name))];
        const subjectFilter = document.getElementById("subjectFilter");
        
        // Clear existing options except "All Subjects"
        subjectFilter.innerHTML = "<option value=\"all\">All Subjects</option>";
        
        subjects.forEach(subject => {
            const option = document.createElement("option");
            option.value = subject;
            option.textContent = subject;
            subjectFilter.appendChild(option);
        });
    }

    renderAssignments() {
        const grid = document.getElementById("assignmentsGrid");
        
        if (this.filteredData.length === 0) {
            grid.innerHTML = "<div class=\"loading-card\"><p>No assignments found.</p></div>";
            return;
        }

        grid.innerHTML = this.filteredData.map(assignment => `
            <div class="assignment-card" onclick="classworkManager.showAssignmentDetails('${assignment.assignment_id}')">
                <div class="assignment-header">
                    <h4 class="assignment-title">${assignment.title}</h4>
                    <span class="assignment-status status-${assignment.status}">${assignment.status}</span>
                </div>
                <div class="assignment-subject">${assignment.subject_name}</div>
                <div class="assignment-details">
                    <div class="detail-item">
                        <span class="detail-label">Due Date</span>
                        <span class="detail-value">${this.formatDate(assignment.due_date)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total Marks</span>
                        <span class="detail-value">${assignment.total_marks}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Marks Obtained</span>
                        <span class="detail-value">${assignment.marks_obtained || "-"}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Percentage</span>
                        <span class="detail-value">${this.calculatePercentage(assignment.marks_obtained, assignment.total_marks)}%</span>
                    </div>
                </div>
                ${assignment.status === "graded" ? `
                <div class="assignment-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.calculatePercentage(assignment.marks_obtained, assignment.total_marks)}%"></div>
                    </div>
                    <div class="progress-text">${assignment.marks_obtained || 0} / ${assignment.total_marks} marks</div>
                </div>
                ` : ""}
            </div>
        `).join("");
    }

    renderTable() {
        const tbody = document.getElementById("assignmentsTableBody");
        
        if (this.filteredData.length === 0) {
            tbody.innerHTML = "<tr><td colspan=\"7\" class=\"loading\">No assignments found.</td></tr>";
            return;
        }

        tbody.innerHTML = this.filteredData.map(assignment => `
            <tr onclick="classworkManager.showAssignmentDetails('${assignment.assignment_id}')" style="cursor: pointer;">
                <td>${assignment.title}</td>
                <td>${assignment.subject_name}</td>
                <td>${this.formatDate(assignment.due_date)}</td>
                <td><span class="status-badge status-${assignment.status}">${assignment.status}</span></td>
                <td>${assignment.marks_obtained || "-"}</td>
                <td>${this.calculatePercentage(assignment.marks_obtained, assignment.total_marks)}%</td>
                <td>${assignment.feedback || "-"}</td>
            </tr>
        `).join("");
    }

    switchView(view) {
        this.currentView = view;
        
        // Update button states
        document.getElementById("gridView").classList.toggle("active", view === "grid");
        document.getElementById("listView").classList.toggle("active", view === "list");
        
        // Show/hide containers
        document.querySelector(".assignments-container").style.display = view === "grid" ? "block" : "none";
        document.querySelector(".table-container").style.display = view === "list" ? "block" : "none";
    }

    applyFilters() {
        const statusFilter = document.getElementById("statusFilter").value;
        const subjectFilter = document.getElementById("subjectFilter").value;
        const sortBy = document.getElementById("sortBy").value;

        this.filteredData = this.classworkData.filter(assignment => {
            // Status filter
            if (statusFilter !== "all" && assignment.status !== statusFilter) {
                return false;
            }

            // Subject filter
            if (subjectFilter !== "all" && assignment.subject_name !== subjectFilter) {
                return false;
            }

            return true;
        });

        // Sort data
        this.filteredData.sort((a, b) => {
            switch (sortBy) {
                case "due_date":
                    return new Date(a.due_date) - new Date(b.due_date);
                case "title":
                    return a.title.localeCompare(b.title);
                case "marks":
                    return (b.marks_obtained || 0) - (a.marks_obtained || 0);
                case "status":
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });

        this.renderAssignments();
        this.renderTable();
        this.updateCharts();
    }

    setupCharts() {
        // Performance by Subject Chart
        const subjectCtx = document.getElementById("subjectChart").getContext("2d");
        this.charts.subject = new Chart(subjectCtx, {
            type: "bar",
            data: {
                labels: [],
                datasets: [{
                    label: "Average Score (%)",
                    data: [],
                    backgroundColor: "rgba(102, 126, 234, 0.8)",
                    borderColor: "#667eea",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + "%";
                            }
                        }
                    }
                }
            }
        });

        // Status Distribution Chart
        const statusCtx = document.getElementById("statusChart").getContext("2d");
        this.charts.status = new Chart(statusCtx, {
            type: "doughnut",
            data: {
                labels: ["Graded", "Submitted", "Late", "Missing"],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        "#4CAF50",
                        "#2196F3",
                        "#ff9800",
                        "#f44336"
                    ],
                    borderWidth: 2,
                    borderColor: "#fff"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });
    }

    updateCharts() {
        if (this.filteredData.length === 0) return;

        // Update subject performance chart
        const subjectData = this.calculateSubjectPerformance();
        this.charts.subject.data.labels = subjectData.labels;
        this.charts.subject.data.datasets[0].data = subjectData.values;
        this.charts.subject.update();

        // Update status distribution chart
        const statusData = this.calculateStatusDistribution();
        this.charts.status.data.datasets[0].data = statusData;
        this.charts.status.update();
    }

    calculateSubjectPerformance() {
        const subjectStats = {};
        
        this.filteredData.forEach(assignment => {
            if (assignment.status === "graded" && assignment.marks_obtained !== null) {
                if (!subjectStats[assignment.subject_name]) {
                    subjectStats[assignment.subject_name] = { total: 0, count: 0 };
                }
                subjectStats[assignment.subject_name].total += parseFloat(assignment.marks_obtained);
                subjectStats[assignment.subject_name].count++;
            }
        });

        const labels = Object.keys(subjectStats);
        const values = labels.map(subject => {
            const stats = subjectStats[subject];
            return Math.round((stats.total / stats.count / parseFloat(this.filteredData.find(a => a.subject_name === subject)?.total_marks || 1)) * 100);
        });

        return { labels, values };
    }

    calculateStatusDistribution() {
        const statusCounts = {
            graded: 0,
            submitted: 0,
            late: 0,
            missing: 0
        };

        this.filteredData.forEach(assignment => {
            statusCounts[assignment.status]++;
        });

        return [
            statusCounts.graded,
            statusCounts.submitted,
            statusCounts.late,
            statusCounts.missing
        ];
    }

    showAssignmentDetails(assignmentId) {
        const assignment = this.classworkData.find(a => a.assignment_id === assignmentId);
        if (!assignment) return;

        // Populate modal
        document.getElementById("modalTitle").textContent = assignment.title;
        document.getElementById("modalTitleText").textContent = assignment.title;
        document.getElementById("modalSubject").textContent = assignment.subject_name;
        document.getElementById("modalDescription").textContent = assignment.description || "No description available";
        document.getElementById("modalDueDate").textContent = this.formatDate(assignment.due_date);
        document.getElementById("modalStatus").textContent = assignment.status;
        document.getElementById("modalMarks").textContent = assignment.marks_obtained || "Not graded";
        document.getElementById("modalTotalMarks").textContent = assignment.total_marks;
        document.getElementById("modalPercentage").textContent = `${this.calculatePercentage(assignment.marks_obtained, assignment.total_marks)}%`;
        document.getElementById("modalFeedback").textContent = assignment.feedback || "No feedback available";

        // Show modal
        document.getElementById("assignmentModal").style.display = "block";
    }

    closeAssignmentModal() {
        document.getElementById("assignmentModal").style.display = "none";
    }

    exportData() {
        if (this.filteredData.length === 0) {
            this.showError("No data to export.");
            return;
        }

        const csvContent = this.convertToCSV(this.filteredData);
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `classwork_records_${this.studentId}_${this.formatDate(new Date())}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    exportTableData() {
        this.exportData(); // Same functionality for now
    }

    convertToCSV(data) {
        const headers = ["Title", "Subject", "Due Date", "Status", "Marks Obtained", "Total Marks", "Percentage", "Feedback"];
        const csvRows = [headers.join(",")];
        
        data.forEach(assignment => {
            const row = [
                assignment.title,
                assignment.subject_name,
                this.formatDate(assignment.due_date),
                assignment.status,
                assignment.marks_obtained || "",
                assignment.total_marks,
                this.calculatePercentage(assignment.marks_obtained, assignment.total_marks),
                assignment.feedback || ""
            ].map(field => `"${field}"`).join(",");
            csvRows.push(row);
        });
        
        return csvRows.join("\n");
    }

    calculatePercentage(obtained, total) {
        if (!obtained || !total) return 0;
        return Math.round((parseFloat(obtained) / parseFloat(total)) * 100);
    }

    formatDate(dateString) {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    showLoading(show) {
        const overlay = document.getElementById("loadingOverlay");
        overlay.style.display = show ? "flex" : "none";
    }

    showError(message) {
        document.getElementById("errorMessage").textContent = message;
        document.getElementById("errorModal").style.display = "block";
    }

    closeErrorModal() {
        document.getElementById("errorModal").style.display = "none";
    }
}

// Global functions for modal interactions
function closeAssignmentModal() {
    classworkManager.closeAssignmentModal();
}

function closeErrorModal() {
    document.getElementById("errorModal").style.display = "none";
}

// Initialize the classwork manager when the page loads
let classworkManager;
document.addEventListener("DOMContentLoaded", () => {
    classworkManager = new ClassworkManager();
}); 