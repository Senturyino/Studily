// ========================================
// MESSAGING SYSTEM JAVASCRIPT
// ========================================

// Global variables
let students = [];
let teachers = [];
let classes = [];
let messages = [];
let currentTab = "students";

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    loadStatistics();
    loadStudents();
    loadTeachers();
    loadClasses();
    loadMessages();
    setupEventListeners();
});

// ========================================
// STATISTICS AND DATA LOADING
// ========================================

function loadStatistics() {
    // Simulate loading statistics from database
    document.getElementById("totalStudents").textContent = "1,247";
    document.getElementById("totalTeachers").textContent = "89";
    document.getElementById("totalMessages").textContent = "156";
    document.getElementById("totalAnnouncements").textContent = "23";
}

function loadStudents() {
    // TODO: Replace with actual API call to load students from database
    students = [];
    populateStudentsList();
}

function loadTeachers() {
    // Simulate loading teachers from database
    teachers = [
        { id: 1, name: "Dr. Robert Johnson", email: "robert.johnson@school.com", subject: "Mathematics" },
        { id: 2, name: "Ms. Jennifer Smith", email: "jennifer.smith@school.com", subject: "English" },
        { id: 3, name: "Mr. David Brown", email: "david.brown@school.com", subject: "Science" },
        { id: 4, name: "Mrs. Sarah Wilson", email: "sarah.wilson@school.com", subject: "History" },
        { id: 5, name: "Prof. Michael Davis", email: "michael.davis@school.com", subject: "Physics" },
        { id: 6, name: "Ms. Lisa Anderson", email: "lisa.anderson@school.com", subject: "Art" }
    ];
    populateTeachersList();
}

function loadClasses() {
    // Simulate loading classes from database
    classes = [
        { id: 1, name: "Class 9A", students: 25 },
        { id: 2, name: "Class 9B", students: 28 },
        { id: 3, name: "Class 10A", students: 30 },
        { id: 4, name: "Class 10B", students: 27 },
        { id: 5, name: "Class 11A", students: 32 },
        { id: 6, name: "Class 11B", students: 29 },
        { id: 7, name: "Class 12A", students: 35 },
        { id: 8, name: "Class 12B", students: 31 }
    ];
    populateClassesList();
}

function loadMessages() {
    // TODO: Replace with actual API call to load messages from database
    messages = [];
    displayMessages();
}

// ========================================
// UI POPULATION FUNCTIONS
// ========================================

function populateStudentsList() {
    const studentsList = document.getElementById("studentsList");
    studentsList.innerHTML = "";
    
    students.forEach(student => {
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="checkbox" value="${student.id}" data-name="${student.name}">
            <span class="checkmark"></span>
            <div class="student-info">
                <strong>${student.name}</strong>
                <small>${student.email} - ${student.class}</small>
            </div>
        `;
        studentsList.appendChild(label);
    });
}

function populateTeachersList() {
    const teachersList = document.getElementById("teachersList");
    teachersList.innerHTML = "";
    
    teachers.forEach(teacher => {
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="checkbox" value="${teacher.id}" data-name="${teacher.name}">
            <span class="checkmark"></span>
            <div class="teacher-info">
                <strong>${teacher.name}</strong>
                <small>${teacher.email} - ${teacher.subject}</small>
            </div>
        `;
        teachersList.appendChild(label);
    });
}

function populateClassesList() {
    const classesList = document.getElementById("classesList");
    classesList.innerHTML = "";
    
    classes.forEach(cls => {
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="checkbox" value="${cls.id}" data-name="${cls.name}">
            <span class="checkmark"></span>
            <div class="class-info">
                <strong>${cls.name}</strong>
                <small>${cls.students} students</small>
            </div>
        `;
        classesList.appendChild(label);
    });
}

function displayMessages() {
    const tbody = document.getElementById("messagesTableBody");
    tbody.innerHTML = "";
    
    messages.forEach(message => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${formatDateTime(message.date)}</td>
            <td><span class="message-type ${message.type}">${message.type}</span></td>
            <td>${message.subject}</td>
            <td>${message.recipients}</td>
            <td><span class="status-badge status-${message.status.toLowerCase()}">${message.status}</span></td>
            <td class="message-actions">
                <i class="fas fa-eye action-icon" onclick="viewMessage(${message.id})" title="View Details"></i>
                <i class="fas fa-trash action-icon" onclick="deleteMessage(${message.id})" title="Delete"></i>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ========================================
// MODAL FUNCTIONS
// ========================================

function openSendMessageModal() {
    document.getElementById("sendMessageModal").style.display = "block";
    resetForm();
}

function closeSendMessageModal() {
    document.getElementById("sendMessageModal").style.display = "none";
    resetForm();
}

function openViewMessageModal() {
    document.getElementById("viewMessageModal").style.display = "block";
}

function closeViewMessageModal() {
    document.getElementById("viewMessageModal").style.display = "none";
}

function resetForm() {
    document.getElementById("sendMessageForm").reset();
    document.getElementById("allStudents").checked = false;
    document.getElementById("allTeachers").checked = false;
    document.getElementById("allClasses").checked = false;
    
    // Uncheck all individual checkboxes
    const checkboxes = document.querySelectorAll("#studentsList input[type=\"checkbox\"], #teachersList input[type=\"checkbox\"], #classesList input[type=\"checkbox\"]");
    checkboxes.forEach(checkbox => checkbox.checked = false);
}

// ========================================
// TAB SWITCHING
// ========================================

function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach(content => content.classList.remove("active"));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => btn.classList.remove("active"));
    
    // Show selected tab content
    document.getElementById(tabName + "Tab").classList.add("active");
    
    // Add active class to clicked button
    event.target.classList.add("active");
    
    currentTab = tabName;
}

// ========================================
// CHECKBOX TOGGLE FUNCTIONS
// ========================================

function toggleAllStudents() {
    const allStudentsCheckbox = document.getElementById("allStudents");
    const studentCheckboxes = document.querySelectorAll("#studentsList input[type=\"checkbox\"]");
    
    studentCheckboxes.forEach(checkbox => {
        checkbox.checked = allStudentsCheckbox.checked;
    });
}

function toggleAllTeachers() {
    const allTeachersCheckbox = document.getElementById("allTeachers");
    const teacherCheckboxes = document.querySelectorAll("#teachersList input[type=\"checkbox\"]");
    
    teacherCheckboxes.forEach(checkbox => {
        checkbox.checked = allTeachersCheckbox.checked;
    });
}

function toggleAllClasses() {
    const allClassesCheckbox = document.getElementById("allClasses");
    const classCheckboxes = document.querySelectorAll("#classesList input[type=\"checkbox\"]");
    
    classCheckboxes.forEach(checkbox => {
        checkbox.checked = allClassesCheckbox.checked;
    });
}

// ========================================
// QUICK ANNOUNCEMENT FUNCTIONS
// ========================================

function quickAnnouncement(type) {
    openSendMessageModal();
    
    // Set default values based on type
    document.getElementById("messageType").value = "announcement";
    document.getElementById("priority").value = "normal";
    
    switch(type) {
        case "all-students":
            document.getElementById("allStudents").checked = true;
            switchTab("students");
            break;
        case "all-teachers":
            document.getElementById("allTeachers").checked = true;
            switchTab("teachers");
            break;
        case "all-users":
            document.getElementById("allStudents").checked = true;
            document.getElementById("allTeachers").checked = true;
            switchTab("students");
            break;
    }
}

// ========================================
// MESSAGE OPERATIONS
// ========================================

function viewMessage(messageId) {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    document.getElementById("viewMessageSubject").textContent = message.subject;
    document.getElementById("viewMessageDate").textContent = formatDateTime(message.date);
    document.getElementById("viewMessageType").textContent = message.type;
    document.getElementById("viewMessagePriority").textContent = message.priority;
    document.getElementById("viewMessageStatus").textContent = message.status;
    document.getElementById("viewMessageContent").textContent = message.content;
    
    // Display recipients
    const recipientsDiv = document.getElementById("viewMessageRecipients");
    recipientsDiv.innerHTML = `<span class="recipient-tag">${message.recipients}</span>`;
    
    openViewMessageModal();
}

function deleteMessage(messageId) {
    if (confirm("Are you sure you want to delete this message?")) {
        messages = messages.filter(m => m.id !== messageId);
        displayMessages();
        showNotification("Message deleted successfully", "success");
    }
}

// ========================================
// FORM SUBMISSION
// ========================================

function setupEventListeners() {
    document.getElementById("sendMessageForm").addEventListener("submit", handleMessageSubmit);
    
    // Search functionality
    document.getElementById("studentSearch").addEventListener("input", filterStudents);
    document.getElementById("teacherSearch").addEventListener("input", filterTeachers);
    
    // Filter functionality
    document.getElementById("messageTypeFilter").addEventListener("change", filterMessages);
    document.getElementById("recipientFilter").addEventListener("change", filterMessages);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const messageData = {
        type: formData.get("messageType"),
        priority: formData.get("priority"),
        subject: formData.get("subject"),
        content: formData.get("messageContent"),
        recipients: getSelectedRecipients(),
        date: new Date().toISOString(),
        status: "Sent"
    };
    
    if (messageData.recipients.length === 0) {
        showNotification("Please select at least one recipient", "error");
        return;
    }
    
    // Add message to the list
    const newMessage = {
        id: messages.length + 1,
        ...messageData
    };
    
    messages.unshift(newMessage);
    displayMessages();
    
    closeSendMessageModal();
    showNotification("Message sent successfully!", "success");
}

function getSelectedRecipients() {
    const recipients = [];
    
    // Check for "all" selections
    if (document.getElementById("allStudents").checked) {
        recipients.push("All Students");
    }
    if (document.getElementById("allTeachers").checked) {
        recipients.push("All Teachers");
    }
    if (document.getElementById("allClasses").checked) {
        recipients.push("All Classes");
    }
    
    // Check individual selections
    const selectedStudents = Array.from(document.querySelectorAll("#studentsList input[type=\"checkbox\"]:checked"))
        .map(checkbox => checkbox.dataset.name);
    const selectedTeachers = Array.from(document.querySelectorAll("#teachersList input[type=\"checkbox\"]:checked"))
        .map(checkbox => checkbox.dataset.name);
    const selectedClasses = Array.from(document.querySelectorAll("#classesList input[type=\"checkbox\"]:checked"))
        .map(checkbox => checkbox.dataset.name);
    
    recipients.push(...selectedStudents, ...selectedTeachers, ...selectedClasses);
    
    return recipients.join(", ");
}

// ========================================
// SEARCH AND FILTER FUNCTIONS
// ========================================

function filterStudents() {
    const searchTerm = document.getElementById("studentSearch").value.toLowerCase();
    const studentLabels = document.querySelectorAll("#studentsList label");
    
    studentLabels.forEach(label => {
        const studentName = label.querySelector(".student-info strong").textContent.toLowerCase();
        const studentEmail = label.querySelector(".student-info small").textContent.toLowerCase();
        
        if (studentName.includes(searchTerm) || studentEmail.includes(searchTerm)) {
            label.style.display = "flex";
        } else {
            label.style.display = "none";
        }
    });
}

function filterTeachers() {
    const searchTerm = document.getElementById("teacherSearch").value.toLowerCase();
    const teacherLabels = document.querySelectorAll("#teachersList label");
    
    teacherLabels.forEach(label => {
        const teacherName = label.querySelector(".teacher-info strong").textContent.toLowerCase();
        const teacherEmail = label.querySelector(".teacher-info small").textContent.toLowerCase();
        
        if (teacherName.includes(searchTerm) || teacherEmail.includes(searchTerm)) {
            label.style.display = "flex";
        } else {
            label.style.display = "none";
        }
    });
}

function filterMessages() {
    const typeFilter = document.getElementById("messageTypeFilter").value;
    const recipientFilter = document.getElementById("recipientFilter").value;
    
    const filteredMessages = messages.filter(message => {
        const typeMatch = !typeFilter || message.type === typeFilter;
        const recipientMatch = !recipientFilter || 
            (recipientFilter === "students" && message.recipients.includes("Student")) ||
            (recipientFilter === "teachers" && message.recipients.includes("Teacher")) ||
            (recipientFilter === "all" && message.recipients.includes("All"));
        
        return typeMatch && recipientMatch;
    });
    
    displayFilteredMessages(filteredMessages);
}

function displayFilteredMessages(filteredMessages) {
    const tbody = document.getElementById("messagesTableBody");
    tbody.innerHTML = "";
    
    filteredMessages.forEach(message => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${formatDateTime(message.date)}</td>
            <td><span class="message-type ${message.type}">${message.type}</span></td>
            <td>${message.subject}</td>
            <td>${message.recipients}</td>
            <td><span class="status-badge status-${message.status.toLowerCase()}">${message.status}</span></td>
            <td class="message-actions">
                <i class="fas fa-eye action-icon" onclick="viewMessage(${message.id})" title="View Details"></i>
                <i class="fas fa-trash action-icon" onclick="deleteMessage(${message.id})" title="Delete"></i>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"});
}

function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    switch(type) {
        case "success":
            notification.style.background = "#4CAF50";
            break;
        case "error":
            notification.style.background = "#f44336";
            break;
        case "warning":
            notification.style.background = "#ff9800";
            break;
        default:
            notification.style.background = "#2196F3";
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Close modals when clicking outside
window.onclick = function(event) {
    const sendModal = document.getElementById("sendMessageModal");
    const viewModal = document.getElementById("viewMessageModal");
    
    if (event.target === sendModal) {
        closeSendMessageModal();
    }
    if (event.target === viewModal) {
        closeViewMessageModal();
    }
}; 