import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  databaseURL: "YOUR_FIREBASE_DATABASE_U_R_L",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
  measurementId: "YOUR_FIREBASE_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Check if Firebase initialized correctly
if (!app) {
  console.error("Firebase app not initialized.");
} else {
  console.log("Firebase app initialized successfully:", app);
}

// Attach event listener directly to the button
const googleLoginButton = document.getElementById("google-login-btn");

if (!googleLoginButton) {
  console.error("Google login button not found. Check your HTML.");
} else {
  googleLoginButton.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log("Google Sign-In successful. User:", user);

        // Redirect to the main page after successful login
        window.location.href = "/FYP-2024/website/mainpage/Page1.html";
      })
      .catch((error) => {
        console.error("Google Sign-In failed. Error:", error);
        alert(`Error: ${error.message}`);
      });
  });
}
