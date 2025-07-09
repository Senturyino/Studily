// 🌐 DOM Elements
const classSelect = document.getElementById("classSelect");
const studentList = document.getElementById("studentList");
const metadataModal = document.getElementById("metadataModal");
const entryModal = document.getElementById("entryModal");
const metadataForm = document.getElementById("metadataForm");
const entryForm = document.getElementById("entryForm");
const overlay = document.getElementById("overlay");

let selectedStudentId = null;
let metadata = {};

// 🔄 Fetch all classes the teacher teaches
async function fetchTeacherClasses() {
  // Replace with real API call
  return []; // e.g., [{ id: 'cls1', name: 'JHS 1 A' }, ...]
}

// 🔄 Fetch students in a given class
async function fetchStudentsByClass(classId) {
  // Replace with real API call
  return []; // e.g., [{ id: 'stu1', name: 'John Doe' }, ...]
}

// 🔁 Populate class dropdown
async function populateClasses() {
  const classes = await fetchTeacherClasses();
  classSelect.innerHTML = `<option disabled selected>Select class</option>`;
  classes.forEach(cls => {
    const opt = document.createElement("option");
    opt.value = cls.id;
    opt.textContent = cls.name;
    classSelect.appendChild(opt);
  });
}

// 🧍 Render student cards
function renderStudents(students) {
  studentList.innerHTML = "";
  students.forEach(student => {
    const card = document.createElement("div");
    card.className = "student-card";
    card.dataset.studentId = student.id;
    card.textContent = student.name;
    studentList.appendChild(card);
  });
}

// 👀 Handle student card click
studentList.addEventListener("click", (e) => {
  if (e.target.classList.contains("student-card")) {
    selectedStudentId = e.target.dataset.studentId;
    openModal(metadataModal);
  }
});

// 🧾 Metadata form submission (Day, Week, Month, Year)
metadataForm.addEventListener("submit", (e) => {
  e.preventDefault();

  metadata = {
    day: metadataForm.day.value,
    week: metadataForm.week.value,
    month: metadataForm.month.value,
    year: metadataForm.academicYear.value
  };

  closeModal(metadataModal);
  openModal(entryModal);
});

// 📝 Final Entry Submission
entryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const type = entryForm.type.value;
  const title = entryForm.title.value.trim();
  const score = entryForm.score.value.trim();

  const entryData = {
    studentId: selectedStudentId,
    ...metadata,
    type,
    title,
    score: parseFloat(score)
  };

  // 🚀 Send to backend (replace with actual POST request)
  console.log("Submitting entry data:", entryData);

  closeModal(entryModal);
  alert("Entry recorded successfully!");
});

// 📥 Class selection
classSelect.addEventListener("change", async () => {
  const classId = classSelect.value;
  const students = await fetchStudentsByClass(classId);
  renderStudents(students);
});

// 🔓 Modal control
function openModal(modal) {
  modal.classList.add("show");
  overlay.classList.add("show");
}

function closeModal(modal) {
  modal.classList.remove("show");
  overlay.classList.remove("show");
}

// 🗙 Overlay click closes modals
overlay.addEventListener("click", () => {
  closeModal(metadataModal);
  closeModal(entryModal);
});

// 🚀 Initialize
populateClasses();
const allEntries = []; // Store all student entries

// Called when teacher submits an individual student's work
function saveStudentEntry(entry) {
  allEntries.push(entry);
}

// Called when "Submit All Records" is clicked
document.getElementById("submitAllBtn").addEventListener("click", () => {
  if (allEntries.length === 0) {
    alert("No records to submit.");
    return;
  }

  // Replace this with your backend DB call
  console.log("Submitting the following entries to DB:", allEntries);

  // Reset
  allEntries.length = 0;
  alert("All records submitted successfully!");
});
