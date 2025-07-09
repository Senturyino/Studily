// DOM Elements
const openPopup = document.getElementById("openAttendancePopup");
const closePopup = document.getElementById("closePopup");
const popup = document.getElementById("attendancePopup");
const attendanceForm = document.getElementById("attendanceForm");
const classSelect = document.getElementById("classSelect");
const yearSelect = document.getElementById("yearSelect");

const studentListContainer = document.getElementById("studentListContainer");
const submitBtn = document.getElementById("submitAttendanceBtn");

let attendanceData = [];

// 🔄 Fetch classes and academic years from database
function fetchClasses() {
  return []; // Replace with real DB fetch
}
function fetchAcademicYears() {
  return []; // Replace with real DB fetch
}
function fetchStudentsByClass(className) {
  return []; // Replace with real DB fetch
}

// 🌐 Populate selects
function populateDropdowns() {
  const classes = fetchClasses();
  const years = fetchAcademicYears();

  classSelect.innerHTML = `<option value="">Select Class</option>`;
  yearSelect.innerHTML = `<option value="">Select Academic Year</option>`;

  classes.forEach(cls => {
    const option = document.createElement("option");
    option.value = cls;
    option.textContent = cls;
    classSelect.appendChild(option);
  });

  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
}

// 🚀 Show popup
openPopup.addEventListener("click", () => {
  popup.style.display = "flex";
});

// ❌ Close popup
closePopup.addEventListener("click", () => {
  popup.style.display = "none";
});

// ✅ Handle form submit
attendanceForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const selectedClass = classSelect.value;
  const selectedDay = document.getElementById("daySelect").value;
  const selectedWeek = document.getElementById("weekSelect").value;
  const selectedMonth = document.getElementById("monthSelect").value;
  const selectedYear = yearSelect.value;

  const students = fetchStudentsByClass(selectedClass);
  attendanceData = [];

  if (students.length > 0) {
    studentListContainer.innerHTML = "";
    students.forEach(student => {
      attendanceData.push({
        studentId: student.id,
        name: student.name,
        status: null,
        class: selectedClass,
        day: selectedDay,
        week: selectedWeek,
        month: selectedMonth,
        year: selectedYear
      });

      const div = document.createElement("div");
      div.classList.add("student-item");
      div.innerHTML = `
        <span>${student.name}</span>
        <div class="toggle-btn">
          <button class="present-btn" onclick="setStatus('${student.id}', 'Present')">Present</button>
          <button class="absent-btn" onclick="setStatus('${student.id}', 'Absent')">Absent</button>
        </div>
      `;
      studentListContainer.appendChild(div);
    });

    studentListContainer.classList.remove("hidden");
    submitBtn.classList.remove("hidden");
    popup.style.display = "none";
  }
});

// ✅ Set attendance status
function setStatus(studentId, status) {
  attendanceData.forEach(entry => {
    if (entry.studentId === studentId) {
      entry.status = status;
    }
  });
}

// 🚀 Submit all attendance records
submitBtn.addEventListener("click", () => {
  // TODO: send `attendanceData` to backend
  console.log("Submitting attendance data:", attendanceData);
  alert("Attendance submitted successfully.");
  studentListContainer.innerHTML = "";
  studentListContainer.classList.add("hidden");
  submitBtn.classList.add("hidden");
});

// Initialize
populateDropdowns();
