
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
  
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import { getAuth,FacebookAuthProvider,signInWithPopup } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider=new FacebookAuthProvider();

document.addEventListener("DOMContentLoaded",function()
{
    const facebooklogin=document.getElementById("facebook-login-btn");
    facebooklogin.addEventListener("click",function(event){
event.preventDefault();
signInWithPopup(auth, provider)
  .then((result) => {
    // The signed-in user info.
    const user = result.user;

    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken;

   console.log(user);
   window.location.href="/FYP-2024/website/mainpage/Page1.html"
  })
  .catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    alert(errorMessage);
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = FacebookAuthProvider.credentialFromError(error);

    // ...
  });

    })
})



