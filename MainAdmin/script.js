document.getElementById('deleteAdminForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const code = this.querySelector('input[type="password"]').value;
  if (code === '0nMeth') {
    alert('Admin deletion authorized.');
    // Backend API call to delete admin goes here
  } else {
    alert('Invalid code. Deletion not authorized.');
  }
});
