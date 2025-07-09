document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addTeacherBtn");
  const popup = document.getElementById("teacherPopup");
  const form = document.getElementById("teacherForm");
  const tableContainer = document.getElementById("teacherTableContainer");

  function fetchTeachers() {
    return []; // replace with backend DB fetch
  }

  function deleteTeacher(id) {
    // backend delete logic
  }

  function renderTeachers(teachers) {
    if (!teachers.length) {
      tableContainer.innerHTML = "<p>No teachers found.</p>";
      return;
    }
    const rows = teachers.map(t => `
      <tr>
        <td>${t.name}</td>
        <td>${t.email}</td>
        <td>${t.subject}</td>
        <td><button data-id="\${t.id}" class="delete-btn">🗑️</button></td>
      </tr>
    `).join("");
    tableContainer.innerHTML = \`
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Subject</th><th>Action</th></tr>
        </thead>
        <tbody>\${rows}</tbody>
      </table>
    \`;

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Delete this teacher?")) {
          deleteTeacher(id);
          loadTeachers();
        }
      };
    });
  }

  function loadTeachers() {
    const teachers = fetchTeachers();
    renderTeachers(teachers);
  }

  addBtn.onclick = () => popup.style.display = "flex";
  window.onclick = e => { if (e.target === popup) popup.style.display = "none"; };

  form.onsubmit = e => {
    e.preventDefault();
    const newTeacher = {
      name: document.getElementById("teacherName").value.trim(),
      email: document.getElementById("teacherEmail").value.trim(),
      password: document.getElementById("teacherPassword").value.trim(),
      subject: document.getElementById("teacherSubject").value.trim()
    };
    // send to backend DB
    popup.style.display = "none";
    form.reset();
    loadTeachers();
  };

  loadTeachers();
});