// ========================================
// SIDEBAR FUNCTIONALITY
// ========================================

class SidebarManager {
    constructor() {
        this.sidebar = document.querySelector(".sidebar");
        this.sidebarToggle = document.querySelector(".sidebar-toggle");
        this.overlay = document.querySelector(".sidebar-overlay");
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        // Add overlay if it doesn't exist
        if (!this.overlay) {
            this.createOverlay();
        }
        
        // Bind events
        this.bindEvents();
        
        // Set active nav item based on current page
        this.setActiveNavItem();
    }
    
    createOverlay() {
        this.overlay = document.createElement("div");
        this.overlay.className = "sidebar-overlay";
        document.body.appendChild(this.overlay);
    }
    
    bindEvents() {
        // Toggle sidebar
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener("click", () => {
                this.toggleSidebar();
            });
        }
        
        // Close sidebar when clicking overlay
        if (this.overlay) {
            this.overlay.addEventListener("click", () => {
                this.closeSidebar();
            });
        }
        
        // Close sidebar on escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isOpen) {
                this.closeSidebar();
            }
        });
        
        // Handle window resize
        window.addEventListener("resize", () => {
            this.handleResize();
        });
    }
    
    toggleSidebar() {
        if (this.isOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }
    
    openSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.add("open");
        }
        if (this.overlay) {
            this.overlay.classList.add("open");
        }
        this.isOpen = true;
    }
    
    closeSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.remove("open");
        }
        if (this.overlay) {
            this.overlay.classList.remove("open");
        }
        this.isOpen = false;
    }
    
    handleResize() {
        // Auto-close sidebar on larger screens
        if (window.innerWidth > 1024 && this.isOpen) {
            this.closeSidebar();
        }
    }
    
    setActiveNavItem() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll(".sidebar-nav-item");
        
        navItems.forEach(item => {
            const href = item.getAttribute("href");
            if (href && currentPath.includes(href)) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
    }
}

// Initialize sidebar when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new SidebarManager();
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Format date for display
function formatDate(date) {
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(new Date(date));
}

// Format time for display
function formatTime(time) {
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(time));
}

// Show notification
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Confirm action
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Loading state
function setLoading(element, isLoading = true) {
    if (isLoading) {
        element.classList.add("loading");
        element.disabled = true;
    } else {
        element.classList.remove("loading");
        element.disabled = false;
    }
}

// ========================================
// DASHBOARD STATISTICS
// ========================================

class DashboardStats {
    constructor() {
        this.init();
    }
    
    init() {
        this.loadStats();
    }
    
    async loadStats() {
        // This would typically fetch from an API
        // For now, we'll use mock data
        const stats = this.getMockStats();
        this.updateStatsDisplay(stats);
    }
    
    getMockStats() {
        // TODO: Replace with actual API calls to get real statistics
        return {
            totalStudents: 0,
            totalTeachers: 0,
            attendanceRate: 0,
            pendingFees: 0,
            newMessages: 0,
            upcomingEvents: 0
        };
    }
    
    updateStatsDisplay(stats) {
        // Update stats cards if they exist
        const statElements = document.querySelectorAll("[data-stat]");
        
        statElements.forEach(element => {
            const statKey = element.getAttribute("data-stat");
            if (stats[statKey] !== undefined) {
                element.textContent = stats[statKey];
            }
        });
    }
}

// Initialize dashboard stats
document.addEventListener("DOMContentLoaded", () => {
    new DashboardStats();
}); 