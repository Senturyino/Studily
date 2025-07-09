document.addEventListener("DOMContentLoaded", () => {
  const target = document.getElementById("target");
  const classGroup = document.getElementById("classGroup");
  const studentGroup = document.getElementById("studentGroup");
  const classSelect = document.getElementById("class");
  const studentSelect = document.getElementById("student");
  const messageForm = document.getElementById("messageForm");
  const schoolId = localStorage.getItem("schoolId");

  target.addEventListener("change", async () => {
    classGroup.style.display = "none";
    studentGroup.style.display = "none";

    if (target.value === "class") {
      classGroup.style.display = "block";
      const res = await fetch(`/api/classes?schoolId=${schoolId}`);
      const classes = await res.json();
      classSelect.innerHTML = classes.map(cls => `<option value="${cls.id}">${cls.name}</option>`).join("");
    }

    if (target.value === "student") {
      studentGroup.style.display = "block";
      const res = await fetch(`/api/students?schoolId=${schoolId}`);
      const students = await res.json();
      studentSelect.innerHTML = students.map(stu => `<option value="${stu.id}">${stu.name}</option>`).join("");
    }
  });

  messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      target: target.value,
      classId: classSelect.value,
      studentId: studentSelect.value,
      message: document.getElementById("message").value.trim(),
      schoolId
    };

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Message sent successfully!");
      messageForm.reset();
      classGroup.style.display = "none";
      studentGroup.style.display = "none";
    } else {
      alert("Failed to send message.");
    }
  });
});
