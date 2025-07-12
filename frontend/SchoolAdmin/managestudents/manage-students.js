// Global variables
let students = [];
let filteredStudents = [];
let currentPage = 1;
let studentsPerPage = 10;
let currentStudentToDelete = null;
let currentViewStudentId = null;

// Database containers (replace with actual API calls)
let studentsDB = [];
let classesDB = [];
let academicYearsDB = [];

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    loadStudents();
    loadClasses();
    loadAcademicYears();
    setupEventListeners();
    renderStudents();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById("searchInput").addEventListener("input", function() {
        filterStudents();
    });

    // Filter functionality
    document.getElementById("classFilter").addEventListener("change", function() {
        filterStudents();
    });

    document.getElementById("yearFilter").addEventListener("change", function() {
        filterStudents();
    });

    // Form submissions
    document.getElementById("enrollForm").addEventListener("submit", function(e) {
        e.preventDefault();
        enrollStudent();
    });

    document.getElementById("editForm").addEventListener("submit", function(e) {
        e.preventDefault();
        updateStudent();
    });

    // Modal close on outside click
    window.addEventListener("click", function(event) {
        if (event.target.classList.contains("modal")) {
            closeAllModals();
        }
    });
}

// Load students from database
function loadStudents() {
    // Simulate API call
    students = [...studentsDB];
    filteredStudents = [...students];
}

// Load classes from database
function loadClasses() {
    const classSelects = [
        document.getElementById("classId"),
        document.getElementById("editClassId"),
        document.getElementById("classFilter")
    ];

    classSelects.forEach(select => {
        if (select) {
            // Clear existing options except the first one
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }

            // Add class options
            classesDB.forEach(cls => {
                const option = document.createElement("option");
                option.value = cls.class_id;
                option.textContent = cls.class_name;
                select.appendChild(option);
            });
        }
    });
}

// Load academic years from database
function loadAcademicYears() {
    const yearSelects = [
        document.getElementById("academicYear"),
        document.getElementById("editAcademicYear"),
        document.getElementById("yearFilter")
    ];

    yearSelects.forEach(select => {
        if (select) {
            // Clear existing options except the first one
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }

            // Add year options
            academicYearsDB.forEach(year => {
                const option = document.createElement("option");
                option.value = year.Acc_year;
                option.textContent = year.year_name;
                select.appendChild(option);
            });
        }
    });
}

// Filter students based on search and filters
function filterStudents() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const classFilter = document.getElementById("classFilter").value;
    const yearFilter = document.getElementById("yearFilter").value;

    filteredStudents = students.filter(student => {
        const matchesSearch = student.St_Full_N.toLowerCase().includes(searchTerm) ||
                            student.Student_ID.toLowerCase().includes(searchTerm) ||
                            student.St_Email.toLowerCase().includes(searchTerm);
        
        const matchesClass = !classFilter || student.class_id === classFilter;
        const matchesYear = !yearFilter || student.Acc_year === yearFilter;

        return matchesSearch && matchesClass && matchesYear;
    });

    currentPage = 1;
    renderStudents();
}

// Render students table
function renderStudents() {
    const tableBody = document.getElementById("studentsTableBody");
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const studentsToShow = filteredStudents.slice(startIndex, endIndex);

    if (studentsToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No students found</h3>
                    <p>Try adjusting your search or filters</p>
                </td>
            </tr>
        `;
        updatePagination();
        return;
    }

    tableBody.innerHTML = studentsToShow.map(student => {
        const classInfo = classesDB.find(cls => cls.class_id === student.class_id);
        const yearInfo = academicYearsDB.find(year => year.Acc_year === student.Acc_year);
        
        return `
            <tr>
                <td>${student.Student_ID}</td>
                <td>${student.St_Full_N}</td>
                <td>${student.St_Email}</td>
                <td>${classInfo ? classInfo.class_name : student.class_id}</td>
                <td>${yearInfo ? yearInfo.year_name : student.Acc_year}</td>
                <td><span class="status-badge status-${student.status}">${student.status}</span></td>
                <td>
                    <button class="action-btn view-btn" onclick="viewStudent('${student.Student_ID}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editStudent('${student.Student_ID}')" title="Edit Student">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteStudent('${student.Student_ID}')" title="Delete Student">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    updatePagination();
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    const pageInfo = document.getElementById("pageInfo");
    const prevBtn = document.querySelector(".pagination-btn:first-child");
    const nextBtn = document.querySelector(".pagination-btn:last-child");

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderStudents();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderStudents();
    }
}

// Modal functions
function openEnrollModal() {
    document.getElementById("enrollModal").style.display = "block";
    document.getElementById("enrollForm").reset();
}

function closeEnrollModal() {
    document.getElementById("enrollModal").style.display = "none";
}

function openEditModal() {
    document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}

function openDeleteModal() {
    document.getElementById("deleteModal").style.display = "block";
}

function closeDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
    currentStudentToDelete = null;
}

function openViewModal() {
    document.getElementById("viewModal").style.display = "block";
}

function closeViewModal() {
    document.getElementById("viewModal").style.display = "none";
    currentViewStudentId = null;
}

function closeAllModals() {
    closeEnrollModal();
    closeEditModal();
    closeDeleteModal();
    closeViewModal();
}

// Enroll new student
function enrollStudent() {
    const formData = new FormData(document.getElementById("enrollForm"));
    const studentData = {
        Student_ID: formData.get("Student_ID"),
        St_Full_N: formData.get("St_Full_N"),
        St_Email: formData.get("St_Email"),
        St_Password: formData.get("St_Password"),
        class_id: formData.get("class_id"),
        Acc_year: formData.get("Acc_year"),
        status: "active"
    };

    // Validate student ID uniqueness
    if (students.find(s => s.Student_ID === studentData.Student_ID)) {
        showMessage("Student ID already exists!", "error");
        return;
    }

    // Validate email uniqueness
    if (students.find(s => s.St_Email === studentData.St_Email)) {
        showMessage("Email already exists!", "error");
        return;
    }

    // Add to database (simulate API call)
    studentsDB.push(studentData);
    students.push(studentData);
    
    // Update filtered students
    filterStudents();
    
    // Close modal and show success message
    closeEnrollModal();
    showMessage("Student enrolled successfully!", "success");
}

// Edit student
function editStudent(studentId) {
    const student = students.find(s => s.Student_ID === studentId);
    if (!student) return;

    // Populate edit form
    document.getElementById("editStudentId").value = student.Student_ID;
    document.getElementById("editFullName").value = student.St_Full_N;
    document.getElementById("editEmail").value = student.St_Email;
    document.getElementById("editClassId").value = student.class_id;
    document.getElementById("editAcademicYear").value = student.Acc_year;

    openEditModal();
}

// Update student
function updateStudent() {
    const formData = new FormData(document.getElementById("editForm"));
    const studentId = formData.get("Student_ID");
    
    const updatedData = {
        St_Full_N: formData.get("St_Full_N"),
        St_Email: formData.get("St_Email"),
        class_id: formData.get("class_id"),
        Acc_year: formData.get("Acc_year")
    };

    // Validate email uniqueness (excluding current student)
    const emailExists = students.find(s => s.St_Email === updatedData.St_Email && s.Student_ID !== studentId);
    if (emailExists) {
        showMessage("Email already exists!", "error");
        return;
    }

    // Update in database (simulate API call)
    const studentIndex = students.findIndex(s => s.Student_ID === studentId);
    if (studentIndex !== -1) {
        students[studentIndex] = { ...students[studentIndex], ...updatedData };
        
        // Update in main database
        const dbIndex = studentsDB.findIndex(s => s.Student_ID === studentId);
        if (dbIndex !== -1) {
            studentsDB[dbIndex] = { ...studentsDB[dbIndex], ...updatedData };
        }
        
        // Update filtered students
        filterStudents();
        
        // Close modal and show success message
        closeEditModal();
        showMessage("Student updated successfully!", "success");
    }
}

// Delete student
function deleteStudent(studentId) {
    const student = students.find(s => s.Student_ID === studentId);
    if (!student) return;

    currentStudentToDelete = studentId;
    document.getElementById("deleteStudentName").textContent = student.St_Full_N;
    openDeleteModal();
}

// Confirm delete
function confirmDelete() {
    if (!currentStudentToDelete) return;

    // Remove from database (simulate API call)
    students = students.filter(s => s.Student_ID !== currentStudentToDelete);
    studentsDB = studentsDB.filter(s => s.Student_ID !== currentStudentToDelete);
    
    // Update filtered students
    filterStudents();
    
    // Close modal and show success message
    closeDeleteModal();
    showMessage("Student deleted successfully!", "success");
}

// View student details
function viewStudent(studentId) {
    const student = students.find(s => s.Student_ID === studentId);
    if (!student) return;

    const classInfo = classesDB.find(cls => cls.class_id === student.class_id);
    const yearInfo = academicYearsDB.find(year => year.Acc_year === student.Acc_year);

    // Populate the view modal with student data
    document.getElementById("viewStudentName").textContent = student.St_Full_N;
    document.getElementById("viewStudentId").querySelector("span").textContent = student.Student_ID;
    document.getElementById("viewFullName").textContent = student.St_Full_N;
    document.getElementById("viewEmail").textContent = student.St_Email;
    document.getElementById("viewClass").textContent = classInfo ? classInfo.class_name : student.class_id;
    document.getElementById("viewAcademicYear").textContent = yearInfo ? yearInfo.year_name : student.Acc_year;
    
    // Set status with proper styling
    const statusElement = document.getElementById("viewStatus");
    statusElement.textContent = student.status;
    statusElement.className = `value status-badge status-${student.status}`;
    
    // Set enrollment date (simulated - replace with actual data)
    const enrollmentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    document.getElementById("viewEnrollmentDate").textContent = enrollmentDate;
    
    // Store current student ID for edit/delete actions
    currentViewStudentId = studentId;
    
    // Open the view modal
    openViewModal();
}

// Edit student from view modal
function editFromView() {
    if (currentViewStudentId) {
        closeViewModal();
        editStudent(currentViewStudentId);
    }
}

// Delete student from view modal
function deleteFromView() {
    if (currentViewStudentId) {
        closeViewModal();
        deleteStudent(currentViewStudentId);
    }
}

// Show message
function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector(".message");
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Insert at the top of the container
    const container = document.querySelector(".container");
    container.insertBefore(messageDiv, container.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Export functions for global access
window.openEnrollModal = openEnrollModal;
window.closeEnrollModal = closeEnrollModal;
window.closeEditModal = closeEditModal;
window.closeDeleteModal = closeDeleteModal;
window.closeViewModal = closeViewModal;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.confirmDelete = confirmDelete;
window.viewStudent = viewStudent;
window.editFromView = editFromView;
window.deleteFromView = deleteFromView;
window.previousPage = previousPage;
window.nextPage = nextPage; 