// Fees Page JavaScript
class FeesManager {
    constructor() {
        this.studentId = this.getStudentIdFromUrl();
        this.feesData = [];
        this.filteredData = [];
        this.charts = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFeesData();
    }

    getStudentIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("studentId") || localStorage.getItem("studentId") || "STUDENT001";
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById("statusFilter").addEventListener("change", this.applyFilters.bind(this));
        document.getElementById("sortBy").addEventListener("change", this.applyFilters.bind(this));
        document.getElementById("applyFilters").addEventListener("click", this.applyFilters.bind(this));
        
        // Export controls
        document.getElementById("refreshBtn").addEventListener("click", this.loadFeesData.bind(this));
        document.getElementById("exportBtn").addEventListener("click", this.exportData.bind(this));
        document.getElementById("exportTableBtn").addEventListener("click", this.exportTableData.bind(this));
        
        // Modal
        document.querySelector(".close").addEventListener("click", this.closeFeeModal.bind(this));
        window.addEventListener("click", (event) => {
            if (event.target.classList.contains("modal")) {
                this.closeFeeModal();
            }
        });
    }

    async loadFeesData() {
        this.showLoading(true);
        
        try {
            const response = await fetch(`http://localhost:3000/api/student/fees/${this.studentId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.feesData = data.fees_records || [];
            this.filteredData = [...this.feesData];
            
            this.updateSummary(data.statistics);
            this.updateStudentInfo();
            this.updateOverview(data.statistics);
            this.renderFeesList();
            this.renderTable();
            
        } catch (error) {
            console.error("Error loading school fees data:", error);
            this.showError("Failed to load school fees data. Please try again.");
        } finally {
            this.showLoading(false);
        }
    }

    updateSummary(stats) {
        document.getElementById("totalAmount").textContent = this.formatCurrency(stats.total_amount || 0);
        document.getElementById("totalPaid").textContent = this.formatCurrency(stats.total_paid || 0);
        document.getElementById("totalOutstanding").textContent = this.formatCurrency(stats.total_outstanding || 0);
        
        const progressPercentage = stats.total_amount > 0 ? 
            Math.round((parseFloat(stats.total_paid) / parseFloat(stats.total_amount)) * 100) : 0;
        document.getElementById("paymentProgress").textContent = `${progressPercentage}%`;
        
        // Update progress bar
        document.getElementById("progressFill").style.width = `${progressPercentage}%`;
        document.getElementById("progressText").textContent = 
            `${this.formatCurrency(stats.total_paid || 0)} / ${this.formatCurrency(stats.total_amount || 0)}`;
    }

    updateStudentInfo() {
        if (this.feesData.length > 0) {
            const firstRecord = this.feesData[0];
            document.getElementById("studentName").textContent = firstRecord.student_name || "Student";
            document.getElementById("studentClass").textContent = firstRecord.class_name || "Class";
        }
    }

    updateOverview(stats) {
        const totalAmount = parseFloat(stats.total_amount || 0);
        const totalPaid = parseFloat(stats.total_paid || 0);
        const totalOutstanding = parseFloat(stats.total_outstanding || 0);
        
        // Determine payment status
        let paymentStatus = "No Fees";
        let paymentStatusClass = "";
        
        if (totalAmount > 0) {
            if (totalPaid >= totalAmount) {
                paymentStatus = "Fully Paid";
                paymentStatusClass = "paid";
            } else if (totalPaid > 0) {
                paymentStatus = "Partially Paid";
                paymentStatusClass = "partial";
            } else {
                paymentStatus = "Unpaid";
                paymentStatusClass = "unpaid";
            }
        }
        
        // Determine if fully paid
        const fullyPaid = totalAmount > 0 ? (totalPaid >= totalAmount ? "Yes" : "No") : "N/A";
        const fullyPaidClass = totalAmount > 0 ? (totalPaid >= totalAmount ? "paid" : "unpaid") : "";
        
        // Update overview elements
        const paymentStatusElement = document.getElementById("paymentStatus");
        paymentStatusElement.textContent = paymentStatus;
        paymentStatusElement.className = `overview-value ${paymentStatusClass}`;
        
        const fullyPaidElement = document.getElementById("fullyPaidStatus");
        fullyPaidElement.textContent = fullyPaid;
        fullyPaidElement.className = `overview-value ${fullyPaidClass}`;
        
        const outstandingElement = document.getElementById("outstandingBalance");
        outstandingElement.textContent = this.formatCurrency(totalOutstanding);
        outstandingElement.className = `overview-value ${totalOutstanding > 0 ? "unpaid" : "paid"}`;
    }

    renderFeesList() {
        const list = document.getElementById("feesList");
        
        if (this.filteredData.length === 0) {
            list.innerHTML = "<div class=\"loading-card\"><p>No school fees records found.</p></div>";
            return;
        }

        list.innerHTML = this.filteredData.map(fee => `
            <div class="fee-card" onclick="feesManager.showFeeDetails('${fee.fee_id}')">
                <div class="fee-header">
                    <h4 class="fee-name">${fee.fee_name}</h4>
                    <span class="fee-status status-${fee.status}">${fee.status}</span>
                </div>
                <div class="fee-type">${fee.fee_type}</div>
                <div class="fee-amounts">
                    <div class="amount-item">
                        <span class="amount-label">Total Amount</span>
                        <span class="amount-value">${this.formatCurrency(fee.total_amount)}</span>
                    </div>
                    <div class="amount-item">
                        <span class="amount-label">Amount Paid</span>
                        <span class="amount-value paid">${this.formatCurrency(fee.amount_paid)}</span>
                    </div>
                    <div class="amount-item">
                        <span class="amount-label">Outstanding</span>
                        <span class="amount-value outstanding">${this.formatCurrency(fee.total_amount - fee.amount_paid)}</span>
                    </div>
                    <div class="amount-item">
                        <span class="amount-label">Due Date</span>
                        <span class="amount-value">${this.formatDate(fee.due_date)}</span>
                    </div>
                </div>
                <div class="fee-progress">
                    <div class="fee-progress-bar">
                        <div class="fee-progress-fill" style="width: ${this.calculatePaymentPercentage(fee.amount_paid, fee.total_amount)}%"></div>
                    </div>
                    <div class="fee-progress-text">${this.calculatePaymentPercentage(fee.amount_paid, fee.total_amount)}% paid</div>
                </div>
            </div>
        `).join("");
    }

    renderTable() {
        const tbody = document.getElementById("feesTableBody");
        
        if (this.filteredData.length === 0) {
            tbody.innerHTML = "<tr><td colspan=\"8\" class=\"loading\">No school fees records found.</td></tr>";
            return;
        }

        tbody.innerHTML = this.filteredData.map(fee => `
            <tr onclick="feesManager.showFeeDetails('${fee.fee_id}')" style="cursor: pointer;">
                <td>${fee.fee_name}</td>
                <td>${fee.fee_type}</td>
                <td>${this.formatCurrency(fee.total_amount)}</td>
                <td>${this.formatCurrency(fee.amount_paid)}</td>
                <td>${this.formatCurrency(fee.total_amount - fee.amount_paid)}</td>
                <td>${this.formatDate(fee.due_date)}</td>
                <td><span class="status-badge status-${fee.status}">${fee.status}</span></td>
                <td>${fee.payment_date ? this.formatDate(fee.payment_date) : "-"}</td>
            </tr>
        `).join("");
    }

    applyFilters() {
        const statusFilter = document.getElementById("statusFilter").value;
        const sortBy = document.getElementById("sortBy").value;

        this.filteredData = this.feesData.filter(fee => {
            // Status filter
            if (statusFilter !== "all" && fee.status !== statusFilter) {
                return false;
            }

            return true;
        });

        // Sort data
        this.filteredData.sort((a, b) => {
            switch (sortBy) {
                case "due_date":
                    return new Date(a.due_date) - new Date(b.due_date);
                case "fee_name":
                    return a.fee_name.localeCompare(b.fee_name);
                case "amount":
                    return parseFloat(b.total_amount) - parseFloat(a.total_amount);
                case "status":
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });

        this.renderFeesList();
        this.renderTable();
    }



    showFeeDetails(feeId) {
        const fee = this.feesData.find(f => f.fee_id === feeId);
        if (!fee) return;

        // Populate modal
        document.getElementById("modalTitle").textContent = fee.fee_name;
        document.getElementById("modalFeeName").textContent = fee.fee_name;
        document.getElementById("modalFeeType").textContent = fee.fee_type;
        document.getElementById("modalTotalAmount").textContent = this.formatCurrency(fee.total_amount);
        document.getElementById("modalAmountPaid").textContent = this.formatCurrency(fee.amount_paid);
        document.getElementById("modalOutstanding").textContent = this.formatCurrency(fee.total_amount - fee.amount_paid);
        document.getElementById("modalDueDate").textContent = this.formatDate(fee.due_date);
        document.getElementById("modalStatus").textContent = fee.status;
        document.getElementById("modalPaymentDate").textContent = fee.payment_date ? this.formatDate(fee.payment_date) : "Not paid";
        document.getElementById("modalPaymentMethod").textContent = fee.payment_method || "Not specified";
        document.getElementById("modalReceiptNumber").textContent = fee.receipt_number || "Not available";
        document.getElementById("modalNotes").textContent = fee.notes || "No notes available";

        // Show modal
        document.getElementById("feeModal").style.display = "block";
    }

    closeFeeModal() {
        document.getElementById("feeModal").style.display = "none";
    }

    exportData() {
        if (this.filteredData.length === 0) {
            this.showError("No school fees data to export.");
            return;
        }

        const csvContent = this.convertToCSV(this.filteredData);
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `school_fees_records_${this.studentId}_${this.formatDate(new Date())}.csv`);
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
        const headers = ["Fee Name", "Total Amount (GHS)", "Amount Paid (GHS)", "Outstanding (GHS)", "Due Date", "Status", "Payment Date", "Payment Method", "Receipt Number"];
        const csvRows = [headers.join(",")];
        
        data.forEach(fee => {
            const row = [
                fee.fee_name,
                fee.total_amount,
                fee.amount_paid,
                fee.total_amount - fee.amount_paid,
                this.formatDate(fee.due_date),
                fee.status,
                fee.payment_date ? this.formatDate(fee.payment_date) : "",
                fee.payment_method || "",
                fee.receipt_number || ""
            ].map(field => `"${field}"`).join(",");
            csvRows.push(row);
        });
        
        return csvRows.join("\n");
    }

    calculatePaymentPercentage(paid, total) {
        if (!paid || !total) return 0;
        return Math.round((parseFloat(paid) / parseFloat(total)) * 100);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat("en-GH", {
            style: "currency",
            currency: "GHS"
        }).format(amount || 0);
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
function closeFeeModal() {
    feesManager.closeFeeModal();
}

function closeErrorModal() {
    document.getElementById("errorModal").style.display = "none";
}

// Initialize the fees manager when the page loads
let feesManager;
document.addEventListener("DOMContentLoaded", () => {
    feesManager = new FeesManager();
}); 