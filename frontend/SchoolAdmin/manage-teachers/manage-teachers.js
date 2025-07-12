// Teacher Management System JavaScript

// Global variables
let teachers = [];
let currentPage = 1;
let itemsPerPage = 10;
let filteredTeachers = [];
let subjects = [];
let classes = [];

// Initialize the application
document.addEventListener("DOMContentLoaded", function() {
    initializeTeacherManagement();
});

function initializeTeacherManagement() {
    loadSampleData();
    loadSubjects();
    loadClasses();
    setupEventListeners();
    renderTeachers();
    updatePagination();
}

// Load teacher data from database
function loadTeacherData() {
    teachers = [];
    // TODO: Replace with actual API call to load teachers from database
    filteredTeachers = [...teachers];
    renderTeachers();
}

// Load subjects from database (simulated)
function loadSubjects() {
    subjects = [
        { id: "MATH101", name: "Mathematics 101" },
        { id: "MATH201", name: "Advanced Mathematics" },
        { id: "PHY101", name: "Physics 101" },
        { id: "PHY201", name: "Advanced Physics" },
        { id: "ENG101", name: "English 101" },
        { id: "ENG201", name: "Advanced English" },
        { id: "CHEM101", name: "Chemistry 101" },
        { id: "BIO101", name: "Biology 101" },
        { id: "BIO201", name: "Advanced Biology" },
        { id: "HIST101", name: "History 101" },
        { id: "GEO101", name: "Geography 101" },
        { id: "COMP101", name: "Computer Science 101" }
    ];
    
    populateSubjectOptions();
}

// Load classes from database (simulated)
function loadClasses() {
    classes = [
        { id: "C1", name: "Class 1A" },
        { id: "C2", name: "Class 1B" },
        { id: "C3", name: "Class 2A" },
        { id: "C4", name: "Class 2B" },
        { id: "C5", name: "Class 3A" },
        { id: "C6", name: "Class 3B" },
        { id: "C7", name: "Class 4A" },
        { id: "C8", name: "Class 4B" },
        { id: "C9", name: "Class 5A" },
        { id: "C10", name: "Class 5B" }
    ];
    
    populateClassOptions();
}

// Populate subject options in forms
function populateSubjectOptions() {
    const subjectSelects = ["subjects", "editSubjects"];
    subjectSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = "";
            subjects.forEach(subject => {
                const option = document.createElement("option");
                option.value = subject.id;
                option.textContent = subject.name;
                select.appendChild(option);
            });
        }
    });
    
    // Populate filter
    const filterSelect = document.getElementById("subjectFilter");
    if (filterSelect) {
        filterSelect.innerHTML = "<option value=\"\">All Subjects</option>";
        subjects.forEach(subject => {
            const option = document.createElement("option");
            option.value = subject.id;
            option.textContent = subject.name;
            filterSelect.appendChild(option);
        });
    }
}

// Populate class options in forms
function populateClassOptions() {
    const classSelects = ["classes", "editClasses"];
    classSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = "";
            classes.forEach(cls => {
                const option = document.createElement("option");
                option.value = cls.id;
                option.textContent = cls.name;
                select.appendChild(option);
            });
        }
    });
    
    // Populate filter
    const filterSelect = document.getElementById("classFilter");
    if (filterSelect) {
        filterSelect.innerHTML = "<option value=\"\">All Classes</option>";
        classes.forEach(cls => {
            const option = document.createElement("option");
            option.value = cls.id;
            option.textContent = cls.name;
            filterSelect.appendChild(option);
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", handleSearch);
    }
    
    // Filter functionality
    const filters = ["subjectFilter", "classFilter", "statusFilter"];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener("change", handleFilter);
        }
    });
    
    // Form submissions
    const enrollForm = document.getElementById("enrollForm");
    if (enrollForm) {
        enrollForm.addEventListener("submit", handleEnrollSubmit);
    }
    
    const editForm = document.getElementById("editForm");
    if (editForm) {
        editForm.addEventListener("submit", handleEditSubmit);
    }
    
    // Multi-select functionality
    setupMultiSelect("subjects", "selectedSubjects");
    setupMultiSelect("classes", "selectedClasses");
    setupMultiSelect("editSubjects", "editSelectedSubjects");
    setupMultiSelect("editClasses", "editSelectedClasses");
    
    // Modal close on outside click
    setupModalCloseHandlers();
}

// Setup multi-select functionality
function setupMultiSelect(selectId, displayId) {
    const select = document.getElementById(selectId);
    const display = document.getElementById(displayId);
    
    if (select && display) {
        // Handle change events
        select.addEventListener("change", function() {
            updateSelectedItems(select, display);
        });
        
        // Tap/click handling for individual options
        select.addEventListener("mousedown", function(e) {
            if (e.target.tagName === "OPTION") {
                e.preventDefault();
                e.stopPropagation();
                
                const option = e.target;
                const isSelected = option.selected;
                
                // Toggle selection
                option.selected = !isSelected;
                
                // Trigger change event
                const changeEvent = new Event("change", { bubbles: true });
                select.dispatchEvent(changeEvent);
                
                // Prevent default dropdown behavior
                return false;
            }
        });
        
        // Prevent default dropdown behavior on focus
        select.addEventListener("focus", function(e) {
            e.preventDefault();
        });
        
        // Handle keyboard navigation
        select.addEventListener("keydown", function(e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const focusedOption = select.querySelector("option:focus");
                if (focusedOption) {
                    focusedOption.selected = !focusedOption.selected;
                    updateSelectedItems(select, display);
                }
            }
        });
    }
}

// Update selected items display
function updateSelectedItems(select, display) {
    if (!select || !display) return;
    
    display.innerHTML = "";
    const selectedOptions = Array.from(select.selectedOptions);
    
    selectedOptions.forEach((option, index) => {
        const item = document.createElement("div");
        item.className = "selected-item";
        item.style.animationDelay = `${index * 0.1}s`;
        item.innerHTML = `
            ${option.textContent}
            <span class="remove-item" onclick="removeSelectedItem('${select.id}', '${option.value}', '${display.id}')" title="Remove">×</span>
        `;
        display.appendChild(item);
    });
}

// Remove selected item
function removeSelectedItem(selectId, value, displayId) {
    const select = document.getElementById(selectId);
    const display = document.getElementById(displayId);
    
    if (!select || !display) return;
    
    const option = select.querySelector(`option[value="${value}"]`);
    if (option) {
        option.selected = false;
        updateSelectedItems(select, display);
    }
}

// Setup modal close handlers
function setupModalCloseHandlers() {
    const modals = document.querySelectorAll(".modal");
    modals.forEach(modal => {
        // Close on backdrop click
        modal.addEventListener("click", function(e) {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
        
        // Close on Escape key
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape" && modal.style.display === "block") {
                modal.style.display = "none";
            }
        });
    });
}

// Handle search with debouncing
let searchTimeout;
function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
}

// Handle filter changes
function handleFilter() {
    applyFilters();
}

// Apply all filters
function applyFilters() {
    const searchInput = document.getElementById("searchInput");
    const subjectFilter = document.getElementById("subjectFilter");
    const classFilter = document.getElementById("classFilter");
    const statusFilter = document.getElementById("statusFilter");
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const subjectFilterValue = subjectFilter ? subjectFilter.value : "";
    const classFilterValue = classFilter ? classFilter.value : "";
    const statusFilterValue = statusFilter ? statusFilter.value : "";
    
    filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = teacher.TFull_N.toLowerCase().includes(searchTerm) ||
                            teacher.TEmail.toLowerCase().includes(searchTerm) ||
                            teacher.teacher_ID.toLowerCase().includes(searchTerm);
        
        const matchesSubject = !subjectFilterValue || teacher.Subject_id.includes(subjectFilterValue);
        const matchesClass = !classFilterValue || teacher.Class_id.includes(classFilterValue);
        const matchesStatus = !statusFilterValue || teacher.status === statusFilterValue;
        
        return matchesSearch && matchesSubject && matchesClass && matchesStatus;
    });
    
    currentPage = 1;
    renderTeachers();
    updatePagination();
}

// Render teachers table with enhanced animations
function renderTeachers() {
    const tbody = document.getElementById("teachersTableBody");
    if (!tbody) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const teachersToShow = filteredTeachers.slice(startIndex, endIndex);
    
    tbody.innerHTML = "";
    
    teachersToShow.forEach((teacher, index) => {
        const row = document.createElement("tr");
        row.className = "teacher-enrolled";
        row.style.animationDelay = `${index * 0.1}s`;
        
        const subjectsText = getSubjectNames(teacher.Subject_id).join(", ");
        const classesText = getClassNames(teacher.Class_id).join(", ");
        
        row.innerHTML = `
            <td data-label="Teacher ID"><strong>${teacher.teacher_ID}</strong></td>
            <td data-label="Full Name">${teacher.TFull_N}</td>
            <td data-label="Email">${teacher.TEmail}</td>
            <td data-label="Subjects">
                <div class="teacher-subjects">
                    ${teacher.Subject_id.map(subjectId => {
                        const subject = subjects.find(s => s.id === subjectId);
                        return subject ? `<span class="subject-tag">${subject.name}</span>` : "";
                    }).join("")}
                </div>
            </td>
            <td data-label="Classes">
                <div class="teacher-classes">
                    ${teacher.Class_id.map(classId => {
                        const cls = classes.find(c => c.id === classId);
                        return cls ? `<span class="class-tag">${cls.name}</span>` : "";
                    }).join("")}
                </div>
            </td>
            <td data-label="Status">
                <span class="teacher-status ${teacher.status.toLowerCase()}">
                    <i class="fas fa-circle"></i>
                    ${teacher.status}
                </span>
            </td>
            <td data-label="Actions">
                <div class="action-buttons-container">
                    <button class="action-btn btn-view" onclick="viewTeacher('${teacher.teacher_ID}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" onclick="editTeacher('${teacher.teacher_ID}')" title="Edit Teacher">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteTeacher('${teacher.teacher_ID}')" title="Delete Teacher">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Get subject names from IDs
function getSubjectNames(subjectIds) {
    return subjectIds.map(id => {
        const subject = subjects.find(s => s.id === id);
        return subject ? subject.name : id;
    });
}

// Get class names from IDs
function getClassNames(classIds) {
    return classIds.map(id => {
        const cls = classes.find(c => c.id === id);
        return cls ? cls.name : id;
    });
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
    const pageInfo = document.getElementById("pageInfo");
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    // Update button states
    const prevBtn = document.querySelector(".pagination-btn:first-child");
    const nextBtn = document.querySelector(".pagination-btn:last-child");
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTeachers();
        updatePagination();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTeachers();
        updatePagination();
    }
}

// Enhanced modal functions
function openEnrollModal() {
    const modal = document.getElementById("enrollModal");
    if (modal) {
        modal.style.display = "block";
        document.getElementById("enrollForm").reset();
        clearForm();
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.getElementById("teacherId");
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function closeEnrollModal() {
    const modal = document.getElementById("enrollModal");
    if (modal) {
        modal.style.display = "none";
        clearForm();
    }
}

function clearForm() {
    const enrollForm = document.getElementById("enrollForm");
    if (enrollForm) {
        enrollForm.reset();
    }
    
    // Clear selected items displays
    const displays = ["selectedSubjects", "selectedClasses", "editSelectedSubjects", "editSelectedClasses"];
    displays.forEach(id => {
        const display = document.getElementById(id);
        if (display) display.innerHTML = "";
    });
}

// Handle enroll form submission with enhanced validation
function handleEnrollSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const teacherData = {
        teacher_ID: formData.get("teacher_ID"),
        TFull_N: formData.get("TFull_N"),
        TEmail: formData.get("TEmail"),
        T_Password: formData.get("T_Password"),
        Subject_id: Array.from(document.getElementById("subjects").selectedOptions).map(opt => opt.value),
        Class_id: Array.from(document.getElementById("classes").selectedOptions).map(opt => opt.value),
        status: formData.get("status"),
        enrollmentDate: new Date().toISOString().split("T")[0],
        lastUpdated: new Date().toISOString().split("T")[0]
    };
    
    // Enhanced validation
    if (!teacherData.Subject_id.length || !teacherData.Class_id.length) {
        showNotification("Please select at least one subject and one class.", "error");
        return;
    }
    
    if (teacherData.T_Password.length < 6) {
        showNotification("Password must be at least 6 characters long.", "error");
        return;
    }
    
    // Check if teacher ID already exists
    if (teachers.find(t => t.teacher_ID === teacherData.teacher_ID)) {
        showNotification("Teacher ID already exists. Please use a unique ID.", "error");
        return;
    }
    
    // Check if email already exists
    if (teachers.find(t => t.TEmail === teacherData.TEmail)) {
        showNotification("Email already exists. Please use a unique email.", "error");
        return;
    }
    
    // Add teacher to database
    teachers.push(teacherData);
    filteredTeachers = [...teachers];
    
    showNotification("Teacher enrolled successfully!", "success");
    closeEnrollModal();
    renderTeachers();
    updatePagination();
}

// View teacher details
function viewTeacher(teacherId) {
    const teacher = teachers.find(t => t.teacher_ID === teacherId);
    if (!teacher) return;
    
    // Populate view modal
    document.getElementById("viewTeacherName").textContent = teacher.TFull_N;
    document.getElementById("viewTeacherId").querySelector("span").textContent = teacher.teacher_ID;
    document.getElementById("viewFullName").textContent = teacher.TFull_N;
    document.getElementById("viewEmail").textContent = teacher.TEmail;
    document.getElementById("viewStatus").textContent = teacher.status;
    document.getElementById("viewStatus").className = `value status-badge ${teacher.status.toLowerCase()}`;
    
    // Subjects and classes
    const subjectNames = getSubjectNames(teacher.Subject_id);
    const classNames = getClassNames(teacher.Class_id);
    
    document.getElementById("viewSubjects").textContent = subjectNames.join(", ");
    document.getElementById("viewSubjectCount").textContent = teacher.Subject_id.length;
    document.getElementById("viewClasses").textContent = classNames.join(", ");
    document.getElementById("viewClassCount").textContent = teacher.Class_id.length;
    
    // Additional details
    document.getElementById("viewEnrollmentDate").textContent = teacher.enrollmentDate;
    document.getElementById("viewLastUpdated").textContent = teacher.lastUpdated;
    document.getElementById("viewEmploymentStatus").textContent = teacher.status;
    
    // Calculate performance metrics
    const totalStudents = teacher.Class_id.length * 25; // Assuming 25 students per class
    const averageClassSize = 25;
    const teachingHours = teacher.Subject_id.length * 4; // Assuming 4 hours per subject
    
    document.getElementById("viewTotalStudents").textContent = totalStudents;
    document.getElementById("viewAverageClassSize").textContent = averageClassSize;
    document.getElementById("viewTeachingHours").textContent = `${teachingHours} hours/week`;
    
    // Calculate years of service
    const enrollmentDate = new Date(teacher.enrollmentDate);
    const currentDate = new Date();
    const yearsOfService = Math.floor((currentDate - enrollmentDate) / (1000 * 60 * 60 * 24 * 365));
    document.getElementById("viewYearsOfService").textContent = `${yearsOfService} years`;
    
    // Additional information
    document.getElementById("viewCertifications").textContent = "Teaching License, Subject Certifications";
    document.getElementById("viewSpecializations").textContent = subjectNames.join(", ");
    
    // Show modal
    const modal = document.getElementById("viewModal");
    if (modal) {
        modal.style.display = "block";
    }
}

function closeViewModal() {
    const modal = document.getElementById("viewModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Edit teacher
function editTeacher(teacherId) {
    const teacher = teachers.find(t => t.teacher_ID === teacherId);
    if (!teacher) return;
    
    // Populate edit form
    document.getElementById("editTeacherId").value = teacher.teacher_ID;
    document.getElementById("editFullName").value = teacher.TFull_N;
    document.getElementById("editEmail").value = teacher.TEmail;
    document.getElementById("editStatus").value = teacher.status;
    
    // Set selected subjects and classes
    const editSubjectsSelect = document.getElementById("editSubjects");
    const editClassesSelect = document.getElementById("editClasses");
    
    Array.from(editSubjectsSelect.options).forEach(option => {
        option.selected = teacher.Subject_id.includes(option.value);
    });
    
    Array.from(editClassesSelect.options).forEach(option => {
        option.selected = teacher.Class_id.includes(option.value);
    });
    
    updateSelectedItems(editSubjectsSelect, document.getElementById("editSelectedSubjects"));
    updateSelectedItems(editClassesSelect, document.getElementById("editSelectedClasses"));
    
    // Show modal
    const modal = document.getElementById("editModal");
    if (modal) {
        modal.style.display = "block";
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.getElementById("editFullName");
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function closeEditModal() {
    const modal = document.getElementById("editModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Handle edit form submission
function handleEditSubmit(event) {
    event.preventDefault();
    
    const teacherId = document.getElementById("editTeacherId").value;
    const teacherIndex = teachers.findIndex(t => t.teacher_ID === teacherId);
    
    if (teacherIndex === -1) {
        showNotification("Teacher not found.", "error");
        return;
    }
    
    const formData = new FormData(event.target);
    const updatedData = {
        ...teachers[teacherIndex],
        TFull_N: formData.get("TFull_N"),
        TEmail: formData.get("TEmail"),
        Subject_id: Array.from(document.getElementById("editSubjects").selectedOptions).map(opt => opt.value),
        Class_id: Array.from(document.getElementById("editClasses").selectedOptions).map(opt => opt.value),
        status: formData.get("status"),
        lastUpdated: new Date().toISOString().split("T")[0]
    };
    
    // Enhanced validation
    if (!updatedData.Subject_id.length || !updatedData.Class_id.length) {
        showNotification("Please select at least one subject and one class.", "error");
        return;
    }
    
    // Check if email already exists (excluding current teacher)
    const emailExists = teachers.find(t => t.TEmail === updatedData.TEmail && t.teacher_ID !== teacherId);
    if (emailExists) {
        showNotification("Email already exists. Please use a unique email.", "error");
        return;
    }
    
    // Update teacher
    teachers[teacherIndex] = updatedData;
    filteredTeachers = [...teachers];
    
    showNotification("Teacher updated successfully!", "success");
    closeEditModal();
    renderTeachers();
    updatePagination();
}

// Delete teacher
function deleteTeacher(teacherId) {
    const teacher = teachers.find(t => t.teacher_ID === teacherId);
    if (!teacher) return;
    
    document.getElementById("deleteTeacherName").textContent = teacher.TFull_N;
    const modal = document.getElementById("deleteModal");
    if (modal) {
        modal.style.display = "block";
    }
}

function closeDeleteModal() {
    const modal = document.getElementById("deleteModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function confirmDelete() {
    const teacherName = document.getElementById("deleteTeacherName").textContent;
    const teacher = teachers.find(t => t.TFull_N === teacherName);
    
    if (teacher) {
        const teacherIndex = teachers.findIndex(t => t.teacher_ID === teacher.teacher_ID);
        teachers.splice(teacherIndex, 1);
        filteredTeachers = [...teachers];
        
        showNotification("Teacher deleted successfully!", "success");
        closeDeleteModal();
        renderTeachers();
        updatePagination();
    }
}

// Edit from view modal
function editFromView() {
    const teacherName = document.getElementById("viewTeacherName").textContent;
    const teacher = teachers.find(t => t.TFull_N === teacherName);
    
    if (teacher) {
        closeViewModal();
        editTeacher(teacher.teacher_ID);
    }
}

// Delete from view modal
function deleteFromView() {
    const teacherName = document.getElementById("viewTeacherName").textContent;
    const teacher = teachers.find(t => t.TFull_N === teacherName);
    
    if (teacher) {
        closeViewModal();
        deleteTeacher(teacher.teacher_ID);
    }
}

// Enhanced notification system
function showNotification(message, type = "info") {
    if (!message) return;
    
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" title="Close">×</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = "slideOutNotification 0.3s ease-out";
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

 