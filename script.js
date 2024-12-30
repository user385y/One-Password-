

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAvqS_Ws2k8fAKC-D_HxjFdC0oZcp9CuTE",
    authDomain: "safesitepass.firebaseapp.com",
    projectId: "safesitepass",
    storageBucket: "safesitepass.firebasestorage.app",
    messagingSenderId: "272019706612",
    appId: "1:272019706612:web:7896844f6c653a0a2a44a1"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

console.log("Firebase initialized successfully!");
console.log("*****************hello******************")