// ****************************retain state********************************
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

// ********************SIGNUP********************

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const faceRecognitionButton = document.getElementById("facial-recognition-btn");
  const submitButton = document.getElementById("signup-submit");
  let isFaceRecognitionComplete = false;

  // Hash the password
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // Handle Face ID capture
  if(faceRecognitionButton) faceRecognitionButton.addEventListener("click", () => {
    faceRecognitionButton.textContent = "Processing...";
    const cameraWindow = window.open("camera.html", "CameraWindow", "width=800,height=600");

    const pollFaceRecognition = setInterval(() => {
      chrome.storage.sync.get("faceDescriptorArray", async (result) => {
        if (result.faceDescriptorArray) {
          // Ensure the descriptor is an array and only then set completion
          if (Array.isArray(result.faceDescriptorArray) && result.faceDescriptorArray.length > 0) {
            clearInterval(pollFaceRecognition);
            isFaceRecognitionComplete = true;
            faceRecognitionButton.textContent = "Face ID Completed";
            faceRecognitionButton.style.backgroundColor = "green";
            chrome.storage.sync.set({ faceDataCaptured: true }); // Optional: Mark that face data was captured
            cameraWindow.close();
          }
        }
      });
    }, 50000);
  });

  // Handle form submission
  if(signupForm) signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isFaceRecognitionComplete) {
      alert("Please complete Face ID before signing up.");
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const hashedPassword = await hashPassword(password);

    chrome.storage.sync.get("users", (data) => {
      const users = data.users || {};

      if (users[email]) {
        alert("Email already exists.");
      } else {
        // Fetch face descriptor from storage
        chrome.storage.sync.get("faceDescriptorArray", (faceDataResult) => {
          const faceData = faceDataResult.faceDescriptorArray || null;

          // Store the user data
          users[email] = {
            email: email,
            password: hashedPassword,
            faceData: faceData,
          };

          chrome.storage.sync.set({ users }, () => {
            alert("Signup successful!");
            chrome.storage.sync.remove("faceDescriptorArray"); // Clean up face data
            window.location.href = "login.html";
          });
        });
      }
    });
  });
});




// ****************************************LOGIN************************************************

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("Login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const faceRecognitionButton = document.getElementById("face-Recognition-Button");

  // Hash the password
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // Password login
  if(loginForm) loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const hashedPassword = await hashPassword(password);

    chrome.storage.sync.get("users", (data) => {
      const users = data.users || {};
      const user = users[email];

      if (!user) {
        alert("User not found.");
        return;
      }

      if (user.password === hashedPassword) {
        alert("Login successful!");
        chrome.storage.sync.set({ isLoggedIn: true, currentUser: email });
        window.location.href = "dashboard.html";
      } else {
        alert("Incorrect password.");
      }
    });
  });

//   // Face ID login
if (faceRecognitionButton) {
    faceRecognitionButton.addEventListener("click", () => {
        // Open the camera window
        const cameraWindow = window.open("camera.html", "CameraWindow", "width=800,height=600");

        const pollFaceRecognition = setInterval(() => {
            // Retrieve the stored face descriptor from Chrome storage
            chrome.storage.sync.get(["faceDescriptorArray", "users"], (result) => {
                const { faceDescriptorArray } = result;
                const users = result.users || {};

                if (!faceDescriptorArray) {
                    console.log("No face descriptor detected in storage.");
                    return;
                }

                // Compare the detected face descriptor with registered user data
                let loginSuccessful = false;
                let loggedInUserEmail = null;

                for (const email in users) {
                    const user = users[email];

                    if (user.faceData) {
                        const storedDescriptor = user.faceData;

                        // Ensure faceDescriptorArray is in the correct format (Array or Tensor) before comparison
                        if (Array.isArray(faceDescriptorArray) && Array.isArray(storedDescriptor)) {
                            const distance = faceapi.euclideanDistance(faceDescriptorArray, storedDescriptor);

                            console.log(`Comparing face for user: ${email}, Distance: ${distance}`);

                            // Check if the distance is within an acceptable threshold (e.g., 0.6)
                            if (distance <= 0.6) {
                                loginSuccessful = true;
                                loggedInUserEmail = email;
                                break;
                            }
                        } else {
                            console.error("Invalid face descriptor format.");
                        }
                    }
                }

                if (loginSuccessful) {
                    clearInterval(pollFaceRecognition);
                    alert(`Face ID login successful! Welcome, ${loggedInUserEmail}.`);

                    // Update login status and current user in storage
                    chrome.storage.sync.set({ isLoggedIn: true, currentUser: loggedInUserEmail });

                    // Redirect to dashboard
                    window.location.href = "dashboard.html";
                    
                    // Close the camera window
                    cameraWindow.close();
                } else {
                    console.log("Face recognition failed. No match found.");
                }
            });
        }, 500); // Check every 500ms for the face descriptor

        // Cleanup and alert on failure after a timeout (e.g., 30 seconds)
        setTimeout(() => {
            clearInterval(pollFaceRecognition);
            alert("Face ID login failed. Please try again.");
            cameraWindow.close();
        }, 300000); // 30 seconds timeout
    });
}

});



// ********************SIGNUP********************

// document.addEventListener("DOMContentLoaded", () => {
//   console.log("Current Pathname:", window.location.pathname);

//   let isFaceRecognitionComplete = false;

//   // Elements
//   const faceRecognitionButton = document.getElementById("facial-recognition-btn");
//   const submitButton = document.getElementById("signup-submit");
//   const signupForm = document.getElementById("signup-form");
//   const emailInput = document.getElementById("email");
//   const passwordInput = document.getElementById("password");
//   const confirmPasswordInput = document.getElementById("confirm-password");
//   const emailErrorMessage = document.getElementById("email-error-message");
//   const passwordErrorMessage = document.getElementById("password-error-message");
//   const successMessage = document.getElementById("success-message");

//   submitButton.disabled = true;

//   // Hash password using SHA-256
//   async function hashPassword(password) {
//     const encoder = new TextEncoder();
//     const data = encoder.encode(password);
//     const hash = await crypto.subtle.digest("SHA-256", data);
//     return Array.from(new Uint8Array(hash))
//       .map((b) => b.toString(16).padStart(2, "0"))
//       .join("");
//   }

//   // Handle Face ID button click
//   if (faceRecognitionButton) {
//     faceRecognitionButton.addEventListener("click", () => {
//       faceRecognitionButton.textContent = "Processing...";
//       faceRecognitionButton.disabled = true;

//       const cameraWindow = window.open(
//         "camera.html",
//         "CameraWindow",
//         "width=800,height=600,scrollbars=no,resizable=no"
//       );

//       const pollFaceRecognition = setInterval(() => {
//         chrome.storage.sync.get("faceDescriptorArray", (result) => {
//           if (result.faceDescriptorArray) {
//             clearInterval(pollFaceRecognition);
//             isFaceRecognitionComplete = true;
//             faceRecognitionButton.textContent = "Face ID Completed";
//             faceRecognitionButton.style.backgroundColor = "green";
//             submitButton.disabled = false;
//             cameraWindow.close();
//           }
//         });
//       }, 500);

//       setTimeout(() => {
//         clearInterval(pollFaceRecognition);
//         cameraWindow.close();
//         faceRecognitionButton.textContent = "Face ID Failed. Try Again.";
//         faceRecognitionButton.disabled = false;
//       }, 30000); // 30-second timeout
//     });
//   }

//   // Email validation
//   function validateEmail(email) {
//     const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|icloud\.com|me\.com)$/;
//     return emailPattern.test(email);
//   }

//   // Password validation
//   function validatePassword(password) {
//     return password.length >= 6;
//   }

//   // Validate form
//   function validateForm() {
//     emailErrorMessage.textContent = "";
//     passwordErrorMessage.textContent = "";
//     successMessage.style.display = "none";

//     const email = emailInput.value.trim();
//     const password = passwordInput.value;
//     const confirmPassword = confirmPasswordInput.value;

//     let isValid = true;

//     if (!validateEmail(email)) {
//       emailErrorMessage.textContent = "Please enter a valid email address.";
//       emailErrorMessage.style.color = "red";
//       isValid = false;
//     }

//     if (!validatePassword(password)) {
//       passwordErrorMessage.textContent = "Password must be at least 6 characters long.";
//       passwordErrorMessage.style.color = "red";
//       isValid = false;
//     }

//     if (password !== confirmPassword) {
//       passwordErrorMessage.textContent = "Passwords do not match.";
//       passwordErrorMessage.style.color = "red";
//       isValid = false;
//     }

//     return isValid;
//   }

//   // Handle form submission
//   if (signupForm) {
//     signupForm.addEventListener("submit", async (event) => {
//       event.preventDefault();

//       if (!isFaceRecognitionComplete) {
//         alert("You must complete Face ID before signing up!");
//         return;
//       }

//       if (validateForm()) {
//         const email = emailInput.value.trim();
//         const password = await hashPassword(passwordInput.value);

//         chrome.storage.sync.get("users", (data) => {
//           const users = data.users || {};

//           if (users[email]) {
//             emailErrorMessage.textContent = "Email already exists!";
//             emailErrorMessage.style.color = "red";
//           } else {
//             users[email] = {
//               email,
//               password,
//               faceData: data.faceDescriptorArray || null,
//             };

//             chrome.storage.sync.set({ users }, () => {
//               if (chrome.runtime.lastError) {
//                 console.error("Error storing credentials:", chrome.runtime.lastError);
//               } else {
//                 successMessage.textContent = "Sign Up successful!";
//                 successMessage.style.color = "green";
//                 successMessage.style.display = "block";

//                 chrome.storage.sync.remove("faceDescriptorArray", () => {
//                   console.log("Face data cleared after signup.");
//                 });

//                 setTimeout(() => {
//                   window.location.href = "login.html";
//                 }, 2000);
//               }
//             });
//           }
//         });
//       }
//     });
//   }
// });



// // ****************************************LOGIN************************************************

// document.addEventListener("DOMContentLoaded", () => {
//   const loginForm = document.getElementById("Login-form");
//   const loginEmailInput = document.getElementById("email");
//   const loginPasswordInput = document.getElementById("password");
//   const loginMessage = document.getElementById("success-message");
//   const emailerrormessage = document.getElementById("email-error-message");
//   const passworderrormessage = document.getElementById("password-error-message");

//   if (loginForm) {
//     loginForm.addEventListener("submit", (event) => {
//       event.preventDefault(); // Prevent form submission

//       const email = loginEmailInput.value.trim();
//       const password = loginPasswordInput.value;

//       function validateEmail(email) {
//         const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|icloud\.com|me\.com)$/;
//         return emailPattern.test(email);
//       }

//       // Email validation check
//       if (!validateEmail(email)) {
//         emailerrormessage.textContent = 'Please enter a valid email address (e.g., gmail.com, icloud.com, me.com).';
//         emailerrormessage.style.color = 'red';
//         return; // Stop further execution if the email is invalid
//       }

//       // Check credentials in storage
//       chrome.storage.sync.get(email, (result) => {
//         console.log("Checking user credentials for:", email);

//         if (result[email]) {
//           // Check if passwords match
//           if (result[email].password === password) {
//             loginMessage.textContent = "Login successful!";
//             loginMessage.style.color = "green";
//             console.log("Login successful");

//             // Set logged-in state in sync storage
//             chrome.storage.sync.set({ isLoggedIn: true, currentUser: email }, () => {
//               console.log("User is logged in.");
              
//               // Redirect with a slight delay to allow UI updates
//               setTimeout(() => {
//                 window.location.href = chrome.runtime.getURL("dashboard.html"); // Redirect to dashboard
//               }, 1000); // 1-second delay for smooth transition
//             });
//           } else {
//             loginMessage.textContent = "Incorrect password. Please try again.";
//             loginMessage.style.color = "red";
//           }
//         } else {
//           loginMessage.textContent = "Email not found. Please sign up.";
//           loginMessage.style.color = "red";
//         }
//       });
//     });
//   }
// });

// // ***************************************************LOGIN WITH FACE ID**********************************
// document.addEventListener("DOMContentLoaded",()=>{
//   const faceRecognitionButton =document.getElementById("face-Recognition-Button");

//   if (faceRecognitionButton) {
//     faceRecognitionButton.addEventListener("click", async () => {
//       faceRecognitionButton.textContent = "Processing...";
//       faceRecognitionButton.disabled = true;

//       // Open a new window for the camera
//       const cameraWindow = window.open(
//         "camera.html",
//         "CameraWindow",
//         "width=800,height=600,scrollbars=no,resizable=no"
//       );
//     }
// )};
// });

// document.addEventListener("DOMContentLoaded", () => {
//   console.log("Current Pathname:", window.location.pathname);

//   let isFaceRecognitionComplete = false;

//   const faceRecognitionButton = document.getElementById("facial-recognition-btn");
//   const submitButton = document.getElementById("signup-submit");

//   // Disable the submit button initially
//   if (submitButton) {
//     submitButton.disabled = true;
//   }

//   // Function to access the camera and simulate facial recognition
//   async function performFacialRecognition() {
//     try {
//       // Access the camera
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });

//       // Display the camera feed in a video element (for demo purposes)
//       const video = document.createElement("video");
//       video.srcObject = stream;
//       video.autoplay = true;
//       video.style.width = "300px";
//       video.style.height = "200px";
//       document.body.appendChild(video);

//       // Simulate facial recognition success after 5 seconds
//       return new Promise((resolve) => {
//         setTimeout(() => {
//           stream.getTracks().forEach((track) => track.stop()); // Stop the camera
//           video.remove(); // Remove the video element
//           resolve(true); // Simulate success
//         }, 5000);
//       });
//     } catch (error) {
//       console.error("Error accessing the camera:", error);
//       return false; // Simulate failure
//     }
//   }

//   // Handle Face ID button click
//   if (faceRecognitionButton) {
//     faceRecognitionButton.addEventListener("click", async () => {
//       faceRecognitionButton.textContent = "Processing...";
//       faceRecognitionButton.disabled = true;

//       const success = await performFacialRecognition();

//       if (success) {
//         isFaceRecognitionComplete = true;
//         faceRecognitionButton.textContent = "Face ID Completed";
//         faceRecognitionButton.style.backgroundColor = "green";

//         // Enable the submit button
//         if (submitButton) {
//           submitButton.disabled = false;
//         }
//       } else {
//         isFaceRecognitionComplete = false;
//         faceRecognitionButton.textContent = "Face ID Failed";
//         faceRecognitionButton.style.backgroundColor = "red";

//         // Ensure the submit button remains disabled
//         if (submitButton) {
//           submitButton.disabled = true;
//         }
//       }

//       faceRecognitionButton.disabled = false;
//     });
//   }

//   // Handle form submission
//   const signupForm = document.getElementById("signup-form");
//   if (signupForm) {
//     signupForm.addEventListener("submit", (event) => {
//       event.preventDefault();

//       if (!isFaceRecognitionComplete) {
//         alert("You must complete Face ID before signing up!");
//         return;
//       }

//       // Proceed with the signup process
//       console.log("Form submitted successfully!");
//       alert("Signup completed successfully!");
//     });
//   }
// });

// ********************************************************************************************************

// document.addEventListener("DOMContentLoaded", () => {
//   console.log("Current Pathname:", window.location.pathname);

//   if (window.location.pathname.includes("signup.html")) {
//     console.log("Signup page detected.");

//     const signupForm = document.getElementById("signup-form");
//     const emailInput = document.getElementById("email");
//     const passwordInput = document.getElementById("password");
//     const confirmPasswordInput = document.getElementById("confirm-password");
//     const emailErrorMessage = document.getElementById("email-error-message");
//     const passwordErrorMessage = document.getElementById("password-error-message");
//     const successMessage = document.getElementById("success-message");

//     function validateEmail(email) {
//       const emailPattern = /^[a-zA-Z0-9._-]+@(gmail\.com|icloud\.com|me\.com)$/;
//       return emailPattern.test(email);
//     }

//     function validatePassword(password) {
//       return password.length >= 6;
//     }

//     function validateForm() {
//       // Clear previous error messages
//       emailErrorMessage.textContent = '';
//       passwordErrorMessage.textContent = '';
//       successMessage.style.display = 'none';

//       const email = emailInput.value.trim();
//       const password = passwordInput.value;
//       const confirmPassword = confirmPasswordInput.value;

//       let isValid = true;

//       // Email validation
//       if (!validateEmail(email)) {
//         emailErrorMessage.textContent = 'Please enter a valid email address.';
//         emailErrorMessage.style.color = 'red';
//         isValid = false;
//       }

//       // Password validation
//       if (!validatePassword(password)) {
//         passwordErrorMessage.textContent = 'Password must be at least 6 characters long.';
//         passwordErrorMessage.style.color = 'red';
//         isValid = false;
//       }

//       // Password confirmation
//       if (password !== confirmPassword) {
//         passwordErrorMessage.textContent = 'Passwords do not match.';
//         passwordErrorMessage.style.color = 'red';
//         isValid = false;
//       }

//       return isValid;
//     }

//     // Real-time validation when the user is typing in the fields
//     if (emailInput) emailInput.addEventListener("input", validateForm);
//     if (passwordInput) passwordInput.addEventListener("input", validateForm);
//     if (confirmPasswordInput) confirmPasswordInput.addEventListener("input", validateForm);

//     if(signupForm) signupForm.addEventListener("submit", (event) => {
//       event.preventDefault();

//       if (validateForm()) {
//         const email = emailInput.value.trim();
//         const password = passwordInput.value;

//         chrome.storage.sync.get(email, function (result) {
//           if (result[email]) {
//             emailErrorMessage.textContent = 'Email already exists!';
//             emailErrorMessage.style.color = 'red';
//           } else {
//             const userCredentials = {
//               email: email,
//               password: password,
//               // Add the face descriptor data here if applicable
//             };

//             chrome.storage.sync.set({ [email]: userCredentials }, function () {
//               if (chrome.runtime.lastError) {
//                 console.error('Error storing credentials:', chrome.runtime.lastError);
//               } else {
//                 console.log('User credentials stored successfully.');
//               }
//             });

//             successMessage.textContent = 'Sign Up successful! You can now proceed to login.';
//             successMessage.style.color = 'green';
//             successMessage.style.display = 'block';

//             setTimeout(function () {
//               window.location.href = 'login.html';
//             }, 2000);
//           }
//         });
//       }
//     });
//   }
// });


// **************************************************************************************login********************





// ******************************************************LOGIN**************************************
document.addEventListener("DOMContentLoaded", () => {
  // Load Login page when "Login here..." is clicked
  const loginButton = document.getElementById("login-button");
  if (loginButton) {
    loginButton.addEventListener("click", (event) => {
      window.location.href = "login.html";
      event.preventDefault();
      loadPage("login.html");
    });
  }

  // Load Signup page when "Sign up here..." is clicked
  const signupButton = document.getElementById("signup-button");
  if (signupButton) {
    signupButton.addEventListener("click", (event) => {
      window.location.href = "signup.html";
      event.preventDefault();
      loadPage("signup.html");
    });
  }
  
});

// Function to dynamically load a page
function loadPage(page) {
fetch(page)
  .then((response) => response.text())
  .then((html) => {
    // Get the content container and replace its content
    const contentContainer = document.getElementById("content-container");
    contentContainer.innerHTML = html;

    // After the page is loaded, initialize any page-specific scripts
    if (page === "signup.html") {
      initializeSignupPage();
    } else if (page === "login.html") {
      initializeLoginPage();
    }
  })
  .catch((error) => console.error("Error loading page:", error));
}

function initializeSignupPage() {
// Initialize any specific logic for the Signup page here
console.log("Signup Page Loaded");
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    // Handle the form submission for Signup
    console.log("Signup form submitted");
  });
}
}

function initializeLoginPage() {
// Initialize any specific logic for the Login page here
console.log("Login Page Loaded");
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    // Handle the form submission for Login
    console.log("Login form submitted");
  });
}
}


  document.addEventListener("DOMContentLoaded", () => {
    // Navigate to login page when "Login here..." is clicked
    const goToLoginLink = document.getElementById("go-to-login");
    if (goToLoginLink) {
      goToLoginLink.addEventListener("click", (event) => {
        window.location.href = "login.html";
        event.preventDefault();
        loadPage("login.html");
      });
    }
  
    // Navigate to signup page when "Sign up here..." is clicked
    const goToSignupLink = document.getElementById("go-to-signup");
    if (goToSignupLink) {
      goToSignupLink.addEventListener("click", (event) => {
        window.location.href = "signup.html";
        event.preventDefault();
        loadPage("signup.html");
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
      // .catch((error) => console.error("Error loading page:", error));
  }


  // ***********************************************VAlidation*********************************
 


// ****************************forgot passoword****************

// document.addEventListener("DOMContentLoaded", () => {
//   // Load Login page when "Login here..." is clicked
//   const forgotpassword = document.getElementById("Forgotpassword");
//   if (forgotpassword) {
//     forgotpassword.addEventListener("click", (event) => {
//       event.preventDefault();
//       loadPage("camera.html");
//     });
//   }
// });

//  // Function to dynamically load a page
//  function loadPage(page) {
//   fetch(page)
//     .then((response) => response.text())
//     .then((html) => {
//       document.body.innerHTML = html;
//     })
//     .catch((error) => console.error("Error loading page:", error));
// }


