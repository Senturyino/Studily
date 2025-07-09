const yearFilter = document.getElementById("yearFilter");
const pdfContainer = document.getElementById("pdfContainer");
const pdfActions = document.getElementById("pdfActions");
const downloadBtn = document.getElementById("downloadBtn");
const printBtn = document.getElementById("printBtn");
const shareBtn = document.getElementById("shareBtn");

let currentPdfUrl = null;

// 🔄 Fetch academic years from DB (replace with actual backend fetch later)
function fetchAcademicYears() {
  return []; // Empty to reflect real-time DB fetch (no false data)
}

// 🔗 Fetch result PDF URL for a selected year (replace with backend API)
function fetchPDFUrl(year) {
  return null; // Replace with actual PDF URL from database
}

// 🧠 Populate academic year dropdown
function populateYearDropdown() {
  const years = fetchAcademicYears();

  if (years.length === 0) {
    yearFilter.innerHTML = `<option disabled selected>No academic years available</option>`;
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

// 📥 Handle year change
yearFilter.addEventListener("change", () => {
  const selectedYear = yearFilter.value;
  const pdfUrl = fetchPDFUrl(selectedYear);
  currentPdfUrl = pdfUrl;

  if (!pdfUrl) {
    pdfContainer.innerHTML = `<p style="color: #888;">No result PDF found for ${selectedYear}.</p>`;
    pdfActions.style.display = "none";
    return;
  }

  pdfContainer.innerHTML = `
    <iframe id="pdfFrame" src="${pdfUrl}" width="100%" height="600px" style="border: 1px solid #ccc; border-radius: 8px;"></iframe>
  `;

  pdfActions.style.display = "flex";
});

// ⬇️ Download PDF
downloadBtn.addEventListener("click", () => {
  if (currentPdfUrl) {
    const link = document.createElement("a");
    link.href = currentPdfUrl;
    link.download = "Result.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});

// 🖨️ Print PDF
printBtn.addEventListener("click", () => {
  const frame = document.getElementById("pdfFrame");
  if (frame) {
    frame.contentWindow.focus();
    frame.contentWindow.print();
  }
});

// 📤 Share PDF
shareBtn.addEventListener("click", async () => {
  if (!currentPdfUrl) return;

  try {
    if (navigator.share) {
      await navigator.share({
        title: "My Academic Result",
        text: "Here is my result from Studily.",
        url: currentPdfUrl,
      });
    } else {
      await navigator.clipboard.writeText(currentPdfUrl);
      alert("Result link copied to clipboard.");
    }
  } catch (err) {
    console.error("Sharing failed:", err);
    alert("Sharing failed.");
  }
});

// 🔃 Init
populateYearDropdown();
// Highlight active sidebar link
const currentPage = window.location.pathname.split("/").pop();
const navLinks = document.querySelectorAll(".sidebar nav ul li a");

navLinks.forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});