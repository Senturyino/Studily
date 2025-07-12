const schoolSelect = document.getElementById("school");
const categorySelect = document.getElementById("category");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

// 🔄 Fetch schools based on selected category from the database
function fetchSchoolsByCategory(category) {
  // Example format: return from DB call based on category
  // return fetch(`/api/schools?category=${category}`).then(res => res.json());
  return []; // Replace with real DB fetch
}

// 🔐 Authenticate login (studentId/email + password + school)
function authenticateLogin(studentId, password, school) {
  // Replace this with actual authentication API call
  return false; // Replace with real backend validation
}

// 🌐 Populate school dropdown after category is selected
function populateSchools(category) {
  const schools = fetchSchoolsByCategory(category);

  schoolSelect.innerHTML = "";

  if (schools.length === 0) {
    schoolSelect.innerHTML = "<option disabled selected>No schools found</option>";
    return;
  }

  schoolSelect.innerHTML = "<option disabled selected>Select your school</option>";
  schools.forEach(school => {
    const option = document.createElement("option");
    option.value = school;
    option.textContent = school;
    schoolSelect.appendChild(option);
  });
}

// 🎯 Handle category selection change
categorySelect.addEventListener("change", (e) => {
  const selectedCategory = e.target.value;
  populateSchools(selectedCategory);
});

// 🎯 Handle form submission
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const studentId = document.getElementById("studentId").value.trim();
  const password = document.getElementById("password").value.trim();
  const school = schoolSelect.value;

  const isValid = authenticateLogin(studentId, password, school);

  if (isValid) {
    window.location.href = "../Student Dashboard UI/dashboard.html"; // or admin path
  } else {
    loginError.textContent = "Invalid credentials. Please check your information.";
  }
});