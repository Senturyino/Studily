// Global variables
let academicYears = [];
let filteredAcademicYears = [];
let currentPage = 1;
let academicYearsPerPage = 10;
let currentAcademicYearToDelete = null;
let currentViewAcademicYearId = null;

// Database containers (replace with actual API calls)
let academicYearsDB = [];

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    loadAcademicYears();
    setupEventListeners();
    renderAcademicYears();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById("searchInput").addEventListener("input", function() {
        filterAcademicYears();
    });

    // Filter functionality
    document.getElementById("statusFilter").addEventListener("change", function() {
        filterAcademicYears();
    });

    document.getElementById("yearFilter").addEventListener("change", function() {
        filterAcademicYears();
    });

    // Form submissions
    document.getElementById("createForm").addEventListener("submit", function(e) {
        e.preventDefault();
        createAcademicYear();
    });

    document.getElementById("editForm").addEventListener("submit", function(e) {
        e.preventDefault();
        updateAcademicYear();
    });

    // Modal close on outside click
    window.addEventListener("click", function(event) {
        if (event.target.classList.contains("modal")) {
            closeAllModals();
        }
    });
}

// Load academic years from database
function loadAcademicYears() {
    // Simulate API call
    academicYears = [...academicYearsDB];
    filteredAcademicYears = [...academicYears];
    
    // Populate year filter
    const yearFilter = document.getElementById("yearFilter");
    const uniqueYears = [...new Set(academicYears.map(year => year.acc_year))];
    
    uniqueYears.forEach(year => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

// Filter academic years based on search and filters
function filterAcademicYears() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;
    const yearFilter = document.getElementById("yearFilter").value;

    filteredAcademicYears = academicYears.filter(year => {
        const matchesSearch = year.year_name.toLowerCase().includes(searchTerm) ||
                            year.acc_year.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || year.status === statusFilter;
        const matchesYear = !yearFilter || year.acc_year === yearFilter;

        return matchesSearch && matchesStatus && matchesYear;
    });

    currentPage = 1;
    renderAcademicYears();
}

// Render academic years table
function renderAcademicYears() {
    const tableBody = document.getElementById("academicYearsTableBody");
    const startIndex = (currentPage - 1) * academicYearsPerPage;
    const endIndex = startIndex + academicYearsPerPage;
    const yearsToShow = filteredAcademicYears.slice(startIndex, endIndex);

    if (yearsToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <h3>No academic years found</h3>
                    <p>Try adjusting your search or filters</p>
                </td>
            </tr>
        `;
        updatePagination();
        return;
    }

    tableBody.innerHTML = yearsToShow.map(year => {
        const semesterCount = year.semesters ? year.semesters.length : 0;
        const formattedStartDate = formatDate(year.start_date);
        const formattedEndDate = formatDate(year.end_date);
        
        return `
            <tr>
                <td><strong>${year.acc_year}</strong><br><small>${year.year_name}</small></td>
                <td>${formattedStartDate}</td>
                <td>${formattedEndDate}</td>
                <td>${semesterCount} semester${semesterCount !== 1 ? "s" : ""}</td>
                <td><span class="status-badge status-${year.status}">${year.status}</span></td>
                <td>
                    <button class="action-btn view-btn" onclick="viewAcademicYear('${year.acc_year}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editAcademicYear('${year.acc_year}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteAcademicYear('${year.acc_year}')" title="Delete">
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
    const totalPages = Math.ceil(filteredAcademicYears.length / academicYearsPerPage);
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
        renderAcademicYears();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredAcademicYears.length / academicYearsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderAcademicYears();
    }
}

// Modal functions
function openCreateModal() {
    document.getElementById("createModal").style.display = "block";
    resetCreateForm();
}

function closeCreateModal() {
    document.getElementById("createModal").style.display = "none";
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
}

function openViewModal() {
    document.getElementById("viewModal").style.display = "block";
}

function closeViewModal() {
    document.getElementById("viewModal").style.display = "none";
}

function closeAllModals() {
    const modals = document.querySelectorAll(".modal");
    modals.forEach(modal => {
        modal.style.display = "none";
    });
}

// Reset create form
function resetCreateForm() {
    document.getElementById("createForm").reset();
    const semestersContainer = document.getElementById("semestersContainer");
    semestersContainer.innerHTML = `
        <div class="semester-item">
            <div class="semester-row">
                <input type="text" name="semester_names[]" placeholder="Semester Name (e.g., First Semester)" required>
                <input type="date" name="semester_start_dates[]" required>
                <input type="date" name="semester_end_dates[]" required>
                <button type="button" class="btn-remove-semester" onclick="removeSemester(this)" title="Remove Semester">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Semester management functions
function addSemester() {
    const container = document.getElementById("semestersContainer");
    const semesterItem = document.createElement("div");
    semesterItem.className = "semester-item";
    semesterItem.innerHTML = `
        <div class="semester-row">
            <input type="text" name="semester_names[]" placeholder="Semester Name (e.g., First Semester)" required>
            <input type="date" name="semester_start_dates[]" required>
            <input type="date" name="semester_end_dates[]" required>
            <button type="button" class="btn-remove-semester" onclick="removeSemester(this)" title="Remove Semester">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(semesterItem);
}

function addEditSemester() {
    const container = document.getElementById("editSemestersContainer");
    const semesterItem = document.createElement("div");
    semesterItem.className = "semester-item";
    semesterItem.innerHTML = `
        <div class="semester-row">
            <input type="text" name="semester_names[]" placeholder="Semester Name (e.g., First Semester)" required>
            <input type="date" name="semester_start_dates[]" required>
            <input type="date" name="semester_end_dates[]" required>
            <button type="button" class="btn-remove-semester" onclick="removeSemester(this)" title="Remove Semester">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(semesterItem);
}

function removeSemester(button) {
    const semesterItem = button.closest(".semester-item");
    const container = semesterItem.parentElement;
    
    // Don't remove if it's the last semester
    if (container.children.length > 1) {
        semesterItem.remove();
    } else {
        showMessage("At least one semester is required.", "error");
    }
}

// Create academic year
function createAcademicYear() {
    const form = document.getElementById("createForm");
    const formData = new FormData(form);
    
    // Validate form data
    const academicYear = formData.get("acc_year");
    const yearName = formData.get("year_name");
    const startDate = formData.get("start_date");
    const endDate = formData.get("end_date");
    const status = formData.get("status");
    
    if (!academicYear || !yearName || !startDate || !endDate || !status) {
        showMessage("Please fill in all required fields.", "error");
        return;
    }
    
    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
        showMessage("End date must be after start date.", "error");
        return;
    }
    
    // Collect semester data
    const semesterNames = formData.getAll("semester_names[]");
    const semesterStartDates = formData.getAll("semester_start_dates[]");
    const semesterEndDates = formData.getAll("semester_end_dates[]");
    
    const semesters = [];
    for (let i = 0; i < semesterNames.length; i++) {
        if (semesterNames[i] && semesterStartDates[i] && semesterEndDates[i]) {
            semesters.push({
                name: semesterNames[i],
                start_date: semesterStartDates[i],
                end_date: semesterEndDates[i]
            });
        }
    }
    
    if (semesters.length === 0) {
        showMessage("At least one semester is required.", "error");
        return;
    }
    
    // Check if academic year already exists
    if (academicYears.find(year => year.acc_year === academicYear)) {
        showMessage("Academic year already exists.", "error");
        return;
    }
    
    // Create new academic year
    const newAcademicYear = {
        acc_year: academicYear,
        year_name: yearName,
        start_date: startDate,
        end_date: endDate,
        status: status,
        semesters: semesters
    };
    
    // Add to database (simulate API call)
    academicYearsDB.push(newAcademicYear);
    academicYears.push(newAcademicYear);
    
    // Update filtered results
    filterAcademicYears();
    
    // Close modal and show success message
    closeCreateModal();
    showMessage("Academic year created successfully!", "success");
}

// Edit academic year
function editAcademicYear(academicYearId) {
    const academicYear = academicYears.find(year => year.acc_year === academicYearId);
    if (!academicYear) {
        showMessage("Academic year not found.", "error");
        return;
    }
    
    // Populate edit form
    document.getElementById("editAcademicYearId").value = academicYear.acc_year;
    document.getElementById("editYearName").value = academicYear.year_name;
    document.getElementById("editStartDate").value = academicYear.start_date;
    document.getElementById("editEndDate").value = academicYear.end_date;
    document.getElementById("editStatus").value = academicYear.status;
    
    // Populate semesters
    const editSemestersContainer = document.getElementById("editSemestersContainer");
    editSemestersContainer.innerHTML = "";
    
    academicYear.semesters.forEach(semester => {
        const semesterItem = document.createElement("div");
        semesterItem.className = "semester-item";
        semesterItem.innerHTML = `
            <div class="semester-row">
                <input type="text" name="semester_names[]" value="${semester.name}" required>
                <input type="date" name="semester_start_dates[]" value="${semester.start_date}" required>
                <input type="date" name="semester_end_dates[]" value="${semester.end_date}" required>
                <button type="button" class="btn-remove-semester" onclick="removeSemester(this)" title="Remove Semester">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        editSemestersContainer.appendChild(semesterItem);
    });
    
    openEditModal();
}

// Update academic year
function updateAcademicYear() {
    const form = document.getElementById("editForm");
    const formData = new FormData(form);
    
    const academicYearId = formData.get("acc_year");
    const yearName = formData.get("year_name");
    const startDate = formData.get("start_date");
    const endDate = formData.get("end_date");
    const status = formData.get("status");
    
    if (!yearName || !startDate || !endDate || !status) {
        showMessage("Please fill in all required fields.", "error");
        return;
    }
    
    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
        showMessage("End date must be after start date.", "error");
        return;
    }
    
    // Collect semester data
    const semesterNames = formData.getAll("semester_names[]");
    const semesterStartDates = formData.getAll("semester_start_dates[]");
    const semesterEndDates = formData.getAll("semester_end_dates[]");
    
    const semesters = [];
    for (let i = 0; i < semesterNames.length; i++) {
        if (semesterNames[i] && semesterStartDates[i] && semesterEndDates[i]) {
            semesters.push({
                name: semesterNames[i],
                start_date: semesterStartDates[i],
                end_date: semesterEndDates[i]
            });
        }
    }
    
    if (semesters.length === 0) {
        showMessage("At least one semester is required.", "error");
        return;
    }
    
    // Find and update academic year
    const yearIndex = academicYears.findIndex(year => year.acc_year === academicYearId);
    if (yearIndex === -1) {
        showMessage("Academic year not found.", "error");
        return;
    }
    
    // Update academic year
    academicYears[yearIndex] = {
        ...academicYears[yearIndex],
        year_name: yearName,
        start_date: startDate,
        end_date: endDate,
        status: status,
        semesters: semesters
    };
    
    // Update database (simulate API call)
    const dbIndex = academicYearsDB.findIndex(year => year.acc_year === academicYearId);
    if (dbIndex !== -1) {
        academicYearsDB[dbIndex] = academicYears[yearIndex];
    }
    
    // Update filtered results
    filterAcademicYears();
    
    // Close modal and show success message
    closeEditModal();
    showMessage("Academic year updated successfully!", "success");
}

// Delete academic year
function deleteAcademicYear(academicYearId) {
    const academicYear = academicYears.find(year => year.acc_year === academicYearId);
    if (!academicYear) {
        showMessage("Academic year not found.", "error");
        return;
    }
    
    currentAcademicYearToDelete = academicYearId;
    document.getElementById("deleteYearName").textContent = academicYear.year_name;
    openDeleteModal();
}

// Confirm delete
function confirmDelete() {
    if (!currentAcademicYearToDelete) {
        showMessage("No academic year selected for deletion.", "error");
        return;
    }
    
    // Remove from arrays
    academicYears = academicYears.filter(year => year.acc_year !== currentAcademicYearToDelete);
    academicYearsDB = academicYearsDB.filter(year => year.acc_year !== currentAcademicYearToDelete);
    
    // Update filtered results
    filterAcademicYears();
    
    // Close modal and show success message
    closeDeleteModal();
    showMessage("Academic year deleted successfully!", "success");
    currentAcademicYearToDelete = null;
}

// View academic year details
function viewAcademicYear(academicYearId) {
    const academicYear = academicYears.find(year => year.acc_year === academicYearId);
    if (!academicYear) {
        showMessage("Academic year not found.", "error");
        return;
    }
    
    currentViewAcademicYearId = academicYearId;
    
    // Populate view modal
    document.getElementById("viewYearName").textContent = academicYear.year_name;
    document.getElementById("viewAcademicYearId").querySelector("span").textContent = academicYear.acc_year;
    document.getElementById("viewAcademicYear").textContent = academicYear.acc_year;
    document.getElementById("viewYearNameDetail").textContent = academicYear.year_name;
    document.getElementById("viewStartDate").textContent = formatDate(academicYear.start_date);
    document.getElementById("viewEndDate").textContent = formatDate(academicYear.end_date);
    document.getElementById("viewStatus").textContent = academicYear.status;
    document.getElementById("viewStatus").className = `value status-badge status-${academicYear.status}`;
    
    // Calculate duration
    const startDate = new Date(academicYear.start_date);
    const endDate = new Date(academicYear.end_date);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    document.getElementById("viewDuration").textContent = `${duration} days`;
    
    // Populate semesters
    const viewSemesters = document.getElementById("viewSemesters");
    viewSemesters.innerHTML = "";
    
    if (academicYear.semesters && academicYear.semesters.length > 0) {
        academicYear.semesters.forEach(semester => {
            const semesterDetail = document.createElement("div");
            semesterDetail.className = "semester-detail";
            semesterDetail.innerHTML = `
                <h5>${semester.name}</h5>
                <p>${formatDate(semester.start_date)} - ${formatDate(semester.end_date)}</p>
            `;
            viewSemesters.appendChild(semesterDetail);
        });
    } else {
        viewSemesters.innerHTML = "<p>No semesters defined</p>";
    }
    
    // Update statistics
    document.getElementById("viewTotalSemesters").textContent = academicYear.semesters ? academicYear.semesters.length : 0;
    document.getElementById("viewActiveStudents").textContent = "--"; // Would be calculated from database
    document.getElementById("viewClasses").textContent = "--"; // Would be calculated from database
    
    openViewModal();
}

// Edit from view modal
function editFromView() {
    if (currentViewAcademicYearId) {
        closeViewModal();
        editAcademicYear(currentViewAcademicYearId);
    }
}

// Delete from view modal
function deleteFromView() {
    if (currentViewAcademicYearId) {
        closeViewModal();
        deleteAcademicYear(currentViewAcademicYearId);
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll(".message");
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert after header
    const header = document.querySelector(".header");
    header.parentNode.insertBefore(messageDiv, header.nextSibling);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Export functions for global access
window.openCreateModal = openCreateModal;
window.closeCreateModal = closeCreateModal;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.openViewModal = openViewModal;
window.closeViewModal = closeViewModal;
window.closeAllModals = closeAllModals;
window.addSemester = addSemester;
window.addEditSemester = addEditSemester;
window.removeSemester = removeSemester;
window.createAcademicYear = createAcademicYear;
window.updateAcademicYear = updateAcademicYear;
window.deleteAcademicYear = deleteAcademicYear;
window.confirmDelete = confirmDelete;
window.viewAcademicYear = viewAcademicYear;
window.editFromView = editFromView;
window.deleteFromView = deleteFromView;
window.previousPage = previousPage;
window.nextPage = nextPage; 