document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const dashboardContent = document.getElementById("dashboard-content");
    const logoutButton = document.getElementById("logout-btn");

    // Restore session state
    chrome.storage.local.get(["isLoggedIn", "currentUser"], (result) => {
        if (result.isLoggedIn && result.currentUser) {
            // User is logged in
            loadDashboard(result.currentUser);
        } else {
            // User is not logged in
            loadLogin();
        }
    });

    // Function to show the dashboard
    function loadDashboard(userEmail) {
        if (dashboardContent) {
            dashboardContent.innerHTML = `
                <h1>Welcome, ${userEmail}!</h1>
                <button id="logout-btn">Logout</button>
            `;
        }
        attachLogoutListener();
    }

    // Function to load the login page
    function loadLogin() {
        if (loginForm) {
            loginForm.style.display = "block";
            loginForm.addEventListener("submit", handleLogin);
        }
    }

    // Handle login
    function handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        chrome.storage.local.set(
            { isLoggedIn: true, currentUser: email },
            () => {
                window.location.href = "dashboard.html";
            }
        );
    }

    // Handle logout
    function attachLogoutListener() {
        if (logoutButton) {
            logoutButton.addEventListener("click", () => {
                chrome.storage.local.clear(() => {
                    window.location.href = "login.html";
                });
            });
        }
    }
});
chrome.storage.local.get(null, (result) => console.log(result));