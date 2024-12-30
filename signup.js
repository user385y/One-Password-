// document.addEventListener("DOMContentLoaded", function () {
//     const faceIdButton = document.getElementById("facial-recognition-btn");
//     const faceIdStatus = document.getElementById("face-id-status");
//     const signupForm = document.getElementById("signup-form");
//     const errorMessage = document.getElementById("error-message");
  
//     // Set initial Face ID status
//     faceIdStatus.value = "not-clicked";
  
//     // Handle Face ID button click
//     faceIdButton.addEventListener("click", function () {
//       // Simulate Face ID success (replace this with real logic)
//       faceIdStatus.value = "clicked";
//       errorMessage.textContent = "Face ID verified!";
//       errorMessage.style.color = "green";
//     });
  
//     // Handle form submission
//     signupForm.addEventListener("submit", function (event) {
//       event.preventDefault();
  
//       const email = document.getElementById("email").value.trim();
//       const password = document.getElementById("password").value.trim();
//       const confirmPassword = document.getElementById("confirm-password").value.trim();
  
//       // Clear previous error messages
//       errorMessage.textContent = "";
  
//       // Validate form fields
//       if (!email || !password || !confirmPassword) {
//         errorMessage.textContent = "All fields are required!";
//         return;
//       }
  
//       if (password !== confirmPassword) {
//         errorMessage.textContent = "Passwords do not match!";
//         return;
//       }
  
//       // Check if Face ID was clicked
//       if (faceIdStatus.value === "not-clicked") {
//         errorMessage.textContent = "Please verify your Face ID before signing up!";
//         return;
//       }
  
//       // Simulate successful submission
//       errorMessage.textContent = "Form submitted successfully!";
//       errorMessage.style.color = "green";
//     });
//   });
  