// Global variables
let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;
let currentAcademicYear = "2024-2025";
let selectedSubjects = [];
let allSubjects = [];
let allClasses = [];
let filteredClasses = [];
let editingClassId = null;
let isSubjectSelectorInEditMode = false;

// Students modal variables
let currentStudentsPage = 1;
let studentsPerPage = 10;
let totalStudentsPages = 1;
let currentClassStudents = [];
let filteredStudents = [];
let currentViewingClassId = null;

// DOM elements
const searchInput = document.getElementById("searchInput");
const academicYearFilter = document.getElementById("academicYearFilter");
const subjectFilter = document.getElementById("subjectFilter");
const statusFilter = document.getElementById("statusFilter");
const classesTableBody = document.getElementById("classesTableBody");
const pageInfo = document.getElementById("pageInfo");
const currentAcademicYearElement = document.getElementById("currentAcademicYear");

// Initialize the application
document.addEventListener("DOMContentLoaded", function() {
    initializeApp();
});

async function initializeApp() {
    showLoading();
    
    try {
        // Load initial data
        await Promise.all([
            loadAcademicYears(),
            loadSubjects(),
            loadClasses(),
            setCurrentAcademicYear()
        ]);
        
        // Load actual student counts for all classes
        await loadAllClassStudentCounts();
        
        // Set up event listeners
        setupEventListeners();
        
        // Display initial data
        displayClasses();
        updatePagination();
        
    } catch (error) {
        showMessage("Error initializing application: " + error.message, "error");
    } finally {
        hideLoading();
    }
}

function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener("input", debounce(handleSearch, 300));
    
    // Filter functionality
    academicYearFilter.addEventListener("change", handleFilter);
    subjectFilter.addEventListener("change", handleFilter);
    statusFilter.addEventListener("change", handleFilter);
    
    // Form submissions
    document.getElementById("addClassForm").addEventListener("submit", handleAddClass);
    document.getElementById("editClassForm").addEventListener("submit", handleEditClass);
    document.getElementById("academicYearForm").addEventListener("submit", handleSetAcademicYear);
    
    // Subject search
    const subjectSearch = document.getElementById("subjectSearch");
    if (subjectSearch) {
        subjectSearch.addEventListener("input", debounce(handleSubjectSearch, 300));
    }
    
    // Add event listener for subject search when modal opens
    document.addEventListener("DOMContentLoaded", function() {
        const subjectSearch = document.getElementById("subjectSearch");
        if (subjectSearch) {
            subjectSearch.addEventListener("input", debounce(handleSubjectSearch, 300));
        }
    });
}

// ========================================
// DATA LOADING FUNCTIONS
// ========================================

async function loadAcademicYears() {
    try {
        // Simulate API call - replace with actual API
        const academicYears = [
            { id: "2023-2024", name: "2023-2024", description: "Previous Academic Year" },
            { id: "2024-2025", name: "2024-2025", description: "Current Academic Year" },
            { id: "2025-2026", name: "2025-2026", description: "Next Academic Year" }
        ];
        
        // Populate academic year filters
        populateAcademicYearSelects(academicYears);
        
        return academicYears;
    } catch (error) {
        console.error("Error loading academic years:", error);
        throw error;
    }
}

async function loadSubjects() {
    try {
        // Simulate API call - replace with actual API
        allSubjects = [
            { id: "MATH001", name: "Mathematics", code: "MATH" },
            { id: "ENG001", name: "English Language", code: "ENG" },
            { id: "SCI001", name: "Science", code: "SCI" },
            { id: "HIST001", name: "History", code: "HIST" },
            { id: "GEO001", name: "Geography", code: "GEO" },
            { id: "PHY001", name: "Physics", code: "PHY" },
            { id: "CHEM001", name: "Chemistry", code: "CHEM" },
            { id: "BIO001", name: "Biology", code: "BIO" },
            { id: "COMP001", name: "Computer Science", code: "COMP" },
            { id: "ART001", name: "Art", code: "ART" },
            { id: "MUSIC001", name: "Music", code: "MUSIC" },
            { id: "PE001", name: "Physical Education", code: "PE" }
        ];
        
        // Populate subject filter
        populateSubjectFilter(allSubjects);
        
        return allSubjects;
    } catch (error) {
        console.error("Error loading subjects:", error);
        throw error;
    }
}

async function loadClasses() {
    try {
        // TODO: Replace with actual API call to load classes from database
        allClasses = [];
        
        filteredClasses = [...allClasses];
        return allClasses;
    } catch (error) {
        console.error("Error loading classes:", error);
        throw error;
    }
}

function setCurrentAcademicYear() {
    currentAcademicYearElement.textContent = currentAcademicYear;
}

// ========================================
// DISPLAY FUNCTIONS
// ========================================

function displayClasses() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const classesToShow = filteredClasses.slice(startIndex, endIndex);
    
    classesTableBody.innerHTML = "";
    
    if (classesToShow.length === 0) {
        classesTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <h3>No Classes Found</h3>
                    <p>No classes match your current search criteria.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    classesToShow.forEach(classItem => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${classItem.id}</strong></td>
            <td>${classItem.name}</td>
            <td>${getSubjectNames(classItem.subjects).join(", ")}</td>
            <td>${classItem.academic_year}</td>
            <td>${classItem.students_count} students</td>
            <td><span class="status-badge status-${classItem.status}">${classItem.status}</span></td>
            <td>
                <button class="action-btn view-btn" onclick="viewClass('${classItem.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-btn" onclick="editClass('${classItem.id}')" title="Edit Class">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteClass('${classItem.id}')" title="Delete Class">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        classesTableBody.appendChild(row);
    });
}

function getSubjectNames(subjectIds) {
    return subjectIds.map(id => {
        const subject = allSubjects.find(s => s.id === id);
        return subject ? subject.name : id;
    });
}

function updatePagination() {
    totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Update pagination button states
    const prevBtn = document.querySelector(".pagination-btn:first-child");
    const nextBtn = document.querySelector(".pagination-btn:last-child");
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

// ========================================
// SEARCH AND FILTER FUNCTIONS
// ========================================

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    applyFilters();
}

function handleFilter() {
    applyFilters();
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const academicYearFilterValue = academicYearFilter.value;
    const subjectFilterValue = subjectFilter.value;
    const statusFilterValue = statusFilter.value;
    
    filteredClasses = allClasses.filter(classItem => {
        // Search term filter
        const matchesSearch = !searchTerm || 
            classItem.name.toLowerCase().includes(searchTerm) ||
            classItem.id.toLowerCase().includes(searchTerm);
        
        // Academic year filter
        const matchesAcademicYear = !academicYearFilterValue || 
            classItem.academic_year === academicYearFilterValue;
        
        // Subject filter
        const matchesSubject = !subjectFilterValue || 
            classItem.subjects.includes(subjectFilterValue);
        
        // Status filter
        const matchesStatus = !statusFilterValue || 
            classItem.status === statusFilterValue;
        
        return matchesSearch && matchesAcademicYear && matchesSubject && matchesStatus;
    });
    
    currentPage = 1;
    displayClasses();
    updatePagination();
}

// ========================================
// PAGINATION FUNCTIONS
// ========================================

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayClasses();
        updatePagination();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        displayClasses();
        updatePagination();
    }
}

// ========================================
// MODAL FUNCTIONS
// ========================================

function openAddClassModal() {
    document.getElementById("addClassModal").style.display = "block";
    selectedSubjects = [];
    updateSelectedSubjectsDisplay(false);
    resetAddClassForm();
}

function closeAddClassModal() {
    document.getElementById("addClassModal").style.display = "none";
    selectedSubjects = [];
    updateSelectedSubjectsDisplay(false);
}

function openEditClassModal() {
    document.getElementById("editClassModal").style.display = "block";
}

function closeEditClassModal() {
    document.getElementById("editClassModal").style.display = "none";
    editingClassId = null;
    selectedSubjects = [];
    updateSelectedSubjectsDisplay(true);
}

function openViewClassModal() {
    document.getElementById("viewClassModal").style.display = "block";
}

function closeViewClassModal() {
    document.getElementById("viewClassModal").style.display = "none";
}

function openSubjectSelector() {
    isSubjectSelectorInEditMode = false;
    document.getElementById("subjectSelectorModal").style.display = "block";
    displaySubjectsGrid(false);
}

function closeSubjectSelector() {
    document.getElementById("subjectSelectorModal").style.display = "none";
    // Clear search input
    const subjectSearch = document.getElementById("subjectSearch");
    if (subjectSearch) {
        subjectSearch.value = "";
    }
}

function openEditSubjectSelector() {
    isSubjectSelectorInEditMode = true;
    document.getElementById("subjectSelectorModal").style.display = "block";
    displaySubjectsGrid(true);
}

function openAcademicYearModal() {
    document.getElementById("academicYearModal").style.display = "block";
}

function closeAcademicYearModal() {
    document.getElementById("academicYearModal").style.display = "none";
}

function openPromoteClassesModal() {
    document.getElementById("promoteClassesModal").style.display = "block";
    loadPromoteClassesData();
}

function closePromoteClassesModal() {
    document.getElementById("promoteClassesModal").style.display = "none";
}

function openDeleteModal() {
    document.getElementById("deleteModal").style.display = "block";
}

function closeDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
}

// ========================================
// FORM HANDLING FUNCTIONS
// ========================================

async function handleAddClass(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const classData = {
        id: formData.get("class_id"),
        name: formData.get("class_name"),
        academic_year: formData.get("academic_year"),
        subjects: selectedSubjects,
        description: formData.get("description"),
        status: "active",
        students_count: 0,
        male_students: 0,
        female_students: 0,
        created_date: new Date().toISOString().split("T")[0]
    };
    
    try {
        showLoading();
        
        // Validate data
        if (!classData.id || !classData.name || !classData.academic_year || selectedSubjects.length === 0) {
            throw new Error("Please fill in all required fields");
        }
        
        // Check if class ID already exists
        if (allClasses.find(c => c.id === classData.id)) {
            throw new Error("Class ID already exists");
        }
        
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Add to local array
        allClasses.push(classData);
        filteredClasses = [...allClasses];
        
        // Update display
        applyFilters();
        displayClasses();
        updatePagination();
        
        // Close modal and show success message
        closeAddClassModal();
        showMessage("Class created successfully!", "success");
        
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        hideLoading();
    }
}

async function handleEditClass(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const classData = {
        id: editingClassId,
        name: formData.get("class_name"),
        academic_year: formData.get("academic_year"),
        subjects: selectedSubjects,
        description: formData.get("description"),
        status: formData.get("status")
    };
    
    try {
        showLoading();
        
        // Validate data
        if (!classData.name || !classData.academic_year || selectedSubjects.length === 0) {
            throw new Error("Please fill in all required fields");
        }
        
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update local array
        const index = allClasses.findIndex(c => c.id === editingClassId);
        if (index !== -1) {
            allClasses[index] = { ...allClasses[index], ...classData };
            filteredClasses = [...allClasses];
        }
        
        // Update display
        applyFilters();
        displayClasses();
        updatePagination();
        
        // Close modal and show success message
        closeEditClassModal();
        showMessage("Class updated successfully!", "success");
        
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        hideLoading();
    }
}

async function handleSetAcademicYear(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const academicYear = formData.get("academic_year");
    
    try {
        showLoading();
        
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        currentAcademicYear = academicYear;
        setCurrentAcademicYear();
        
        // Close modal and show success message
        closeAcademicYearModal();
        showMessage("Academic year updated successfully!", "success");
        
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        hideLoading();
    }
}

// ========================================
// CRUD OPERATIONS
// ========================================

function viewClass(classId) {
    const classItem = allClasses.find(c => c.id === classId);
    if (!classItem) {
        showMessage("Class not found", "error");
        return;
    }
    
    // Set current viewing class ID for students modal
    currentViewingClassId = classId;
    
    // Load actual student count for this class
    loadActualStudentCount(classId).then(() => {
        // Populate view modal with updated data
        document.getElementById("viewClassName").textContent = classItem.name;
        document.getElementById("viewClassId").querySelector("span").textContent = classItem.id;
        document.getElementById("viewClassIdValue").textContent = classItem.id;
        document.getElementById("viewClassNameValue").textContent = classItem.name;
        document.getElementById("viewAcademicYearValue").textContent = classItem.academic_year;
        document.getElementById("viewTotalStudents").textContent = classItem.students_count;
        document.getElementById("viewMaleStudents").textContent = classItem.male_students;
        document.getElementById("viewFemaleStudents").textContent = classItem.female_students;
        document.getElementById("viewStatus").textContent = classItem.status;
        document.getElementById("viewStatus").className = `value status-badge status-${classItem.status}`;
        
        // Display subjects
        const subjectsList = document.getElementById("viewSubjectsList");
        subjectsList.innerHTML = "";
        getSubjectNames(classItem.subjects).forEach(subjectName => {
            const subjectSpan = document.createElement("span");
            subjectSpan.className = "subject-display";
            subjectSpan.textContent = subjectName;
            subjectsList.appendChild(subjectSpan);
        });
        
        openViewClassModal();
    });
}

async function loadActualStudentCount(classId) {
    try {
        // Simulate API call to get actual student count
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - replace with actual API call
        const mockStudentCounts = {
            "CLASS001": 25,
            "CLASS002": 28,
            "CLASS003": 22,
            "CLASS004": 20
        };
        
        const actualCount = mockStudentCounts[classId] || 0;
        
        // Update the class with actual count
        const classIndex = allClasses.findIndex(c => c.id === classId);
        if (classIndex !== -1) {
            allClasses[classIndex].students_count = actualCount;
            
            // Calculate gender distribution (mock data)
            const maleCount = Math.floor(actualCount * 0.6); // 60% male
            const femaleCount = actualCount - maleCount;
            
            allClasses[classIndex].male_students = maleCount;
            allClasses[classIndex].female_students = femaleCount;
        }
        
    } catch (error) {
        console.error("Error loading student count:", error);
    }
}

async function loadAllClassStudentCounts() {
    try {
        // Simulate API call to get actual student counts for all classes
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data - replace with actual API call
        const mockStudentCounts = {
            "CLASS001": 25,
            "CLASS002": 28,
            "CLASS003": 22,
            "CLASS004": 20
        };
        
        // Update all classes with actual counts
        allClasses.forEach(classItem => {
            const actualCount = mockStudentCounts[classItem.id] || 0;
            classItem.students_count = actualCount;
            
            // Calculate gender distribution (mock data)
            const maleCount = Math.floor(actualCount * 0.6); // 60% male
            const femaleCount = actualCount - maleCount;
            
            classItem.male_students = maleCount;
            classItem.female_students = femaleCount;
        });
        
        // Update the filtered classes array
        filteredClasses = [...allClasses];
        
        // Update the display
        displayClasses();
        updatePagination();
        
    } catch (error) {
        console.error("Error loading all student counts:", error);
    }
}

function editClass(classId) {
    const classItem = allClasses.find(c => c.id === classId);
    if (!classItem) {
        showMessage("Class not found", "error");
        return;
    }
    
    editingClassId = classId;
    selectedSubjects = [...classItem.subjects];
    
    // Populate edit form
    document.getElementById("editClassId").value = classItem.id;
    document.getElementById("editClassName").value = classItem.name;
    document.getElementById("editAcademicYear").value = classItem.academic_year;
    document.getElementById("editClassDescription").value = classItem.description || "";
    document.getElementById("editClassStatus").value = classItem.status;
    
    updateSelectedSubjectsDisplay(true);
    openEditClassModal();
}

function deleteClass(classId) {
    const classItem = allClasses.find(c => c.id === classId);
    if (!classItem) {
        showMessage("Class not found", "error");
        return;
    }
    
    // Store class ID for deletion confirmation
    window.classToDelete = classId;
    openDeleteModal();
}

async function confirmDelete() {
    const classId = window.classToDelete;
    
    try {
        showLoading();
        
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove from local array
        allClasses = allClasses.filter(c => c.id !== classId);
        filteredClasses = [...allClasses];
        
        // Update display
        applyFilters();
        displayClasses();
        updatePagination();
        
        // Close modal and show success message
        closeDeleteModal();
        showMessage("Class deleted successfully!", "success");
        
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        hideLoading();
    }
}

// ========================================
// SUBJECT MANAGEMENT
// ========================================

function displaySubjectsGrid(isEdit = false) {
    const subjectsGrid = document.getElementById("subjectsGrid");
    if (!subjectsGrid) return;
    
    subjectsGrid.innerHTML = "";
    
    // Clear any existing search
    const subjectSearch = document.getElementById("subjectSearch");
    if (subjectSearch) {
        subjectSearch.value = "";
    }
    
    allSubjects.forEach(subject => {
        const subjectItem = document.createElement("div");
        subjectItem.className = "subject-item";
        if (selectedSubjects.includes(subject.id)) {
            subjectItem.classList.add("selected");
        }
        
        subjectItem.innerHTML = `
            <strong>${subject.name}</strong>
            <small>${subject.code}</small>
        `;
        
        subjectItem.addEventListener("click", () => {
            if (selectedSubjects.includes(subject.id)) {
                selectedSubjects = selectedSubjects.filter(id => id !== subject.id);
                subjectItem.classList.remove("selected");
            } else {
                selectedSubjects.push(subject.id);
                subjectItem.classList.add("selected");
            }
        });
        
        subjectsGrid.appendChild(subjectItem);
    });
}

function updateSelectedSubjectsDisplay(isEdit = false) {
    const containerId = isEdit ? "editSelectedSubjects" : "selectedSubjects";
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";
    
    selectedSubjects.forEach(subjectId => {
        const subject = allSubjects.find(s => s.id === subjectId);
        if (subject) {
            const subjectTag = document.createElement("div");
            subjectTag.className = "subject-tag";
            subjectTag.innerHTML = `
                ${subject.name}
                <span class="remove-subject" onclick="removeSubject('${subjectId}', ${isEdit})">&times;</span>
            `;
            container.appendChild(subjectTag);
        }
    });
}

function removeSubject(subjectId, isEdit = false) {
    selectedSubjects = selectedSubjects.filter(id => id !== subjectId);
    updateSelectedSubjectsDisplay(isEdit);
}

function resetSubjectSelection() {
    selectedSubjects = [];
    updateSelectedSubjectsDisplay(false);
}

function confirmSubjectSelection() {
    updateSelectedSubjectsDisplay(isSubjectSelectorInEditMode);
    closeSubjectSelector();
}

function handleSubjectSearch() {
    const searchTerm = document.getElementById("subjectSearch").value.toLowerCase();
    const subjectItems = document.querySelectorAll(".subject-item");
    
    subjectItems.forEach(item => {
        const subjectName = item.querySelector("strong").textContent.toLowerCase();
        const subjectCode = item.querySelector("small").textContent.toLowerCase();
        
        if (subjectName.includes(searchTerm) || subjectCode.includes(searchTerm)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

// ========================================
// ACADEMIC YEAR AND PROMOTION
// ========================================

function populateAcademicYearSelects(academicYears) {
    const selects = [
        "academicYear",
        "editAcademicYear",
        "newAcademicYear",
        "academicYearFilter",
        "promoteFromYear",
        "promoteToYear"
    ];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = "<option value=\"\">Select Academic Year</option>";
            academicYears.forEach(year => {
                const option = document.createElement("option");
                option.value = year.id;
                option.textContent = year.name;
                select.appendChild(option);
            });
        }
    });
}

function populateSubjectFilter(subjects) {
    if (subjectFilter) {
        subjectFilter.innerHTML = "<option value=\"\">All Subjects</option>";
        subjects.forEach(subject => {
            const option = document.createElement("option");
            option.value = subject.id;
            option.textContent = subject.name;
            subjectFilter.appendChild(option);
        });
    }
}

function promoteClasses() {
    openPromoteClassesModal();
}

function loadPromoteClassesData() {
    const activeClasses = allClasses.filter(c => c.status === "active");
    const promoteList = document.getElementById("promoteClassesList");
    
    if (activeClasses.length === 0) {
        promoteList.innerHTML = "<p>No active classes to promote.</p>";
        return;
    }
    
    promoteList.innerHTML = "";
    activeClasses.forEach(classItem => {
        const classDiv = document.createElement("div");
        classDiv.className = "promote-class-item";
        classDiv.innerHTML = `
            <span>${classItem.name} (${classItem.id})</span>
            <span>${classItem.students_count} students</span>
        `;
        promoteList.appendChild(classDiv);
    });
}

async function confirmPromoteClasses() {
    const fromYear = document.getElementById("promoteFromYear").value;
    const toYear = document.getElementById("promoteToYear").value;
    
    if (!fromYear || !toYear) {
        showMessage("Please select both academic years", "error");
        return;
    }
    
    if (fromYear === toYear) {
        showMessage("From and To years must be different", "error");
        return;
    }
    
    try {
        showLoading();
        
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update classes in local array
        allClasses.forEach(classItem => {
            if (classItem.academic_year === fromYear && classItem.status === "active") {
                classItem.academic_year = toYear;
            }
        });
        
        filteredClasses = [...allClasses];
        applyFilters();
        displayClasses();
        updatePagination();
        
        closePromoteClassesModal();
        showMessage("Classes promoted successfully!", "success");
        
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        hideLoading();
    }
}

function archiveClasses() {
    // Implementation for archiving classes
    showMessage("Archive functionality coming soon!", "success");
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoading() {
    document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading() {
    document.getElementById("loadingOverlay").style.display = "none";
}

function showMessage(message, type = "success") {
    const messageContainer = document.getElementById("messageContainer");
    const messageElement = document.createElement("div");
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
        <span>${message}</span>
    `;
    
    messageContainer.appendChild(messageElement);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

function resetAddClassForm() {
    document.getElementById("addClassForm").reset();
    selectedSubjects = [];
    updateSelectedSubjectsDisplay();
}

function editFromView() {
    closeViewClassModal();
    editClass(editingClassId);
}

function viewStudents() {
    // Get the current class being viewed
    const classItem = allClasses.find(c => c.id === currentViewingClassId);
    if (!classItem) {
        showMessage("Class not found", "error");
        return;
    }
    
    // Load students for this class (simulate API call)
    loadClassStudents(classItem.id);
    
    // Populate modal header with updated student count
    document.getElementById("studentsClassName").textContent = classItem.name;
    document.getElementById("studentsClassInfo").textContent = 
        `${currentClassStudents.length} students • ${classItem.academic_year} • ${classItem.subjects.length} subjects`;
    
    // Open students modal
    openViewStudentsModal();
}

function openViewStudentsModal() {
    document.getElementById("viewStudentsModal").style.display = "block";
}

function closeViewStudentsModal() {
    document.getElementById("viewStudentsModal").style.display = "none";
    currentStudentsPage = 1;
    currentClassStudents = [];
    filteredStudents = [];
    currentViewingClassId = null;
}

async function loadClassStudents(classId) {
    try {
        showLoading();
        
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // TODO: Replace with actual API call to load students for the class
        currentClassStudents = [];
        
        filteredStudents = [...currentClassStudents];
        currentViewingClassId = classId;
        
        // Update the class with actual student count
        updateClassStudentCount(classId, currentClassStudents.length);
        
        // Set up event listeners for student search and filter
        setupStudentEventListeners();
        
        // Display students
        displayStudents();
        updateStudentsPagination();
        
    } catch (error) {
        showMessage("Error loading students: " + error.message, "error");
    } finally {
        hideLoading();
    }
}

function setupStudentEventListeners() {
    // Student search
    const studentSearchInput = document.getElementById("studentSearchInput");
    if (studentSearchInput) {
        studentSearchInput.addEventListener("input", debounce(handleStudentSearch, 300));
    }
    
    // Student filters
    const studentGenderFilter = document.getElementById("studentGenderFilter");
    const studentStatusFilter = document.getElementById("studentStatusFilter");
    
    if (studentGenderFilter) {
        studentGenderFilter.addEventListener("change", handleStudentFilter);
    }
    
    if (studentStatusFilter) {
        studentStatusFilter.addEventListener("change", handleStudentFilter);
    }
}

function handleStudentSearch() {
    const searchTerm = document.getElementById("studentSearchInput").value.toLowerCase();
    applyStudentFilters();
}

function handleStudentFilter() {
    applyStudentFilters();
}

function applyStudentFilters() {
    const searchTerm = document.getElementById("studentSearchInput").value.toLowerCase();
    const genderFilter = document.getElementById("studentGenderFilter").value;
    const statusFilter = document.getElementById("studentStatusFilter").value;
    
    filteredStudents = currentClassStudents.filter(student => {
        // Search term filter
        const matchesSearch = !searchTerm || 
            student.fullName.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            student.id.toLowerCase().includes(searchTerm);
        
        // Gender filter
        const matchesGender = !genderFilter || student.gender === genderFilter;
        
        // Status filter
        const matchesStatus = !statusFilter || student.status === statusFilter;
        
        return matchesSearch && matchesGender && matchesStatus;
    });
    
    currentStudentsPage = 1;
    displayStudents();
    updateStudentsPagination();
}

function displayStudents() {
    const startIndex = (currentStudentsPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const studentsToShow = filteredStudents.slice(startIndex, endIndex);
    
    const studentsTableBody = document.getElementById("studentsTableBody");
    studentsTableBody.innerHTML = "";
    
    if (studentsToShow.length === 0) {
        studentsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Students Found</h3>
                    <p>No students match your current search criteria.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    studentsToShow.forEach(student => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${student.id}</strong></td>
            <td>${student.fullName}</td>
            <td>${student.email}</td>
            <td><span class="gender-badge gender-${student.gender}">${student.gender}</span></td>
            <td><span class="status-badge status-${student.status}">${student.status}</span></td>
            <td>
                <button class="action-btn view-btn" onclick="viewStudentDetails('${student.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-btn" onclick="editStudent('${student.id}')" title="Edit Student">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="removeStudentFromClass('${student.id}')" title="Remove from Class">
                    <i class="fas fa-user-minus"></i>
                </button>
            </td>
        `;
        studentsTableBody.appendChild(row);
    });
}

function updateStudentsPagination() {
    totalStudentsPages = Math.ceil(filteredStudents.length / studentsPerPage);
    document.getElementById("studentsPageInfo").textContent = `Page ${currentStudentsPage} of ${totalStudentsPages}`;
    
    // Update pagination button states
    const prevBtn = document.querySelector("#viewStudentsModal .pagination-btn:first-child");
    const nextBtn = document.querySelector("#viewStudentsModal .pagination-btn:last-child");
    
    if (prevBtn) prevBtn.disabled = currentStudentsPage === 1;
    if (nextBtn) nextBtn.disabled = currentStudentsPage === totalStudentsPages;
}

function previousStudentsPage() {
    if (currentStudentsPage > 1) {
        currentStudentsPage--;
        displayStudents();
        updateStudentsPagination();
    }
}

function nextStudentsPage() {
    if (currentStudentsPage < totalStudentsPages) {
        currentStudentsPage++;
        displayStudents();
        updateStudentsPagination();
    }
}

function viewStudentDetails(studentId) {
    // Implementation for viewing individual student details
    showMessage("Student details view coming soon!", "success");
}

function editStudent(studentId) {
    // Implementation for editing student
    showMessage("Student edit functionality coming soon!", "success");
}

function removeStudentFromClass(studentId) {
    // Implementation for removing student from class
    showMessage("Remove student functionality coming soon!", "success");
}

function addStudentToClass() {
    // Implementation for adding student to class
    showMessage("Add student functionality coming soon!", "success");
}

function exportStudentsList() {
    // Implementation for exporting students list
    showMessage("Export functionality coming soon!", "success");
}

function updateClassStudentCount(classId, studentCount) {
    // Update the class in the main array
    const classIndex = allClasses.findIndex(c => c.id === classId);
    if (classIndex !== -1) {
        allClasses[classIndex].students_count = studentCount;
        
        // Calculate gender distribution
        const maleCount = currentClassStudents.filter(s => s.gender === "male").length;
        const femaleCount = currentClassStudents.filter(s => s.gender === "female").length;
        
        allClasses[classIndex].male_students = maleCount;
        allClasses[classIndex].female_students = femaleCount;
        
        // Update the filtered classes array
        filteredClasses = [...allClasses];
        
        // Update the display
        applyFilters();
        displayClasses();
        updatePagination();
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll(".modal");
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
};

// Close modals with Escape key
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        const modals = document.querySelectorAll(".modal");
        modals.forEach(modal => {
            if (modal.style.display === "block") {
                modal.style.display = "none";
            }
        });
    }
}); 