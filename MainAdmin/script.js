// ========================================
// MAIN ADMIN PANEL FUNCTIONALITY
// ========================================

class MainAdminPanel {
    constructor() {
        this.isAuthenticated = false;
        this.currentAdmin = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.bindEvents();
        this.loadSystemStats();
    }

    // Check if admin is already authenticated
    checkAuthentication() {
        const token = localStorage.getItem("mainAdminToken");
        const adminData = localStorage.getItem("mainAdminData");
        
        if (token && adminData) {
            try {
                this.currentAdmin = JSON.parse(adminData);
                this.isAuthenticated = true;
                this.showMainPanel();
            } catch (error) {
                this.showAuthModal();
            }
        } else {
            this.showAuthModal();
        }
    }

    // Show authentication modal
    showAuthModal() {
        document.getElementById("authModal").style.display = "flex";
        document.getElementById("mainPanel").style.display = "none";
    }

    // Show main panel after authentication
    showMainPanel() {
        document.getElementById("authModal").style.display = "none";
        document.getElementById("mainPanel").style.display = "block";
        document.getElementById("adminName").textContent = this.currentAdmin.name;
        this.loadSchools();
        this.loadAdmins();
    }

    // Bind all event listeners
    bindEvents() {
        // Authentication form
        document.getElementById("authForm").addEventListener("submit", (e) => {
            e.preventDefault();
            this.authenticate();
        });

        // Logout button
        document.getElementById("logoutBtn").addEventListener("click", () => {
            this.logout();
        });

        // Add school form
        document.getElementById("addSchoolForm").addEventListener("submit", (e) => {
            e.preventDefault();
            this.addSchool();
        });

        // Create school admin form
        document.getElementById("createSchoolAdminForm").addEventListener("submit", (e) => {
            e.preventDefault();
            this.createSchoolAdmin();
        });

        // Create main admin form
        document.getElementById("createMainAdminForm").addEventListener("submit", (e) => {
            e.preventDefault();
            this.createMainAdmin();
        });

        // Delete admin form
        document.getElementById("deleteAdminForm").addEventListener("submit", (e) => {
            e.preventDefault();
            this.deleteAdmin();
        });

        // Delete admin type change
        document.getElementById("deleteAdminType").addEventListener("change", (e) => {
            this.loadAccountsForDeletion(e.target.value);
        });

        // Student statistics events
        document.getElementById("schoolStatsSelect").addEventListener("change", (e) => {
            const loadButton = document.getElementById("loadSchoolStats");
            loadButton.disabled = !e.target.value;
        });

        document.getElementById("loadSchoolStats").addEventListener("click", () => {
            this.loadSchoolStudentStats();
        });

        document.getElementById("exportStudentList").addEventListener("click", () => {
            this.exportStudentList();
        });

        document.getElementById("refreshStudentList").addEventListener("click", () => {
            this.loadSchoolStudentStats();
        });

        // Student list pagination
        document.getElementById("prevStudentPage").addEventListener("click", () => {
            this.changeStudentPage(-1);
        });

        document.getElementById("nextStudentPage").addEventListener("click", () => {
            this.changeStudentPage(1);
        });
    }

    // Authenticate main admin
    async authenticate() {
        const email = document.getElementById("adminEmail").value;
        const password = document.getElementById("adminPassword").value;
        const errorDiv = document.getElementById("authError");

        try {
            const response = await fetch("/api/main-admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentAdmin = data.admin;
                this.isAuthenticated = true;
                
                // Store authentication data
                localStorage.setItem("mainAdminToken", data.token);
                localStorage.setItem("mainAdminData", JSON.stringify(data.admin));
                
                this.showMainPanel();
                this.showMessage("Authentication successful!", "success");
            } else {
                errorDiv.textContent = data.message || "Authentication failed";
                errorDiv.style.display = "block";
            }
        } catch (error) {
            errorDiv.textContent = "Network error. Please try again.";
            errorDiv.style.display = "block";
        }
    }

    // Logout
    logout() {
        localStorage.removeItem("mainAdminToken");
        localStorage.removeItem("mainAdminData");
        this.isAuthenticated = false;
        this.currentAdmin = null;
        this.showAuthModal();
        this.showMessage("Logged out successfully", "success");
    }

    // Add new school
    async addSchool() {
        const formData = {
            name: document.getElementById("schoolName").value,
            category: document.getElementById("schoolCategory").value,
            location: document.getElementById("schoolLocation").value,
            contact: document.getElementById("schoolContact").value
        };

        try {
            const response = await fetch("/api/schools", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("mainAdminToken")}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage("School added successfully!", "success", "schoolSuccess");
                document.getElementById("addSchoolForm").reset();
                this.loadSchools();
                this.loadSystemStats();
            } else {
                this.showMessage(data.message || "Failed to add school", "error", "schoolError");
            }
        } catch (error) {
            this.showMessage("Network error. Please try again.", "error", "schoolError");
        }
    }

    // Create school admin
    async createSchoolAdmin() {
        const formData = {
            email: document.getElementById("schoolAdminEmail").value,
            name: document.getElementById("schoolAdminName").value,
            password: document.getElementById("schoolAdminPassword").value,
            schoolId: document.getElementById("schoolSelect").value
        };

        try {
            const response = await fetch("/api/school-admins", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("mainAdminToken")}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage("School admin created successfully!", "success", "schoolAdminSuccess");
                document.getElementById("createSchoolAdminForm").reset();
                this.loadAdmins();
                this.loadSystemStats();
            } else {
                this.showMessage(data.message || "Failed to create school admin", "error", "schoolAdminError");
            }
        } catch (error) {
            this.showMessage("Network error. Please try again.", "error", "schoolAdminError");
        }
    }

    // Create main admin
    async createMainAdmin() {
        const authCode = document.getElementById("mainAdminAuthCode").value;
        
        if (authCode !== "IAMGOD") {
            this.showMessage("Invalid authentication code. Use \"IAMGOD\"", "error", "mainAdminError");
            return;
        }

        const formData = {
            email: document.getElementById("mainAdminEmail").value,
            name: document.getElementById("mainAdminName").value,
            password: document.getElementById("mainAdminPassword").value
        };

        try {
            const response = await fetch("/api/main-admins", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("mainAdminToken")}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage("Main admin created successfully!", "success", "mainAdminSuccess");
                document.getElementById("createMainAdminForm").reset();
                this.loadAdmins();
                this.loadSystemStats();
            } else {
                this.showMessage(data.message || "Failed to create main admin", "error", "mainAdminError");
            }
        } catch (error) {
            this.showMessage("Network error. Please try again.", "error", "mainAdminError");
        }
    }

    // Delete admin account
    async deleteAdmin() {
        const authCode = document.getElementById("deleteAuthCode").value;
        const confirmDelete = document.getElementById("confirmDelete").value;
        
        if (authCode !== "iam0nmeth") {
            this.showMessage("Invalid authentication code. Use \"iam0nmeth\"", "error", "deleteError");
            return;
        }

        if (confirmDelete !== "DELETE") {
            this.showMessage("Please type \"DELETE\" to confirm deletion", "error", "deleteError");
            return;
        }

        const accountType = document.getElementById("deleteAdminType").value;
        const accountId = document.getElementById("deleteAdminSelect").value;

        if (!accountId) {
            this.showMessage("Please select an account to delete", "error", "deleteError");
            return;
        }

        try {
            const response = await fetch(`/api/${accountType}-admins/${accountId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("mainAdminToken")}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage("Account deleted successfully!", "success", "deleteSuccess");
                document.getElementById("deleteAdminForm").reset();
                this.loadAdmins();
                this.loadSystemStats();
            } else {
                this.showMessage(data.message || "Failed to delete account", "error", "deleteError");
            }
        } catch (error) {
            this.showMessage("Network error. Please try again.", "error", "deleteError");
        }
    }

    // Load schools for dropdown
    async loadSchools() {
        try {
            const response = await fetch("/api/schools", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("mainAdminToken")}`
                }
            });

            const schools = await response.json();
            const schoolSelect = document.getElementById("schoolSelect");
            
            schoolSelect.innerHTML = "<option value=\"\">Select School</option>";
            schools.forEach(school => {
                const option = document.createElement("option");
                option.value = school.id;
                option.textContent = school.name;
                schoolSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to load schools:", error);
        }
    }

    // Load accounts for deletion
    async loadAccountsForDeletion(accountType) {
        const deleteSelect = document.getElementById("deleteAdminSelect");
        deleteSelect.innerHTML = "<option value=\"\">Select account to delete</option>";

        if (!accountType) return;

        try {
            const response = await fetch(`/api/${accountType}-admins`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("mainAdminToken")}`
                }
            });

            const accounts = await response.json();
            
            accounts.forEach(account => {
                const option = document.createElement("option");
                option.value = account.id;
                option.textContent = `${account.name} (${account.email})`;
                deleteSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to load accounts:", error);
        }
    }

    // Load system statistics
    async loadSystemStats() {
        try {
            const response = await fetch("/api/main-admin/stats", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("mainAdminToken")}`
                }
            });

            const stats = await response.json();
            
            document.getElementById("totalSchools").textContent = stats.totalSchools || 0;
            document.getElementById("totalSchoolAdmins").textContent = stats.totalSchoolAdmins || 0;
            document.getElementById("totalMainAdmins").textContent = stats.totalMainAdmins || 0;
            document.getElementById("totalUsers").textContent = stats.totalUsers || 0;
            
            // Load student statistics
            this.loadOverallStudentStats();
            this.loadSchoolsForStats();
        } catch (error) {
            console.error("Failed to load system stats:", error);
        }
    }

    // Load overall student statistics
    async loadOverallStudentStats() {
        try {
            const response = await fetch("/api/main-admin/student-stats", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("mainAdminToken")}`
                }
            });

            const stats = await response.json();
            
            document.getElementById("totalStudentsAll").textContent = stats.totalStudents || 0;
            document.getElementById("avgStudentsPerSchool").textContent = stats.averageStudentsPerSchool || 0;
        } catch (error) {
            console.error("Failed to load student stats:", error);
        }
    }

    // Load schools for statistics dropdown
    async loadSchoolsForStats() {
        try {
            const response = await fetch("/api/schools", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("mainAdminToken")}`
                }
            });

            const schools = await response.json();
            const schoolSelect = document.getElementById("schoolStatsSelect");
            
            schoolSelect.innerHTML = "<option value=\"\">Choose a school to view student statistics</option>";
            schools.forEach(school => {
                const option = document.createElement("option");
                option.value = school.id;
                option.textContent = school.name;
                schoolSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to load schools for stats:", error);
        }
    }

    // Load school-specific student statistics
    async loadSchoolStudentStats() {
        const schoolId = document.getElementById("schoolStatsSelect").value;
        if (!schoolId) return;

        try {
            const response = await fetch(`/api/schools/${schoolId}/student-stats`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("mainAdminToken")}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                this.displaySchoolStudentStats(data);
                this.loadStudentList(schoolId, 1);
            } else {
                this.showMessage(data.message || "Failed to load school statistics", "error");
            }
        } catch (error) {
            this.showMessage("Network error. Please try again.", "error");
        }
    }

    // Display school student statistics
    displaySchoolStudentStats(data) {
        const statsContainer = document.getElementById("selectedSchoolStats");
        const schoolName = document.getElementById("selectedSchoolName");
        const schoolDetails = document.getElementById("selectedSchoolDetails");

        // Update school info
        schoolName.textContent = data.school.name;
        schoolDetails.textContent = `${data.school.category} • ${data.school.location}`;

        // Update statistics
        document.getElementById("schoolTotalStudents").textContent = data.stats.totalStudents || 0;
        document.getElementById("schoolMaleStudents").textContent = data.stats.maleStudents || 0;
        document.getElementById("schoolFemaleStudents").textContent = data.stats.femaleStudents || 0;
        
        // Calculate gender ratio
        const total = data.stats.totalStudents || 0;
        const male = data.stats.maleStudents || 0;
        const female = data.stats.femaleStudents || 0;
        
        let genderRatio = "0%";
        if (total > 0) {
            const maleRatio = Math.round((male / total) * 100);
            const femaleRatio = Math.round((female / total) * 100);
            genderRatio = `${maleRatio}% M / ${femaleRatio}% F`;
        }
        
        document.getElementById("schoolGenderRatio").textContent = genderRatio;

        // Show the stats container
        statsContainer.style.display = "block";
    }

    // Load student list for selected school
    async loadStudentList(schoolId, page = 1) {
        try {
            const response = await fetch(`/api/schools/${schoolId}/students?page=${page}&limit=20`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("mainAdminToken")}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                this.displayStudentList(data.students, data.pagination);
            } else {
                this.showMessage(data.message || "Failed to load student list", "error");
            }
        } catch (error) {
            this.showMessage("Network error. Please try again.", "error");
        }
    }

    // Display student list
    displayStudentList(students, pagination) {
        const tbody = document.getElementById("studentListBody");
        const pageInfo = document.getElementById("studentPageInfo");
        const prevBtn = document.getElementById("prevStudentPage");
        const nextBtn = document.getElementById("nextStudentPage");

        // Clear existing content
        tbody.innerHTML = "";

        if (students.length === 0) {
            tbody.innerHTML = "<tr><td colspan=\"6\" class=\"loading\">No students found</td></tr>";
            return;
        }

        // Add student rows
        students.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.student_id || "N/A"}</td>
                <td>${student.name || "N/A"}</td>
                <td>${student.class || "N/A"}</td>
                <td>${student.gender || "N/A"}</td>
                <td>${student.contact || "N/A"}</td>
                <td><span class="status-badge ${student.status || "active"}">${student.status || "Active"}</span></td>
            `;
            tbody.appendChild(row);
        });

        // Update pagination
        pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
        prevBtn.disabled = pagination.currentPage <= 1;
        nextBtn.disabled = pagination.currentPage >= pagination.totalPages;

        // Store current page info for navigation
        this.currentStudentPage = pagination.currentPage;
        this.currentSchoolId = document.getElementById("schoolStatsSelect").value;
    }

    // Change student list page
    changeStudentPage(direction) {
        const newPage = this.currentStudentPage + direction;
        if (newPage >= 1 && this.currentSchoolId) {
            this.loadStudentList(this.currentSchoolId, newPage);
        }
    }

    // Export student list
    async exportStudentList() {
        const schoolId = document.getElementById("schoolStatsSelect").value;
        if (!schoolId) {
            this.showMessage("Please select a school first", "error");
            return;
        }

        try {
            const response = await fetch(`/api/schools/${schoolId}/students/export`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("mainAdminToken")}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `students_${schoolId}_${new Date().toISOString().split("T")[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                this.showMessage("Student list exported successfully!", "success");
            } else {
                const data = await response.json();
                this.showMessage(data.message || "Failed to export student list", "error");
            }
        } catch (error) {
            this.showMessage("Network error. Please try again.", "error");
        }
    }

    // Load admins for various operations
    async loadAdmins() {
        // This would load different types of admins for the deletion dropdown
        // Implementation depends on your API structure
    }

    // Show success/error messages
    showMessage(message, type, elementId = null) {
        const messageDiv = elementId ? document.getElementById(elementId) : null;
        
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.style.display = "block";
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                messageDiv.style.display = "none";
            }, 5000);
        } else {
            // Fallback to alert for general messages
            alert(message);
        }
    }
}

// Initialize the main admin panel when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new MainAdminPanel();
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS"
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(new Date(date));
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function isStrongPassword(password) {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
}

// Show loading state
function setLoading(element, isLoading = true) {
    if (isLoading) {
        element.classList.add("loading");
        element.disabled = true;
    } else {
        element.classList.remove("loading");
        element.disabled = false;
    }
}
