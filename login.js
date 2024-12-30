const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Log in the user
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('User logged in:', user);
      alert('Login successful!');
    })
    .catch((error) => {
      console.error("Error logging in:", error.message);
      alert(error.message);
    });

// ****************************forgot passoword****************

const resetpassword = document.getElementById("Forgotpassword");
    if (resetpassword) {
      resetpassword.addEventListener("click", (event) => {
        event.preventDefault();
        loadPage("forgotpassword.html");
      });
    }
  });
  
  // Function to dynamically load a page
  function loadPage(page) {
    fetch(page)
      .then((response) => response.text())
      .then((html) => {
        document.body.innerHTML = html;
        // Reinitialize event listeners for the newly loaded content
        document.dispatchEvent(new Event("DOMContentLoaded"));
      })
      .catch((error) => console.error("Error loading page:", error));
  }


