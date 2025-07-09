const schoolCategory = document.getElementById("schoolCategory");
const adminSchool = document.getElementById("adminSchool");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginError = document.getElementById("adminLoginError");

// 🔄 Fetch schools by category from database
function fetchSchoolsByCategory(category) {
  return []; // Replace with real DB fetch
}

// 🔐 Authenticate School Admin login
function authenticateAdminLogin(email, password, school) {
  return false; // Replace with real DB validation
}

// 🌐 Populate schools dropdown
function populateSchoolOptions(category) {
  const schools = fetchSchoolsByCategory(category);

  adminSchool.innerHTML = schools.length === 0
    ? `<option disabled selected>No schools available</option>`
    : `<option disabled selected>Select school</option>`;

  schools.forEach(school => {
    const option = document.createElement("option");
    option.value = school;
    option.textContent = school;
    adminSchool.appendChild(option);
  });
}

// 🎯 Handle school category change
schoolCategory.addEventListener("change", (e) => {
  const selectedCategory = e.target.value;
  populateSchoolOptions(selectedCategory);
});

// 🎯 Handle login form submit
adminLoginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value.trim();
  const school = adminSchool.value;

  const isValid = authenticateAdminLogin(email, password, school);

  if (isValid) {
    // ✅ Successful login
    window.location.href = "../AdminDashboard/dashboard.html";
  } else {
    // ❌ Invalid credentials
    adminLoginError.textContent = "Invalid login details. Please try again.";
  }
});
