const yearFilter = document.getElementById("yearFilter");
const feesList = document.getElementById("feesList");
const paymentStatus = document.getElementById("paymentStatus");

// 🚀 Fetch from database (stubbed — backend to implement)
function fetchAcademicYears() {
  return []; // No false years
}

function fetchFeesForYear(year) {
  return []; // Real payment records should come from DB
}

function fetchPaymentStatus(year) {
  return null; // true (paid), false (unpaid), or null
}

// Populate dropdown
function populateAcademicYears() {
  const years = fetchAcademicYears();
  if (years.length === 0) {
    yearFilter.innerHTML = `<option disabled selected>No academic years </option>`;
    return;
  }

  yearFilter.innerHTML = `<option disabled selected>Select academic year</option>`;
  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });
}

// Handle selection
yearFilter.addEventListener("change", () => {
  const year = yearFilter.value;
  const records = fetchFeesForYear(year);
  const status = fetchPaymentStatus(year);

  // Render fee records
  if (!records.length) {
    feesList.innerHTML = `<p style="color:#888;">No payment records found for ${year}.</p>`;
  } else {
    feesList.innerHTML = `
      <table class="fees-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount Paid</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(rec => `
            <tr>
              <td>${rec.date}</td>
              <td>GHS ${rec.amount}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    `;
  }

  // Render status
  if (status === true) {
    paymentStatus.innerHTML = `<p style="color:green; font-weight:bold;">✅ Full Fees Paid for ${year}</p>`;
  } else if (status === false) {
    paymentStatus.innerHTML = `<p style="color:red; font-weight:bold;">❌ Fees NOT fully paid for ${year}</p>`;
  } else {
    paymentStatus.innerHTML = `<p style="color:#aaa;">No payment status found for ${year}</p>`;
  }
});

populateAcademicYears();
// Highlight active sidebar link
const currentPage = window.location.pathname.split("/").pop();
const navLinks = document.querySelectorAll(".sidebar nav ul li a");

navLinks.forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});