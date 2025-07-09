const monthSelector = document.getElementById("monthSelector");
const attendanceDisplay = document.getElementById("attendanceDisplay");

monthSelector.addEventListener("change", () => {
  const selectedMonth = monthSelector.value;
  displayAttendanceUI(selectedMonth);
});

function displayAttendanceUI(month) {
  attendanceDisplay.innerHTML = "";

  const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  weekLabels.forEach((week, i) => {
    const weekContainer = document.createElement("div");
    weekContainer.className = "attendance-week";

    const title = document.createElement("h4");
    title.textContent = `${week}`;
    weekContainer.appendChild(title);

    const dayGrid = document.createElement("div");
    dayGrid.className = "attendance-days";

    days.forEach(day => {
      const dayDiv = document.createElement("div");
      dayDiv.className = "attendance-day";
      dayDiv.setAttribute("data-week", i + 1);
      dayDiv.setAttribute("data-day", day.toLowerCase());
      dayDiv.textContent = day;

      // Status will be filled dynamically after backend is connected
      dayGrid.appendChild(dayDiv);
    });

    weekContainer.appendChild(dayGrid);
    attendanceDisplay.appendChild(weekContainer);
  });
}
// Highlight active sidebar link
const currentPage = window.location.pathname.split("/").pop();
const navLinks = document.querySelectorAll(".sidebar nav ul li a");

navLinks.forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});