document.addEventListener('DOMContentLoaded', () => {
  const addStudentBtn = document.getElementById("addStudentBtn");
  const studentPopup = document.getElementById("studentPopup");
  const studentForm = document.getElementById("studentForm");
  const studentYearSelect = document.getElementById("studentYear");
  const studentTableContainer = document.getElementById("studentTableContainer");
  const closePopupBtn = document.getElementById("closePopupBtn");

  function fetchAcademicYears() {
    return ["2023/2024", "2024/2025"]; // Replace with DB fetch
  }

  function fetchStudents() {
    return []; // Replace with DB fetch
  }

  function deleteStudentById(id) {
    console.log("Delete student:", id); // Replace with DB logic
  }

  function renderStudents(students) {
    if (!students.length) {
      studentTableContainer.innerHTML = "<p>No students found.</p>";
      return;
    }

    studentTableContainer.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th><th>ID</th><th>Email</th><th>Class</th><th>Year</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(student => `
            <tr>
              <td>${student.name}</td>
              <td>${student.id}</td>
              <td>${student.email}</td>
              <td>${student.class}</td>
              <td>${student.year}</td>
              <td><button class="delete-btn" data-id="${student.id}">🗑️</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this student?")) {
          deleteStudentById(id);
          loadStudents();
        }
      });
    });
  }

  studentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const studentData = {
      name: document.getElementById("studentName").value.trim(),
      id: document.getElementById("studentId").value.trim(),
      email: document.getElementById("studentEmail").value.trim(),
      password: document.getElementById("studentPassword").value.trim(),
      class: document.getElementById("studentClass").value.trim(),
      year: studentYearSelect.value
    };

    console.log("Saving student to DB:", studentData); // Replace with DB logic
    studentForm.reset();
    studentPopup.style.display = "none";
    loadStudents();
  });

  function loadAcademicYears() {
    const years = fetchAcademicYears();
    studentYearSelect.innerHTML = `<option disabled selected>Select academic year</option>`;
    years.forEach(year => {
      const opt = document.createElement("option");
      opt.value = year;
      opt.textContent = year;
      studentYearSelect.appendChild(opt);
    });
  }

  function loadStudents() {
    const students = fetchStudents();
    renderStudents(students);
  }

  addStudentBtn.addEventListener("click", () => {
    studentPopup.style.display = "flex";
    document.getElementById("popupTitle").textContent = "Add Student";
  });

  closePopupBtn.addEventListener("click", () => {
    studentPopup.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === studentPopup) {
      studentPopup.style.display = "none";
    }
  });

  loadAcademicYears();
  loadStudents();
});
