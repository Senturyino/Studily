document.addEventListener("DOMContentLoaded", () => {
  const classSelect = document.getElementById("classSelect");
  const yearSelect = document.getElementById("academicYear");
  const uploadForm = document.getElementById("uploadResultsForm");
  const uploadMessage = document.getElementById("uploadMessage");

  function fetchClasses() {
    return []; // Fetch from DB
  }

  function fetchAcademicYears() {
    return []; // Fetch from DB
  }

  function populateDropdown(selectElement, items, placeholder) {
    selectElement.innerHTML = `<option disabled selected>${placeholder}</option>`;
    items.forEach(item => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      selectElement.appendChild(option);
    });
  }

  function initForm() {
    const classes = fetchClasses();
    const years = fetchAcademicYears();
    populateDropdown(classSelect, classes, "Select Class");
    populateDropdown(yearSelect, years, "Select Academic Year");
  }

  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(uploadForm);
    const files = document.getElementById("pdfFolder").files;

    if (!files.length) {
      uploadMessage.textContent = "No files selected.";
      return;
    }

    const selectedClass = formData.get("class");
    const selectedYear = formData.get("year");
    const selectedTerm = formData.get("term");

    for (let file of files) {
      const studentId = file.name.split(".")[0];
      console.log("Uploading:", {
        studentId,
        file,
        class: selectedClass,
        year: selectedYear,
        term: selectedTerm
      });
    }

    uploadMessage.textContent = "✅ Upload completed. (Simulated)";
    uploadForm.reset();
  });

  initForm();
});
