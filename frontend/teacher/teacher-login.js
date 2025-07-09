const categorySelect = document.getElementById("schoolCategory");
const schoolSelect = document.getElementById("school");
const loginForm = document.getElementById("teacherLoginForm");
const loginError = document.getElementById("loginError");

// Fetch schools from database based on category
function fetchSchoolsByCategory(category) {
  return []; // Replace with real database fetch
}

// Populate schools after selecting category
categorySelect.addEventListener("change", () => {
  const category = categorySelect.value;
  const schools = fetchSchoolsByCategory(category);

  schoolSelect.innerHTML = '<option disabled selected>Select your school</option>';
  schools.forEach(school => {
    const option = document.createElement("option");
    option.value = school;
    option.textContent = school;
    schoolSelect.appendChild(option);
  });
});

// Handle login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const school = schoolSelect.value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const isValid = authenticateTeacher(email, password, school);

  if (isValid) {
    window.location.href = "../teacher/dashboard.html";
  } else {
    loginError.textContent = "Invalid credentials. Please check your login info.";
  }
});

function authenticateTeacher(email, password, school) {
  return false; // Replace with real DB check
}
