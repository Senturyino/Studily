// ========================================
// TEACHER MESSAGES JAVASCRIPT
// ========================================

// Global variables
let teacherMessages = [];
let filteredMessages = [];

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    loadTeacherMessages();
    setupEventListeners();
    updateMessageCounts();
});

// ========================================
// DATA LOADING
// ========================================

function loadTeacherMessages() {
    // TODO: Replace with actual API call to load messages from database for current teacher
    teacherMessages = [];
    
    filteredMessages = [...teacherMessages];
    displayMessages();
}

// ========================================
// MESSAGE DISPLAY
// ========================================

function displayMessages() {
    const messagesList = document.getElementById("messagesList");
    const emptyState = document.getElementById("emptyState");
    
    if (filteredMessages.length === 0) {
        messagesList.innerHTML = "";
        emptyState.classList.remove("hidden");
        return;
    }
    
    emptyState.classList.add("hidden");
    messagesList.innerHTML = "";
    
    filteredMessages.forEach(message => {
        const messageElement = createMessageElement(message);
        messagesList.appendChild(messageElement);
    });
}

function createMessageElement(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message-item teacher-specific ${message.read ? "" : "unread"}`;
    messageDiv.onclick = () => openMessageModal(message);
    
    const preview = message.content.length > 100 
        ? message.content.substring(0, 100) + "..." 
        : message.content;
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <h3 class="message-title">${message.subject}</h3>
            <div class="message-meta">
                <span class="message-type ${message.type}">${message.type}</span>
                <span class="priority-badge ${message.priority}">${message.priority}</span>
            </div>
        </div>
        <div class="message-preview">${preview}</div>
        <div class="message-date">${formatDateTime(message.date)}</div>
    `;
    
    return messageDiv;
}

// ========================================
// MODAL FUNCTIONS
// ========================================

function openMessageModal(message) {
    // Mark message as read
    if (!message.read) {
        message.read = true;
        updateMessageCounts();
        displayMessages(); // Refresh to update unread status
    }
    
    // Populate modal content
    document.getElementById("modalMessageSubject").textContent = message.subject;
    document.getElementById("modalMessageDate").textContent = formatDateTime(message.date);
    document.getElementById("modalMessageType").textContent = message.type;
    document.getElementById("modalMessagePriority").textContent = message.priority;
    document.getElementById("modalMessageStatus").textContent = message.read ? "Read" : "Unread";
    document.getElementById("modalMessageContent").textContent = message.content;
    document.getElementById("modalMessageSender").textContent = message.sender;
    
    // Show modal
    document.getElementById("messageModal").style.display = "block";
}

function closeMessageModal() {
    document.getElementById("messageModal").style.display = "none";
}

// ========================================
// FILTERING AND SEARCH
// ========================================

function setupEventListeners() {
    // Search functionality
    document.getElementById("searchInput").addEventListener("input", filterMessages);
    
    // Filter functionality
    document.getElementById("messageTypeFilter").addEventListener("change", filterMessages);
    document.getElementById("priorityFilter").addEventListener("change", filterMessages);
}

function filterMessages() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const typeFilter = document.getElementById("messageTypeFilter").value;
    const priorityFilter = document.getElementById("priorityFilter").value;
    
    filteredMessages = teacherMessages.filter(message => {
        const searchMatch = message.subject.toLowerCase().includes(searchTerm) || 
                          message.content.toLowerCase().includes(searchTerm);
        const typeMatch = !typeFilter || message.type === typeFilter;
        const priorityMatch = !priorityFilter || message.priority === priorityFilter;
        
        return searchMatch && typeMatch && priorityMatch;
    });
    
    displayMessages();
}

// ========================================
// MESSAGE ACTIONS
// ========================================

function markAllAsRead() {
    teacherMessages.forEach(message => {
        message.read = true;
    });
    
    updateMessageCounts();
    displayMessages();
    showNotification("All messages marked as read", "success");
}

function updateMessageCounts() {
    const unreadCount = teacherMessages.filter(message => !message.read).length;
    const totalCount = teacherMessages.length;
    
    document.getElementById("unreadCount").textContent = unreadCount;
    document.getElementById("totalCount").textContent = totalCount;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return "Yesterday at " + date.toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"});
    } else if (diffDays === 0) {
        return "Today at " + date.toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"});
    } else if (diffDays < 7) {
        return date.toLocaleDateString("en-US", { weekday: "long" }) + " at " + 
               date.toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"});
    } else {
        return date.toLocaleDateString() + " " + 
               date.toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"});
    }
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
    .hidden {
        display: none !important;
    }
`;
document.head.appendChild(style);

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById("messageModal");
    if (event.target === modal) {
        closeMessageModal();
    }
};

// Keyboard shortcuts
document.addEventListener("keydown", function(event) {
    // Escape key to close modal
    if (event.key === "Escape") {
        closeMessageModal();
    }
    
    // Ctrl/Cmd + K to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        document.getElementById("searchInput").focus();
    }
    
    // Ctrl/Cmd + R to mark all as read
    if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault();
        markAllAsRead();
    }
}); 