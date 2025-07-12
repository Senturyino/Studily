// Attendance Page JavaScript
class AttendanceManager {
    constructor() {
        this.studentId = this.getStudentIdFromUrl();
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.attendanceData = [];
        this.filteredData = [];
        this.charts = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAttendanceData();
        this.setupCharts();
    }

    getStudentIdFromUrl() {
        // Get student ID from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("studentId") || localStorage.getItem("studentId") || "STUDENT001";
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById("dateRange").addEventListener("change", this.handleDateRangeChange.bind(this));
        document.getElementById("statusFilter").addEventListener("change", this.handleStatusFilter.bind(this));
        document.getElementById("applyFilters").addEventListener("click", this.applyFilters.bind(this));
        
        // Table controls
        document.getElementById("refreshBtn").addEventListener("click", this.loadAttendanceData.bind(this));
        document.getElementById("exportBtn").addEventListener("click", this.exportData.bind(this));
        
        // Pagination
        document.getElementById("prevPage").addEventListener("click", () => this.changePage(-1));
        document.getElementById("nextPage").addEventListener("click", () => this.changePage(1));
        
        // Modal
        document.querySelector(".close").addEventListener("click", this.closeErrorModal.bind(this));
        window.addEventListener("click", (event) => {
            if (event.target.classList.contains("modal")) {
                this.closeErrorModal();
            }
        });
    }

    async loadAttendanceData() {
        this.showLoading(true);
        
        try {
            const response = await fetch(`http://localhost:3000/api/student/attendance/${this.studentId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.attendanceData = data.attendance_records || [];
            this.filteredData = [...this.attendanceData];
            
            this.updateStatistics(data.statistics);
            this.updateStudentInfo();
            this.renderTable();
            this.updateCharts();
            
        } catch (error) {
            console.error("Error loading attendance data:", error);
            this.showError("Failed to load attendance data. Please try again.");
        } finally {
            this.showLoading(false);
        }
    }

    updateStatistics(stats) {
        document.getElementById("presentDays").textContent = stats.present_days || 0;
        document.getElementById("absentDays").textContent = stats.absent_days || 0;
        document.getElementById("lateDays").textContent = stats.late_days || 0;
        document.getElementById("attendanceRate").textContent = `${stats.attendance_rate || 0}%`;
    }

    updateStudentInfo() {
        if (this.attendanceData.length > 0) {
            const firstRecord = this.attendanceData[0];
            document.getElementById("studentName").textContent = firstRecord.student_name || "Student";
            document.getElementById("studentClass").textContent = firstRecord.class_name || "Class";
        }
    }

    renderTable() {
        const tbody = document.getElementById("attendanceTableBody");
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        if (pageData.length === 0) {
            tbody.innerHTML = "<tr><td colspan=\"5\" class=\"loading\">No attendance records found.</td></tr>";
            return;
        }

        tbody.innerHTML = pageData.map(record => `
            <tr>
                <td>${this.formatDate(record.date)}</td>
                <td><span class="status-badge status-${record.status}">${record.status}</span></td>
                <td>${record.class_name}</td>
                <td>${record.reason || "-"}</td>
                <td>${record.recorded_by || "-"}</td>
            </tr>
        `).join("");

        this.updatePagination();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        const prevBtn = document.getElementById("prevPage");
        const nextBtn = document.getElementById("nextPage");
        const pageInfo = document.getElementById("pageInfo");

        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= totalPages;
        pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
    }

    changePage(direction) {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        const newPage = this.currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.renderTable();
        }
    }

    handleDateRangeChange(event) {
        const customDateFields = document.querySelectorAll(".custom-date");
        
        if (event.target.value === "custom") {
            customDateFields.forEach(field => field.style.display = "block");
        } else {
            customDateFields.forEach(field => field.style.display = "none");
        }
    }

    handleStatusFilter() {
        // This will be handled by applyFilters
    }

    applyFilters() {
        const dateRange = document.getElementById("dateRange").value;
        const statusFilter = document.getElementById("statusFilter").value;
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;

        this.filteredData = this.attendanceData.filter(record => {
            // Status filter
            if (statusFilter !== "all" && record.status !== statusFilter) {
                return false;
            }

            // Date range filter
            if (dateRange !== "all") {
                const recordDate = new Date(record.date);
                const today = new Date();
                
                switch (dateRange) {
                    case "month":
                        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                        if (recordDate < monthStart) return false;
                        break;
                    case "semester":
                        const semesterStart = new Date(today.getFullYear(), 8, 1); // September 1st
                        if (recordDate < semesterStart) return false;
                        break;
                    case "custom":
                        if (startDate && recordDate < new Date(startDate)) return false;
                        if (endDate && recordDate > new Date(endDate)) return false;
                        break;
                }
            }

            return true;
        });

        this.currentPage = 1;
        this.renderTable();
        this.updateCharts();
    }

    setupCharts() {
        // Attendance Trend Chart
        const trendCtx = document.getElementById("attendanceChart").getContext("2d");
        this.charts.trend = new Chart(trendCtx, {
            type: "line",
            data: {
                labels: [],
                datasets: [{
                    label: "Attendance Rate",
                    data: [],
                    borderColor: "#667eea",
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
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

        // Distribution Chart
        const distributionCtx = document.getElementById("distributionChart").getContext("2d");
        this.charts.distribution = new Chart(distributionCtx, {
            type: "doughnut",
            data: {
                labels: ["Present", "Absent", "Late", "Excused"],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        "#4CAF50",
                        "#f44336",
                        "#ff9800",
                        "#2196F3"
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

        // Update trend chart
        const trendData = this.calculateTrendData();
        this.charts.trend.data.labels = trendData.labels;
        this.charts.trend.data.datasets[0].data = trendData.values;
        this.charts.trend.update();

        // Update distribution chart
        const distributionData = this.calculateDistributionData();
        this.charts.distribution.data.datasets[0].data = distributionData;
        this.charts.distribution.update();
    }

    calculateTrendData() {
        // Group data by month and calculate attendance rate
        const monthlyData = {};
        
        this.filteredData.forEach(record => {
            const date = new Date(record.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { total: 0, present: 0 };
            }
            
            monthlyData[monthKey].total++;
            if (record.status === "present" || record.status === "late") {
                monthlyData[monthKey].present++;
            }
        });

        const labels = Object.keys(monthlyData).sort();
        const values = labels.map(month => {
            const data = monthlyData[month];
            return data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
        });

        return { labels, values };
    }

    calculateDistributionData() {
        const statusCounts = {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
        };

        this.filteredData.forEach(record => {
            statusCounts[record.status]++;
        });

        return [
            statusCounts.present,
            statusCounts.absent,
            statusCounts.late,
            statusCounts.excused
        ];
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
            link.setAttribute("download", `attendance_records_${this.studentId}_${this.formatDate(new Date())}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    convertToCSV(data) {
        const headers = ["Date", "Status", "Class", "Reason", "Recorded By"];
        const csvRows = [headers.join(",")];
        
        data.forEach(record => {
            const row = [
                this.formatDate(record.date),
                record.status,
                record.class_name,
                record.reason || "",
                record.recorded_by || ""
            ].map(field => `"${field}"`).join(",");
            csvRows.push(row);
        });
        
        return csvRows.join("\n");
    }

    formatDate(dateString) {
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

// Global function for modal close
function closeErrorModal() {
    document.getElementById("errorModal").style.display = "none";
}

// Initialize the attendance manager when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new AttendanceManager();
}); 