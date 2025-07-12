// 🔁 RESET PASSWORD FORM BEHAVIOR

// 🎯 Get the form and success message element
const form = document.getElementById("resetForm");
const success = document.getElementById("successMessage");

// 🧠 Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Stop actual form submission (no page reload)

  // 📨 Simulate sending reset instructions (fake for now)
  form.reset(); // Clear all input fields
  success.style.display = "block"; // Show success message
});