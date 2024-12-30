document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const logoutButton = document.getElementById("logout-btn");

  // Restore session state
  chrome.storage.local.get(["isLoggedIn", "currentUser"], (result) => {
      const { isLoggedIn, currentUser } = result;

      if (isLoggedIn) {
          document.body.innerHTML = `<h1>Welcome, ${currentUser}!</h1>
                                     <button id="logout-btn">Logout</button>`;
      } else {
          // Keep login/signup forms visible
          console.log("No active session.");
      }
  });

  // Handle login
  if (loginForm) {
      loginForm.addEventListener("submit", (event) => {
          event.preventDefault();
          const email = document.getElementById("email").value;
          chrome.storage.local.set({ isLoggedIn: true, currentUser: email }, () => {
              window.location.href = "dashboard.html";
          });
      });
  }

  // Handle logout
  if (logoutButton) {
      logoutButton.addEventListener("click", () => {
          chrome.storage.local.remove(["isLoggedIn", "currentUser"], () => {
              window.location.href = "login.html";
          });
      });
  }
});