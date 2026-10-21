// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase configuration
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

// Add event listener for the "Continue" button
const resetButton = document.getElementById("reset");

resetButton.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent the default form submission

  // Get the email value from the input field
  const emailInput = document.getElementById("email").value;

  // Check if email is provided
  if (!emailInput) {
    alert("Please enter your email address.");
    return;
  }

  // Send the password reset email
  sendPasswordResetEmail(auth, emailInput)
    .then(() => {
      // Success: Notify user and redirect to resetpass2.html
      alert("Password reset email sent successfully!");
      window.location.href = "/FYP-2024/website/ResetPassword/resetpass2.html"; // Update this path as per your directory structure
    })
    .catch((error) => {
      // Handle any errors
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`Error: ${errorMessage}`);
    });
});
