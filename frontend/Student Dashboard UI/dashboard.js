/* -----------------------------------
🧠 ELEMENT SELECTORS
----------------------------------- */
const toggleBtn = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");
const menuItems = document.querySelectorAll(".sidebar nav ul li");

/* -----------------------------------
☰ TOGGLE SIDEBAR & OVERLAY VISIBILITY
----------------------------------- */
toggleBtn.addEventListener("click", (event) => {
  event.stopPropagation(); // Prevent event from bubbling to document

  const isOpen = sidebar.classList.toggle("open"); // Toggle sidebar class

  // Show or hide overlay with fade
  if (isOpen) {
    overlay.classList.add("show");
  } else {
    overlay.classList.remove("show");
  }
});

/* -----------------------------------
🌓 HIDE SIDEBAR BY CLICKING OVERLAY
----------------------------------- */
overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
});

/* -----------------------------------
📱 AUTO-CLOSE SIDEBAR ON MOBILE LINK CLICK
----------------------------------- */
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  });
});

/* -----------------------------------
🚫 CLOSE SIDEBAR WHEN CLICKING OUTSIDE
----------------------------------- */
document.addEventListener("click", (event) => {
  const isClickInsideSidebar = sidebar.contains(event.target);
  const isClickOnToggle = toggleBtn.contains(event.target);

  // If clicked outside sidebar and toggle button, close it
  if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }
});


document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:5000/api/students')
    .then(res => res.json())
    .then(data => {
      const tableBody = document.querySelector('#studentsTable tbody');
      tableBody.innerHTML = ''; // clear if any old data

      data.forEach((student, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${student.full_name}</td>
          <td>${student.student_id}</td>
          <td>${student.class}</td>
          <td>${student.email}</td>
          <td>${student.school_name}</td>
        `;

        tableBody.appendChild(row);
      });
    })
    .catch(err => {
      console.error('Failed to fetch students:', err);
    });
});
// Highlight active sidebar link
const currentPage = window.location.pathname.split("/").pop();
const navLinks = document.querySelectorAll(".sidebar nav ul li a");

navLinks.forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});