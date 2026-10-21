import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadProducts() {
    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const productId = doc.id;

            const productWrapper = document.createElement("div");
            productWrapper.className = "flex flex-col items-center mb-8 sm:mb-6 mx-2 sm:mx-3";

            const productCard = document.createElement("div");
            productCard.className = `
                relative bg-white rounded-2xl shadow-md p-5 w-full sm:w-72 border border-black 
                flex flex-col items-center transition-transform duration-300 hover:-translate-y-2 cursor-pointer
            `;

         const viewUrl = `product-view.html?id=${productId}`;



            productCard.addEventListener("click", () => {
                window.location.href = viewUrl;
            });

            productCard.innerHTML = `
                <button class="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-3xl">♡</button>
                <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-40 object-contain mb-4" />
                <div class="flex items-center gap-2 border border-black px-4 py-2 rounded-full text-base mb-4 hover:bg-gray-100 transition">
                    <img src="/FYP-2024/FYP/OpticSuiteImages/women collection/Icons/camera icon.png" alt="Try-on" class="w-5 h-5" />
                    <span>Visual Try-on</span>
                </div>
            `;

            const productInfo = document.createElement("div");
            productInfo.className = "text-center mt-2 text-lg w-full";
            productInfo.innerHTML = `
                <div class="flex justify-between text-gray-800 font-medium text-base w-full sm:w-72 px-2">
                    <span>${product.brand}</span>
                    <span class="text-yellow-500">★ ${product.rating || "N/A"}</span>
                </div>
                <div class="flex justify-between text-black font-semibold text-base w-full sm:w-72 px-2 mt-1">
                    <span>${product.name}</span>
                    <span>Rs. ${product.price}</span>
                </div>
            `;

            productWrapper.appendChild(productCard);
            productWrapper.appendChild(productInfo);
            productList.appendChild(productWrapper);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        productList.innerHTML = "<p class='text-red-600'>Failed to load products.</p>";
    }
}

loadProducts();
