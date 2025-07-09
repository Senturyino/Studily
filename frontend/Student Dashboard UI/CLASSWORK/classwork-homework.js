const yearFilter = document.getElementById("yearFilter");
const monthFilter = document.getElementById("monthFilter");
const subjectFilter = document.getElementById("subjectFilter");

const classworkDisplay = document.getElementById("classworkDisplay");
const homeworkDisplay = document.getElementById("homeworkDisplay");

const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function renderSections() {
  const year = yearFilter.value;
  const month = monthFilter.value;
  const subject = subjectFilter.value;

  if (!year || !month || !subject) return;

  renderSection(classworkDisplay, "classwork", year, month, subject);
  renderSection(homeworkDisplay, "homework", year, month, subject);
}

function renderSection(container, type, year, month, subject) {
  container.innerHTML = "";

  weekLabels.forEach((week, i) => {
    const weekBox = document.createElement("div");
    weekBox.className = "cw-hw-week";

    const title = document.createElement("h4");
    title.textContent = `${week}`;
    weekBox.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "cw-hw-days";

    days.forEach(day => {
      const cell = document.createElement("div");
      cell.className = "cw-hw-day";
      cell.textContent = `${day}`;
      cell.setAttribute("data-year", year);
      cell.setAttribute("data-month", month);
      cell.setAttribute("data-week", i + 1);
      cell.setAttribute("data-day", day.toLowerCase());
      cell.setAttribute("data-type", type);
      cell.setAttribute("data-subject", subject);
      grid.appendChild(cell);
    });

    weekBox.appendChild(grid);
    container.appendChild(weekBox);
  });
}

yearFilter.addEventListener("change", renderSections);
monthFilter.addEventListener("change", renderSections);
subjectFilter.addEventListener("change", renderSections);
// Highlight active sidebar link
const currentPage = window.location.pathname.split("/").pop();
const navLinks = document.querySelectorAll(".sidebar nav ul li a");

navLinks.forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});