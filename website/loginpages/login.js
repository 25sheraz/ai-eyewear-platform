// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Firebase config
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
const db = getFirestore(app);

const submit = document.getElementById('submit');

submit.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const docRef = doc(db, "users", user.uid);
        let docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: "user"
            });
            docSnap = await getDoc(docRef);
        }

        const userData = docSnap.data();

        if (userData.role === "admin") {
            // Create fancy popup
            const popup = document.createElement("div");
            popup.style.position = "fixed";
            popup.style.top = "0";
            popup.style.left = "0";
            popup.style.width = "100%";
            popup.style.height = "100%";
            popup.style.backgroundColor = "rgba(0,0,0,0.75)";
            popup.style.display = "flex";
            popup.style.alignItems = "center";
            popup.style.justifyContent = "center";
            popup.style.zIndex = "9999";
            popup.style.animation = "fadeIn 0.4s ease-in-out";

            popup.innerHTML = `
                <div class="popup-content">
                    <span id="closePopup">&times;</span>
                    <div class="popup-image-container">
                        <img src="/FYP-2024/FYP/OpticSuiteImages/sunglasses 2.jpg" alt="Glasses">
                    </div>
                    <p class="popup-title">Welcome Admin!</p>
                    <p class="popup-subtitle">Choose where you want to go</p>
                    <button id="adminBtn">Admin Portal</button>
                    <button id="siteBtn">Website</button>
                </div>

                <style>
                    .popup-content {
                        position: relative;
                        background: linear-gradient(145deg, #ffffff, #f0f0f0);
                        padding: 50px;
                        border-radius: 25px;
                        text-align: center;
                        width: 450px;
                        max-width: 95%;
                        box-shadow: 0 20px 45px rgba(0,0,0,0.4);
                        transform: scale(0.9);
                        animation: popUp 0.3s forwards;
                    }
                    #closePopup {
                        position: absolute;
                        top: 15px;
                        right: 20px;
                        cursor: pointer;
                        font-size: 28px;
                        font-weight: bold;
                        color: #333;
                        transition: color 0.2s;
                    }
                    #closePopup:hover {
                        color: #000;
                    }
                    .popup-image-container {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 25px;
                    }
                    .popup-image-container img {
                        width: 160px;
                        border-radius: 12px;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                        transition: transform 0.3s;
                    }
                    .popup-image-container img:hover {
                        transform: scale(1.05);
                    }
                    .popup-title {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 10px;
                        color: #111;
                    }
                    .popup-subtitle {
                        font-size: 15px;
                        color: #555;
                        margin-bottom: 30px;
                    }
                    #adminBtn, #siteBtn {
                        margin: 8px;
                        padding: 14px 30px;
                        border: none;
                        background: #000;
                        color: #fff;
                        border-radius: 12px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s;
                    }
                    #adminBtn:hover, #siteBtn:hover {
                        background: #222;
                    }
                    @keyframes fadeIn {
                        from {opacity:0;}
                        to {opacity:1;}
                    }
                    @keyframes popUp {
                        from {transform: scale(0.85);}
                        to {transform: scale(1);}
                    }
                </style>
            `;

            document.body.appendChild(popup);

            // Close popup
            document.getElementById("closePopup").addEventListener("click", () => popup.remove());

            // Button actions
            document.getElementById("adminBtn").addEventListener("click", () => {
                window.location.href = "/FYP-2024/website/Shop/admindashboard.html";
            });

            document.getElementById("siteBtn").addEventListener("click", () => {
                window.location.href = "/FYP-2024/website/mainpage/Page1.html";
            });

        } else {
            // Regular user
            window.location.href = "/FYP-2024/website/mainpage/Page1.html";
        }

    } catch (error) {
        alert("Error: " + error.message);
    }
});
