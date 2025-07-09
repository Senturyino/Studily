document.addEventListener("DOMContentLoaded", () => {
  const feeYearSelect = document.getElementById("feeYear");
  const classFilter = document.getElementById("classFilter");
  const feeRecordsContainer = document.getElementById("feeRecordsContainer");
  const setFeeForm = document.getElementById("setFeeForm");

  // 🧠 Fetch years
  async function loadAcademicYears() {
    const res = await fetch("/api/years");
    const years = await res.json();

    feeYearSelect.innerHTML = `<option disabled selected>Select Year</option>`;
    years.forEach(year => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      feeYearSelect.appendChild(option);
    });
  }

  // 🧠 Fetch all class names
  async function loadClasses() {
    const res = await fetch("/api/classes");
    const classes = await res.json();

    classFilter.innerHTML = `<option disabled selected>Select Class</option>`;
    classes.forEach(cls => {
      const opt = document.createElement("option");
      opt.value = cls;
      opt.textContent = cls;
      classFilter.appendChild(opt);
    });
  }

  // 💾 Save or update academic year fee
  setFeeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      year: feeYearSelect.value,
      amount: parseFloat(document.getElementById("feeAmount").value)
    };

    await fetch("/api/fees/set-academic-fee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    alert("Fee set successfully.");
    setFeeForm.reset();
  });

  // 🎯 Fetch student fee records by class
  classFilter.addEventListener("change", async () => {
    const selectedClass = classFilter.value;

    const res = await fetch(`/api/fees/students?class=${encodeURIComponent(selectedClass)}`);
    const records = await res.json();

    if (!records.length) {
      feeRecordsContainer.innerHTML = "<p>No records found.</p>";
      return;
    }

    let html = `
      <table class="fees-table">
        <thead>
          <tr><th>Student Name</th><th>ID</th><th>Paid (GHS)</th><th>Date</th><th>Action</th></tr>
        </thead>
        <tbody>
    `;

    records.forEach(rec => {
      html += `
        <tr>
          <td>${rec.name}</td>
          <td>${rec.id}</td>
          <td><input type="number" value="${rec.amount}" data-id="${rec.id}" class="fee-input" /></td>
          <td>${rec.date || '-'}</td>
          <td><button data-id="${rec.id}" class="update-btn">💾 Update</button></td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    feeRecordsContainer.innerHTML = html;

    // ⏫ Update button logic
    document.querySelectorAll(".update-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const input = document.querySelector(`input[data-id="${id}"]`);
        const newAmount = parseFloat(input.value);

        await fetch("/api/fees/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: id, amount: newAmount })
        });

        alert("Fee updated.");
      });
    });
  });

  // 🚀 Init
  loadAcademicYears();
  loadClasses();
});
