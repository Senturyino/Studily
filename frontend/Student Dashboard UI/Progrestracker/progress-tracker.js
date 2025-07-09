const yearFilter = document.getElementById("yearFilter");
const quarterFilter = document.getElementById("quarterFilter");
const subjectFilter = document.getElementById("subjectFilter");
const ctx = document.getElementById("progressChart").getContext("2d");

let chart;

// Fetch academic years from database
async function fetchAcademicYears() {
  // Replace with real API call
  const response = await fetch('/api/academic-years');
  const years = await response.json();
  yearFilter.innerHTML = '<option disabled selected>Select year</option>' +
    years.map(y => `<option value="${y.id}">${y.name}</option>`).join('');
}

// Fetch subjects from database
async function fetchSubjects() {
  // Replace with real API call
  const response = await fetch('/api/student-subjects');
  const subjects = await response.json();
  subjectFilter.innerHTML = '<option disabled selected>Select subject</option>' +
    subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

// Fetch average data from DB for selected filters
async function fetchProgressData(yearId, quarter, subjectId) {
  const response = await fetch(`/api/progress?year=${yearId}&quarter=${quarter}&subject=${subjectId}`);
  const data = await response.json(); // expects array of numbers by week
  return data;
}

// Render Chart.js
async function renderChart() {
  const year = yearFilter.value;
  const subject = subjectFilter.value;
  const quarter = quarterFilter.value;

  if (!year || !subject || !quarter) return;

  const data = await fetchProgressData(year, quarter, subject);
  const labels = data.map((_, i) => `Week ${i + 1}`);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `Progress (${quarter})`,
        data,
        borderColor: '#302b63',
        backgroundColor: 'rgba(48,43,99,0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 10
        }
      }
    }
  });
}

// Attach event listeners
[yearFilter, quarterFilter, subjectFilter].forEach(el => {
  el.addEventListener("change", renderChart);
});

// Init dropdowns on load
document.addEventListener("DOMContentLoaded", async () => {
  await fetchAcademicYears();
  await fetchSubjects();
});
