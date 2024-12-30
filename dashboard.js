document.addEventListener("DOMContentLoaded", () => {
    // Get the current user's email from storage
    chrome.storage.sync.get("currentUser", (result) => {
      const userEmail = result.currentUser;
      if (userEmail) {
        // Display the user's email in the dashboard
        document.getElementById("user-email").textContent = userEmail;
      } else {
        // If no user is logged in, redirect to login page
        window.location.href = chrome.runtime.getURL("login.html");
      }
    });
  
    // Logout functionality
    const logoutButton = document.getElementById("logout-btn");
    logoutButton.addEventListener("click", () => {
      chrome.storage.sync.remove("currentUser", () => {
        window.location.href = chrome.runtime.getURL("login.html");
      });
    });
  
    // Add event listeners for dashboard actions (if any)
    const managePasswordsButton = document.getElementById("manage-passwords-btn");
    managePasswordsButton.addEventListener("click", () => {
      // Redirect to password management page
      window.location.href = chrome.runtime.getURL("manage_passwords.html");
    });
  
    const settingsButton = document.getElementById("settings-btn");
    settingsButton.addEventListener("click", () => {
      // Redirect to settings page
      window.location.href = chrome.runtime.getURL("settings.html");
    });
  });
  