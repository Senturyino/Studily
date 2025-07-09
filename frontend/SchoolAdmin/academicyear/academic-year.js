document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#academicYearsTable tbody");
  const addYearForm = document.querySelector("#addYearForm");
  const inputYear = document.querySelector("#newYear");

  const schoolId = localStorage.getItem("schoolId"); // Set on login

  const loadYears = async () => {
    try {
      const res = await fetch(`/api/academic-years?schoolId=${schoolId}`);
      const years = await res.json();

      tableBody.innerHTML = "";
      years.forEach((year) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${year.name}</td>
          <td>${year.isActive ? "Active" : "Inactive"}</td>
          <td>
            ${
              !year.isActive
                ? `<button onclick="setActiveYear('${year._id}')">Set Active</button>`
                : ""
            }
            <button onclick="deleteYear('${year._id}')">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    } catch (err) {
      console.error("Error loading years:", err);
    }
  };

  addYearForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const yearName = inputYear.value.trim();
    if (!yearName) return;

    try {
      const res = await fetch("/api/academic-years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: yearName, schoolId }),
      });
      if (res.ok) {
        inputYear.value = "";
        loadYears();
      }
    } catch (err) {
      console.error("Error adding year:", err);
    }
  });

  window.setActiveYear = async (yearId) => {
    try {
      await fetch(`/api/academic-years/${yearId}/activate`, {
        method: "PUT",
      });
      loadYears();
    } catch (err) {
      console.error("Error setting active year:", err);
    }
  };

  window.deleteYear = async (yearId) => {
    if (!confirm("Are you sure you want to delete this academic year?")) return;
    try {
      await fetch(`/api/academic-years/${yearId}`, {
        method: "DELETE",
      });
      loadYears();
    } catch (err) {
      console.error("Error deleting year:", err);
    }
  };

  loadYears();
});
