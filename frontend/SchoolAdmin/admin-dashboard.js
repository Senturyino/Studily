// Menu Toggle (Mobile)
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  });
}

if (overlay) {
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  });
}

// Fetch school data (REPLACE with real fetch)
function fetchAdminDashboardData() {
  return {
    studentCount: "--",
    academicYear: "--",
    feesStatus: "--",
    resultsUploaded: "--"
  };
}

function populateDashboard() {
  const data = fetchAdminDashboardData();

  document.getElementById("studentCount").textContent = data.studentCount;
  document.getElementById("academicYear").textContent = data.academicYear;
  document.getElementById("feesStatus").textContent = data.feesStatus;
  document.getElementById("resultsUploaded").textContent = data.resultsUploaded;
}

populateDashboard();
