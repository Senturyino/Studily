// ========================================
// CLASSWORK MANAGEMENT SYSTEM
// ========================================

class ClassworkManager {
    constructor() {
        this.currentClass = null;
        this.currentSubject = null;
        this.students = [];
        this.assignments = [];
        this.marks = {};
        
        this.initializeEventListeners();
        this.loadInitialData();
    }

    initializeEventListeners() {
        // Class and subject selection
        document.getElementById("loadClassBtn").addEventListener("click", () => {
            this.loadClass();
        });

        // Assignment management
        document.getElementById("createAssignmentBtn").addEventListener("click", () => {
            this.showAssignmentModal();
        });

        document.getElementById("viewAssignmentsBtn").addEventListener("click", () => {
            this.loadAssignments();
        });

        // Export marks
        document.getElementById("exportMarksBtn").addEventListener("click", () => {
            this.exportMarks();
        });

        // Search functionality
        document.getElementById("studentSearch").addEventListener("input", (e) => {
            this.filterStudents(e.target.value);
        });



        // Modal events
        document.getElementById("assignmentModal").addEventListener("click", (e) => {
            if (e.target.classList.contains("modal") || e.target.classList.contains("close")) {
                this.hideAssignmentModal();
            }
        });

        document.getElementById("assignmentDetailsModal").addEventListener("click", (e) => {
            if (e.target.classList.contains("modal") || e.target.classList.contains("close")) {
                this.hideAssignmentDetailsModal();
            }
        });

        document.getElementById("studentMarksModal").addEventListener("click", (e) => {
            if (e.target.classList.contains("modal") || e.target.classList.contains("close")) {
                this.hideStudentMarksModal();
            }
        });

        // Student marks modal actions
        document.getElementById("cancelMarks").addEventListener("click", () => {
            this.hideStudentMarksModal();
        });

        document.getElementById("saveMarks").addEventListener("click", () => {
            this.saveStudentMarks();
        });

        // Assignment modal actions
        document.getElementById("cancelAssignment").addEventListener("click", () => {
            this.hideAssignmentModal();
        });

        // Form submission
        document.getElementById("assignmentForm").addEventListener("submit", (e) => {
            e.preventDefault();
            this.createAssignment();
        });

        // Cancel button
        document.getElementById("cancelAssignment").addEventListener("click", () => {
            this.hideAssignmentModal();
        });
    }

    loadInitialData() {
        // TODO: Load real data from database
        this.updateStats({
            totalStudents: 0,
            activeClasses: 0,
            pendingGrades: 0,
            avgPerformance: 0
        });
    }

    updateStats(stats) {
        document.getElementById("totalStudents").textContent = stats.totalStudents;
        document.getElementById("activeClasses").textContent = stats.activeClasses;
        document.getElementById("pendingGrades").textContent = stats.pendingGrades;
        document.getElementById("avgPerformance").textContent = stats.avgPerformance + "%";
    }

    loadClass() {
        const classSelect = document.getElementById("classSelect");
        const subjectSelect = document.getElementById("subjectSelect");
        
        if (!classSelect.value || !subjectSelect.value) {
            this.showMessage("Please select both class and subject", "error");
            return;
        }

        this.currentClass = classSelect.value;
        this.currentSubject = subjectSelect.value;

        // Show loading state
        this.showLoading();

        // Simulate API call
        setTimeout(() => {
            this.loadStudents();
            this.loadAssignments();
            this.hideLoading();
            this.showMessage(`Loaded ${this.currentClass} - ${this.currentSubject}`, "success");
        }, 1000);
    }

    loadStudents() {
        // TODO: Load students from database for the selected class
        this.students = [];

        this.renderStudentsGrid();
        this.showSection("studentsSection");
        this.showSection("analyticsSection");
    }

    loadAssignments() {
        // TODO: Load assignments from database for the selected class
        this.assignments = [];

        this.renderAssignments();
        this.showSection("assignmentSection");
    }

    renderStudentsGrid() {
        const grid = document.getElementById("studentsGrid");
        grid.innerHTML = "";

        this.students.forEach(student => {
            const card = document.createElement("div");
            card.className = "student-card";
            card.setAttribute("data-student-id", student.id);
            
            // Calculate student marks for summary
            const studentMarks = this.getStudentMarks(student.id);
            const total = studentMarks.total;
            const average = studentMarks.average;
            const grade = studentMarks.grade;
            
            card.innerHTML = `
                <div class="student-card-header">
                    <div class="student-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="student-info">
                        <h3>${student.name}</h3>
                        <p>${student.id}</p>
                    </div>
                </div>
                <div class="student-marks-summary">
                    <div class="summary-item">
                        <span class="label">Total</span>
                        <span class="value">${total}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Average</span>
                        <span class="value">${average}%</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Grade</span>
                        <span class="grade-badge grade-${grade.toLowerCase()}">${grade}</span>
                    </div>
                </div>
            `;
            
            // Add click event to open marks modal
            card.addEventListener("click", () => {
                this.openStudentMarksModal(student);
            });
            
            grid.appendChild(card);
        });
    }



    calculateGrade(average) {
        if (average >= 90) return "A";
        if (average >= 80) return "B";
        if (average >= 70) return "C";
        if (average >= 60) return "D";
        return "F";
    }

    renderAssignments() {
        const container = document.getElementById("assignmentsList");
        container.innerHTML = "";

        this.assignments.forEach(assignment => {
            const card = document.createElement("div");
            card.className = "assignment-card";
            card.innerHTML = `
                <div class="assignment-header">
                    <h4 class="assignment-title">${assignment.title}</h4>
                    <span class="assignment-type ${assignment.type}">${assignment.type}</span>
                </div>
                <p class="assignment-details">${assignment.description}</p>
                <div class="assignment-meta">
                    <span>Max: ${assignment.maxMarks} marks</span>
                    <span>Due: ${new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>
            `;
            
            card.addEventListener("click", () => {
                this.showAssignmentDetails(assignment);
            });
            
            container.appendChild(card);
        });
    }

    showAssignmentModal() {
        document.getElementById("assignmentModal").style.display = "flex";
        this.resetAssignmentForm();
    }

    resetAssignmentForm() {
        document.getElementById("assignmentForm").reset();
        const submitBtn = document.querySelector("#assignmentForm button[type=\"submit\"]");
        submitBtn.textContent = "Create Assignment";
        this.editingAssignmentId = null;
    }

    hideAssignmentModal() {
        document.getElementById("assignmentModal").style.display = "none";
    }

    showAssignmentDetails(assignment) {
        const modal = document.getElementById("assignmentDetailsModal");
        const content = document.getElementById("assignmentDetailsContent");
        
        content.innerHTML = `
            <div class="assignment-details-content">
                <h3>${assignment.title}</h3>
                <div class="detail-item">
                    <span class="label">Description:</span>
                    <span class="value">${assignment.description}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Type:</span>
                    <span class="value">
                        <span class="assignment-type ${assignment.type}">${assignment.type}</span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="label">Maximum Marks:</span>
                    <span class="value">${assignment.maxMarks}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Due Date:</span>
                    <span class="value">${new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Created:</span>
                    <span class="value">${new Date(assignment.createdDate).toLocaleDateString()}</span>
                </div>
            </div>
            
            <div class="assignment-actions">
                <button class="btn btn-primary" id="editAssignmentBtn">
                    <i class="fas fa-edit"></i> Edit Assignment
                </button>
                <button class="btn btn-secondary" id="viewAssignmentMarksBtn">
                    <i class="fas fa-chart-bar"></i> View Marks
                </button>
                <button class="btn btn-danger" id="deleteAssignmentBtn">
                    <i class="fas fa-trash"></i> Delete Assignment
                </button>
            </div>
        `;
        
        // Add event listeners for assignment detail buttons
        document.getElementById("editAssignmentBtn").addEventListener("click", () => {
            this.editAssignment(assignment.id);
        });
        
        document.getElementById("viewAssignmentMarksBtn").addEventListener("click", () => {
            this.viewAssignmentMarks(assignment.id);
        });
        
        document.getElementById("deleteAssignmentBtn").addEventListener("click", () => {
            this.deleteAssignment(assignment.id);
        });
        
        modal.style.display = "flex";
    }

    hideAssignmentDetailsModal() {
        document.getElementById("assignmentDetailsModal").style.display = "none";
    }

    createAssignment() {
        const title = document.getElementById("assignmentTitle").value;
        const description = document.getElementById("assignmentDescription").value;
        const type = document.getElementById("assignmentType").value;
        const maxMarks = parseInt(document.getElementById("maxMarks").value);
        const dueDate = document.getElementById("dueDate").value;

        // Validate form
        if (!title || !type || !maxMarks || !dueDate) {
            this.showMessage("Please fill in all required fields!", "error");
            return;
        }

        if (this.editingAssignmentId) {
            // Update existing assignment
            const assignmentIndex = this.assignments.findIndex(a => a.id === this.editingAssignmentId);
            if (assignmentIndex !== -1) {
                this.assignments[assignmentIndex] = {
                    ...this.assignments[assignmentIndex],
                    title,
                    description,
                    type,
                    maxMarks,
                    dueDate
                };
                
                this.renderAssignments();
                this.hideAssignmentModal();
                this.showMessage("Assignment updated successfully!", "success");
            }
        } else {
            // Create new assignment
            const assignment = {
                id: this.assignments.length + 1,
                title,
                description,
                type,
                maxMarks,
                dueDate,
                createdDate: new Date().toISOString().split("T")[0]
            };

            this.assignments.push(assignment);
            this.renderAssignments();
            this.hideAssignmentModal();
            this.showMessage("Assignment created successfully!", "success");
        }

        // Reset editing state
        this.editingAssignmentId = null;
        this.resetAssignmentForm();
    }

    saveAllMarks() {
        const markInputs = document.querySelectorAll(".mark-input");
        const marks = {};

        markInputs.forEach(input => {
            const studentId = input.dataset.student;
            const assignmentId = input.dataset.assignment;
            const mark = parseInt(input.value) || 0;

            if (!marks[studentId]) {
                marks[studentId] = {};
            }
            marks[studentId][assignmentId] = mark;
        });

        // Save to localStorage for demo
        localStorage.setItem("classworkMarks", JSON.stringify(marks));
        this.showMessage("All marks saved successfully!", "success");
    }

    exportMarks() {
        const data = this.prepareExportData();
        const csv = this.convertToCSV(data);
        this.downloadCSV(csv, `${this.currentClass}_${this.currentSubject}_marks.csv`);
    }

    prepareExportData() {
        const data = [];
        const headers = ["Student ID", "Student Name"];
        
        // Add assignment headers
        this.assignments.forEach(assignment => {
            headers.push(`Assignment ${assignment.id}: ${assignment.title}`);
        });
        
        headers.push("Total", "Average", "Grade");
        data.push(headers);

        this.students.forEach(student => {
            const row = [
                student.id,
                student.name
            ];

            // Add assignment marks for all assignments
            this.assignments.forEach(assignment => {
                const input = document.querySelector(`[data-student="${student.id}"][data-assignment="${assignment.id}"]`);
                row.push(input ? (input.value || 0) : 0);
            });

            // Add totals
            const totalElement = document.querySelector(`[data-student="${student.id}"].total-marks`);
            const averageElement = document.querySelector(`[data-student="${student.id}"].average-marks`);
            const gradeElement = document.querySelector(`[data-student="${student.id}"].grade-badge`);

            row.push(totalElement ? totalElement.textContent : 0);
            row.push(averageElement ? averageElement.textContent : "0%");
            row.push(gradeElement ? gradeElement.textContent : "-");

            data.push(row);
        });

        return data;
    }

    convertToCSV(data) {
        return data.map(row => 
            row.map(cell => `"${cell}"`).join(",")
        ).join("\n");
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    filterStudents(searchTerm) {
        const cards = document.querySelectorAll(".student-card");
        
        cards.forEach(card => {
            const studentName = card.querySelector("h3").textContent.toLowerCase();
            const studentId = card.querySelector("p").textContent.toLowerCase();
            const search = searchTerm.toLowerCase();
            
            if (studentName.includes(search) || studentId.includes(search)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    }

    updateAnalytics() {
        this.updateGradeDistribution();
        this.updateTopPerformers();
        this.updateNeedAttention();
    }

    updateGradeDistribution() {
        const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        const gradeElements = document.querySelectorAll(".grade-badge");
        
        gradeElements.forEach(element => {
            const grade = element.textContent;
            if (grade in distribution) {
                distribution[grade]++;
            }
        });

        const container = document.getElementById("gradeDistribution");
        container.innerHTML = "";

        Object.entries(distribution).forEach(([grade, count]) => {
            const percentage = this.students.length > 0 ? Math.round((count / this.students.length) * 100) : 0;
            
            const item = document.createElement("div");
            item.className = "grade-item";
            item.innerHTML = `
                <span>Grade ${grade}</span>
                <div class="grade-bar">
                    <div class="grade-fill" style="width: ${percentage}%"></div>
                </div>
                <span>${count} (${percentage}%)</span>
            `;
            container.appendChild(item);
        });
    }

    updateTopPerformers() {
        const students = Array.from(document.querySelectorAll("#marksTableBody tr")).map(row => ({
            name: row.cells[0].textContent,
            average: parseFloat(row.cells[8].textContent) || 0
        }));

        const topPerformers = students
            .filter(student => student.average > 0)
            .sort((a, b) => b.average - a.average)
            .slice(0, 5);

        const container = document.getElementById("topPerformers");
        container.innerHTML = "";

        topPerformers.forEach(student => {
            const item = document.createElement("div");
            item.className = "student-item";
            item.innerHTML = `
                <div class="student-info">
                    <span class="student-name">${student.name}</span>
                </div>
                <span class="student-score">${student.average}%</span>
            `;
            container.appendChild(item);
        });
    }

    updateNeedAttention() {
        const students = Array.from(document.querySelectorAll("#marksTableBody tr")).map(row => ({
            name: row.cells[0].textContent,
            average: parseFloat(row.cells[8].textContent) || 0
        }));

        const needAttention = students
            .filter(student => student.average > 0 && student.average < 60)
            .sort((a, b) => a.average - b.average)
            .slice(0, 5);

        const container = document.getElementById("needAttention");
        container.innerHTML = "";

        needAttention.forEach(student => {
            const item = document.createElement("div");
            item.className = "student-item attention";
            item.innerHTML = `
                <div class="student-info">
                    <span class="student-name">${student.name}</span>
                </div>
                <span class="student-score">${student.average}%</span>
            `;
            container.appendChild(item);
        });
    }

    showSection(sectionId) {
        document.getElementById(sectionId).style.display = "block";
    }

    showLoading() {
        document.body.classList.add("loading");
    }

    hideLoading() {
        document.body.classList.remove("loading");
    }

    showMessage(message, type = "info") {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
            ${message}
        `;

        const container = document.querySelector(".content-container");
        container.insertBefore(messageDiv, container.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    getStudentMarks(studentId) {
        let total = 0;
        let maxTotal = 0;

        this.assignments.forEach(assignment => {
            const mark = this.marks[studentId]?.[assignment.id] || 0;
            total += mark;
            maxTotal += assignment.maxMarks;
        });

        const average = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
        const grade = this.calculateGrade(average);

        return { total, average, grade };
    }

    openStudentMarksModal(student) {
        this.currentStudent = student;
        
        // Update modal header
        document.getElementById("modalStudentName").textContent = student.name;
        document.getElementById("modalStudentId").textContent = student.id;
        
        // Generate assignment mark inputs
        const assignmentsContainer = document.getElementById("assignmentsMarks");
        assignmentsContainer.innerHTML = "";
        
        this.assignments.forEach(assignment => {
            const currentMark = this.marks[student.id]?.[assignment.id] || 0;
            
            const assignmentItem = document.createElement("div");
            assignmentItem.className = "assignment-mark-item";
            assignmentItem.innerHTML = `
                <div class="assignment-mark-info">
                    <h5>${assignment.title}</h5>
                    <p>${assignment.description}</p>
                </div>
                <div class="assignment-mark-input">
                    <input type="number" 
                           data-assignment="${assignment.id}" 
                           min="0" 
                           max="${assignment.maxMarks}" 
                           value="${currentMark}"
                           placeholder="0-${assignment.maxMarks}">
                    <span class="max-marks">/ ${assignment.maxMarks}</span>
                </div>
            `;
            
            assignmentsContainer.appendChild(assignmentItem);
        });
        
        // Add event listeners to mark inputs
        this.addModalMarkInputListeners();
        
        // Update summary
        this.updateModalSummary();
        
        // Show modal
        document.getElementById("studentMarksModal").style.display = "flex";
    }

    hideStudentMarksModal() {
        document.getElementById("studentMarksModal").style.display = "none";
        this.currentStudent = null;
    }

    addModalMarkInputListeners() {
        const markInputs = document.querySelectorAll("#assignmentsMarks input");
        markInputs.forEach(input => {
            input.addEventListener("input", () => {
                this.updateModalSummary();
            });
        });
    }

    updateModalSummary() {
        let total = 0;
        let maxTotal = 0;

        this.assignments.forEach(assignment => {
            const input = document.querySelector(`#assignmentsMarks input[data-assignment="${assignment.id}"]`);
            const mark = parseInt(input?.value) || 0;
            total += mark;
            maxTotal += assignment.maxMarks;
        });

        const average = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
        const grade = this.calculateGrade(average);

        document.getElementById("modalTotalMarks").textContent = total;
        document.getElementById("modalAverageMarks").textContent = average + "%";
        
        const gradeElement = document.getElementById("modalGrade");
        gradeElement.textContent = grade;
        gradeElement.className = `grade-badge grade-${grade.toLowerCase()}`;
    }

    saveStudentMarks() {
        if (!this.currentStudent) return;

        const studentId = this.currentStudent.id;
        if (!this.marks[studentId]) {
            this.marks[studentId] = {};
        }

        this.assignments.forEach(assignment => {
            const input = document.querySelector(`#assignmentsMarks input[data-assignment="${assignment.id}"]`);
            const mark = parseInt(input?.value) || 0;
            this.marks[studentId][assignment.id] = mark;
        });

        // Update student card
        this.updateStudentCard(studentId);
        
        // Hide modal
        this.hideStudentMarksModal();
        
        // Show success message
        this.showMessage(`Marks saved for ${this.currentStudent.name}`, "success");
    }

    updateStudentCard(studentId) {
        const studentMarks = this.getStudentMarks(studentId);
        const card = document.querySelector(`[data-student-id="${studentId}"]`);
        
        if (card) {
            const totalElement = card.querySelector(".summary-item:nth-child(1) .value");
            const averageElement = card.querySelector(".summary-item:nth-child(2) .value");
            const gradeElement = card.querySelector(".summary-item:nth-child(3) .grade-badge");
            
            if (totalElement) totalElement.textContent = studentMarks.total;
            if (averageElement) averageElement.textContent = studentMarks.average + "%";
            if (gradeElement) {
                gradeElement.textContent = studentMarks.grade;
                gradeElement.className = `grade-badge grade-${studentMarks.grade.toLowerCase()}`;
            }
        }
    }

    updateAssignmentHeaders(currentAssignments) {
        const headerCell = document.getElementById("assignmentHeaders");
        headerCell.innerHTML = "";
        
        currentAssignments.forEach(assignment => {
            const header = document.createElement("th");
            header.innerHTML = `
                <div class="assignment-header-cell">
                    <div class="assignment-title">${assignment.title}</div>
                    <div class="assignment-meta">
                        <span class="assignment-type ${assignment.type}">${assignment.type}</span>
                        <span class="max-marks">Max: ${assignment.maxMarks}</span>
                    </div>
                </div>
            `;
            headerCell.appendChild(header);
        });
    }

    // Additional methods for assignment management
    editAssignment(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) {
            this.showMessage("Assignment not found!", "error");
            return;
        }
        
        // Populate the create assignment form with existing data
        document.getElementById("assignmentTitle").value = assignment.title;
        document.getElementById("assignmentDescription").value = assignment.description;
        document.getElementById("maxMarks").value = assignment.maxMarks;
        document.getElementById("dueDate").value = assignment.dueDate;
        document.getElementById("assignmentType").value = assignment.type;
        
        // Change form button text
        const submitBtn = document.querySelector("#assignmentForm button[type=\"submit\"]");
        submitBtn.textContent = "Update Assignment";
        
        // Store the assignment ID being edited
        this.editingAssignmentId = assignmentId;
        
        // Hide assignment details modal and show edit modal
        this.hideAssignmentDetailsModal();
        this.showAssignmentModal();
    }

    viewAssignmentMarks(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) {
            this.showMessage("Assignment not found!", "error");
            return;
        }
        
        // Create a summary of marks for this assignment
        let marksSummary = "<h3>Marks Summary for " + assignment.title + "</h3>";
        marksSummary += "<div class=\"assignment-marks-summary\">";
        
        this.students.forEach(student => {
            const mark = this.marks[student.id]?.[assignmentId] || 0;
            const percentage = assignment.maxMarks > 0 ? Math.round((mark / assignment.maxMarks) * 100) : 0;
            
            marksSummary += `
                <div class="student-mark-item">
                    <span class="student-name">${student.name}</span>
                    <span class="mark-value">${mark}/${assignment.maxMarks} (${percentage}%)</span>
                </div>
            `;
        });
        
        marksSummary += "</div>";
        
        // Show in assignment details modal
        const content = document.getElementById("assignmentDetailsContent");
        content.innerHTML = marksSummary;
        
        // Keep the modal open
        document.getElementById("assignmentDetailsModal").style.display = "flex";
    }

    deleteAssignment(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) {
            this.showMessage("Assignment not found!", "error");
            return;
        }
        
        if (confirm(`Are you sure you want to delete "${assignment.title}"? This action cannot be undone.`)) {
            this.assignments = this.assignments.filter(a => a.id !== assignmentId);
            this.renderAssignments();
            this.hideAssignmentDetailsModal();
            this.showMessage(`Assignment "${assignment.title}" deleted successfully!`, "success");
        }
    }
}

// Initialize the classwork manager when the page loads
let classworkManager;
document.addEventListener("DOMContentLoaded", () => {
    classworkManager = new ClassworkManager();
}); 