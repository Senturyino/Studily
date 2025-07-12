// Fees Management JavaScript

// Global variables
let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;
let feesData = [];
let students = [];
let academicYears = [];
let classes = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

async function initializePage() {
    try {
        await Promise.all([
            loadDashboardStats(),
            loadStudents(),
            loadAcademicYears(),
            loadClasses(),
            loadFeesData()
        ]);
        
        setupEventListeners();
        updateDashboardCards();
    } catch (error) {
        console.error('Error initializing page:', error);
        showMessage('Error loading data. Please refresh the page.', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Student search functionality
    const studentSearchInput = document.getElementById('studentSearchInput');
    if (studentSearchInput) {
        studentSearchInput.addEventListener('input', debounce(handleStudentSearch, 300));
    }

    // Filter functionality
    const academicYearFilter = document.getElementById('academicYearFilter');
    const classFilter = document.getElementById('classFilter');
    const paymentStatusFilter = document.getElementById('paymentStatusFilter');

    if (academicYearFilter) {
        academicYearFilter.addEventListener('change', handleFilter);
    }
    if (classFilter) {
        classFilter.addEventListener('change', handleFilter);
    }
    if (paymentStatusFilter) {
        paymentStatusFilter.addEventListener('change', handleFilter);
    }

    // Form submissions
    const setFeesForm = document.getElementById('setFeesForm');
    const recordPaymentForm = document.getElementById('recordPaymentForm');

    if (setFeesForm) {
        setFeesForm.addEventListener('submit', handleSetFees);
    }
    if (recordPaymentForm) {
        recordPaymentForm.addEventListener('submit', handleRecordPayment);
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Simulate API call - replace with actual API endpoint
        const response = await fetch('/api/fees/dashboard-stats');
        const stats = await response.json();
        
        document.getElementById('totalStudents').textContent = stats.totalStudents || 0;
        document.getElementById('paidStudents').textContent = stats.paidStudents || 0;
        document.getElementById('pendingStudents').textContent = stats.pendingStudents || 0;
        document.getElementById('totalRevenue').textContent = `$${(stats.totalRevenue || 0).toLocaleString()}`;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Use mock data for demonstration
        updateDashboardCards();
    }
}

// Load students data
async function loadStudents() {
    try {
        // Simulate API call - replace with actual API endpoint
        const response = await fetch('/api/students');
        students = await response.json();
        
        // Populate student dropdowns
        populateStudentDropdowns();
    } catch (error) {
        console.error('Error loading students:', error);
        // Use mock data for demonstration
        students = getMockStudents();
        populateStudentDropdowns();
    }
}

// Load academic years
async function loadAcademicYears() {
    try {
        // Simulate API call - replace with actual API endpoint
        const response = await fetch('/api/academic-years');
        academicYears = await response.json();
        
        // Populate academic year dropdowns
        populateAcademicYearDropdowns();
    } catch (error) {
        console.error('Error loading academic years:', error);
        // Use mock data for demonstration
        academicYears = getMockAcademicYears();
        populateAcademicYearDropdowns();
    }
}

// Load classes
async function loadClasses() {
    try {
        // Simulate API call - replace with actual API endpoint
        const response = await fetch('/api/classes');
        classes = await response.json();
        
        // Populate class dropdowns
        populateClassDropdowns();
    } catch (error) {
        console.error('Error loading classes:', error);
        // Use mock data for demonstration
        classes = getMockClasses();
        populateClassDropdowns();
    }
}

// Load fees data
async function loadFeesData() {
    try {
        // Simulate API call - replace with actual API endpoint
        const response = await fetch('/api/fees');
        feesData = await response.json();
        
        renderFeesTable();
        updatePagination();
    } catch (error) {
        console.error('Error loading fees data:', error);
        // Use mock data for demonstration
        feesData = getMockFeesData();
        renderFeesTable();
        updatePagination();
    }
}

// Populate dropdowns
function populateStudentDropdowns() {
    const studentDropdowns = ['paymentStudent'];
    
    studentDropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.innerHTML = '<option value="">Select Student</option>';
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.Student_ID;
                option.textContent = `${student.St_Full_N} (${student.Student_ID})`;
                dropdown.appendChild(option);
            });
        }
    });
}

function populateAcademicYearDropdowns() {
    const yearDropdowns = ['academicYearFilter', 'feesAcademicYear', 'paymentAcademicYear'];
    
    yearDropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.innerHTML = '<option value="">Select Academic Year</option>';
            academicYears.forEach(year => {
                const option = document.createElement('option');
                option.value = year.acc_year;
                option.textContent = year.year_name;
                dropdown.appendChild(option);
            });
        }
    });
}

function populateClassDropdowns() {
    const classDropdowns = ['classFilter', 'feesClass'];
    
    classDropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.innerHTML = '<option value="">Select Class</option>';
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.class_id;
                option.textContent = cls.class_name;
                dropdown.appendChild(option);
            });
        }
    });
}

// Render fees table
function renderFeesTable() {
    const tableBody = document.getElementById('feesTableBody');
    if (!tableBody) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = feesData.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    if (pageData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-money-bill-wave"></i>
                    <h3>No fees data found</h3>
                    <p>Start by setting up fees structure for academic years and classes.</p>
                </td>
            </tr>
        `;
        return;
    }

    pageData.forEach(fee => {
        const row = document.createElement('tr');
        const balance = fee.total_fees - fee.paid_amount;
        const status = getPaymentStatus(fee.total_fees, fee.paid_amount);
        
        row.innerHTML = `
            <td>${fee.student_id}</td>
            <td>${fee.student_name}</td>
            <td>${fee.class_name}</td>
            <td>${fee.academic_year}</td>
            <td>GHC ${fee.total_fees.toLocaleString()}</td>
            <td>GHC ${fee.paid_amount.toLocaleString()}</td>
            <td>GHC ${balance.toLocaleString()}</td>
            <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-view" onclick="viewPaymentHistory('${fee.student_id}', '${fee.academic_year}')">
                        <i class="fas fa-history"></i> History
                    </button>
                    <button class="btn-edit" onclick="recordPayment('${fee.student_id}', '${fee.academic_year}')">
                        <i class="fas fa-plus"></i> Payment
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Get payment status
function getPaymentStatus(totalFees, paidAmount) {
    if (paidAmount >= totalFees) {
        return 'Paid';
    } else if (paidAmount > 0) {
        return 'Partial';
    } else {
        return 'Unpaid';
    }
}

// Update dashboard cards
function updateDashboardCards() {
    const totalStudents = feesData.length;
    const paidStudents = feesData.filter(fee => fee.paid_amount >= fee.total_fees).length;
    const pendingStudents = totalStudents - paidStudents;
    const totalRevenue = feesData.reduce((sum, fee) => sum + fee.paid_amount, 0);

    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('paidStudents').textContent = paidStudents;
    document.getElementById('pendingStudents').textContent = pendingStudents;
    document.getElementById('totalRevenue').textContent = `GHC ${totalRevenue.toLocaleString()}`;
}

// Update pagination
function updatePagination() {
    totalPages = Math.ceil(feesData.length / itemsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderFeesTable();
        updatePagination();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        renderFeesTable();
        updatePagination();
    }
}

// Search functionality
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filteredData = feesData.filter(fee => 
        fee.student_name.toLowerCase().includes(searchTerm) ||
        fee.student_id.toLowerCase().includes(searchTerm) ||
        fee.class_name.toLowerCase().includes(searchTerm)
    );
    
    renderFilteredTable(filteredData);
}

// Filter functionality
function handleFilter() {
    const academicYear = document.getElementById('academicYearFilter').value;
    const classFilter = document.getElementById('classFilter').value;
    const paymentStatus = document.getElementById('paymentStatusFilter').value;
    
    let filteredData = feesData;
    
    if (academicYear) {
        filteredData = filteredData.filter(fee => fee.academic_year === academicYear);
    }
    
    if (classFilter) {
        filteredData = filteredData.filter(fee => fee.class_id === classFilter);
    }
    
    if (paymentStatus) {
        filteredData = filteredData.filter(fee => {
            const status = getPaymentStatus(fee.total_fees, fee.paid_amount);
            return status.toLowerCase() === paymentStatus;
        });
    }
    
    renderFilteredTable(filteredData);
}

function renderFilteredTable(filteredData) {
    const tableBody = document.getElementById('feesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </td>
            </tr>
        `;
        return;
    }

    filteredData.forEach(fee => {
        const row = document.createElement('tr');
        const balance = fee.total_fees - fee.paid_amount;
        const status = getPaymentStatus(fee.total_fees, fee.paid_amount);
        
        row.innerHTML = `
            <td>${fee.student_id}</td>
            <td>${fee.student_name}</td>
            <td>${fee.class_name}</td>
            <td>${fee.academic_year}</td>
            <td>GHC ${fee.total_fees.toLocaleString()}</td>
            <td>GHC ${fee.paid_amount.toLocaleString()}</td>
            <td>GHC ${balance.toLocaleString()}</td>
            <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-view" onclick="viewPaymentHistory('${fee.student_id}', '${fee.academic_year}')">
                        <i class="fas fa-history"></i> History
                    </button>
                    <button class="btn-edit" onclick="recordPayment('${fee.student_id}', '${fee.academic_year}')">
                        <i class="fas fa-plus"></i> Payment
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Modal functions
function openSetFeesModal() {
    document.getElementById('setFeesModal').style.display = 'block';
    document.getElementById('setFeesForm').reset();
}

function closeSetFeesModal() {
    document.getElementById('setFeesModal').style.display = 'none';
}

function openRecordPaymentModal() {
    document.getElementById('recordPaymentModal').style.display = 'block';
    document.getElementById('recordPaymentForm').reset();
    document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
}

function closeRecordPaymentModal() {
    document.getElementById('recordPaymentModal').style.display = 'none';
}

function closePaymentHistoryModal() {
    document.getElementById('paymentHistoryModal').style.display = 'none';
}

// Form handlers
async function handleSetFees(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const feesData = Object.fromEntries(formData.entries());
    
    try {
        // Simulate API call - replace with actual API endpoint
        const response = await fetch('/api/fees/structure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feesData)
        });
        
        if (response.ok) {
            showMessage('Fees structure set successfully!', 'success');
            closeSetFeesModal();
            await loadFeesData();
        } else {
            throw new Error('Failed to set fees structure');
        }
    } catch (error) {
        console.error('Error setting fees structure:', error);
        showMessage('Error setting fees structure. Please try again.', 'error');
    }
}

async function handleRecordPayment(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const paymentData = Object.fromEntries(formData.entries());
    
    try {
        // Simulate API call - replace with actual API endpoint
        const response = await fetch('/api/fees/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });
        
        if (response.ok) {
            showMessage('Payment recorded successfully!', 'success');
            closeRecordPaymentModal();
            await loadFeesData();
            updateDashboardCards();
        } else {
            throw new Error('Failed to record payment');
        }
    } catch (error) {
        console.error('Error recording payment:', error);
        showMessage('Error recording payment. Please try again.', 'error');
    }
}

// View payment history
async function viewPaymentHistory(studentId, academicYear) {
    try {
        // Simulate API call - replace with actual API endpoint
        const response = await fetch(`/api/fees/payments/${studentId}/${academicYear}`);
        const data = await response.json();
        
        populatePaymentHistoryModal(data);
        document.getElementById('paymentHistoryModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading payment history:', error);
        // Use mock data for demonstration
        const mockData = getMockPaymentHistory(studentId, academicYear);
        populatePaymentHistoryModal(mockData);
        document.getElementById('paymentHistoryModal').style.display = 'block';
    }
}

function populatePaymentHistoryModal(data) {
    document.getElementById('historyStudentName').textContent = data.student_name;
    document.getElementById('historyStudentId').querySelector('span').textContent = data.student_id;
    document.getElementById('historyClass').querySelector('span').textContent = data.class_name;
    document.getElementById('historyAcademicYear').querySelector('span').textContent = data.academic_year;
    
    document.getElementById('historyTotalFees').textContent = `GHC ${data.total_fees.toLocaleString()}`;
    document.getElementById('historyTotalPaid').textContent = `GHC ${data.total_paid.toLocaleString()}`;
    document.getElementById('historyBalance').textContent = `GHC ${(data.total_fees - data.total_paid).toLocaleString()}`;
    
    const status = getPaymentStatus(data.total_fees, data.total_paid);
    const statusElement = document.getElementById('historyStatus');
    statusElement.textContent = status;
    statusElement.className = `status-badge status-${status.toLowerCase()}`;
    
    // Populate payment history table
    const tableBody = document.getElementById('paymentHistoryTableBody');
    tableBody.innerHTML = '';
    
    data.payment_history.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(payment.payment_date).toLocaleDateString()}</td>
            <td>GHC ${payment.amount.toLocaleString()}</td>
            <td>${payment.payment_method}</td>
            <td>${payment.notes || '-'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Record payment for specific student
function recordPayment(studentId, academicYear) {
    openRecordPaymentModal();
    
    // Pre-fill the form
    setTimeout(() => {
        const studentSelect = document.getElementById('paymentStudent');
        const yearSelect = document.getElementById('paymentAcademicYear');
        
        if (studentSelect) studentSelect.value = studentId;
        if (yearSelect) yearSelect.value = academicYear;
    }, 100);
}

// Student search for record payment modal
function handleStudentSearch() {
    const searchTerm = document.getElementById('studentSearchInput').value.toLowerCase();
    const dropdown = document.getElementById('paymentStudent');
    if (!dropdown) return;
    dropdown.innerHTML = '<option value="">Select Student</option>';
    students.filter(student =>
        student.St_Full_N.toLowerCase().includes(searchTerm) ||
        student.Student_ID.toLowerCase().includes(searchTerm)
    ).forEach(student => {
        const option = document.createElement('option');
        option.value = student.Student_ID;
        option.textContent = `${student.St_Full_N} (${student.Student_ID})`;
        dropdown.appendChild(option);
    });
}

// Utility functions
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

function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Load students from database
function loadStudents() {
    // TODO: Replace with actual API call to load students from database
    return [];
}

function getMockAcademicYears() {
    return [
        { acc_year: '2024-2025', year_name: '2024-2025 Academic Year' },
        { acc_year: '2023-2024', year_name: '2023-2024 Academic Year' },
        { acc_year: '2022-2023', year_name: '2022-2023 Academic Year' }
    ];
}

function getMockClasses() {
    return [
        { class_id: 'C001', class_name: 'Class 10A' },
        { class_id: 'C002', class_name: 'Class 10B' },
        { class_id: 'C003', class_name: 'Class 11A' },
        { class_id: 'C004', class_name: 'Class 11B' },
        { class_id: 'C005', class_name: 'Class 12A' }
    ];
}

function loadFeesData() {
    // TODO: Replace with actual API call to load fees data from database
    return [];
}

function getMockPaymentHistory(studentId, academicYear) {
    const student = students.find(s => s.Student_ID === studentId);
    const fee = feesData.find(f => f.student_id === studentId && f.academic_year === academicYear);
    
    return {
        student_id: studentId,
        student_name: student ? student.St_Full_N : 'Unknown Student',
        class_name: fee ? fee.class_name : 'Unknown Class',
        academic_year: academicYear,
        total_fees: fee ? fee.total_fees : 0,
        total_paid: fee ? fee.paid_amount : 0,
        payment_history: [
            {
                payment_date: '2024-01-15',
                amount: 2000,
                payment_method: 'Bank Transfer',
                notes: 'First installment'
            },
            {
                payment_date: '2024-02-15',
                amount: 2000,
                payment_method: 'Cash',
                notes: 'Second installment'
            },
            {
                payment_date: '2024-03-15',
                amount: 1000,
                payment_method: 'Online Payment',
                notes: 'Final payment'
            }
        ]
    };
} 