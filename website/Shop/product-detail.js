// ✅ Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};

// ✅ Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

if (!productId) {
  alert("No product ID found in URL.");
  throw new Error("Missing product ID");
}

// ✅ DOM Elements
const mainImage = document.getElementById("main-image");
const nameEl = document.getElementById("product-name");
const brandEl = document.getElementById("product-brand");
const priceEl = document.getElementById("product-price");
const colorContainer = document.getElementById("color-options");
const colorNameText = document.getElementById("color-name");

// ✅ 3D Model modal elements
const show3DButton = document.getElementById("show-3d-button");
const modelModal = document.getElementById("model-modal");
const popupModelViewer = document.getElementById("popup-model-viewer");
const closeModelModal = document.getElementById("close-model-modal");

// ✅ Product model URL + selected color
let productModelUrl = "";
let selectedColor = null;

// ✅ Function to update Try-on button link
function updateTryonLink(imageUrl, product) {
  const tryonBtn = document.getElementById("tryon-button");
  if (tryonBtn && imageUrl && product) {
    const encodedImg = encodeURIComponent(imageUrl);
    let tryonLink = `/FYP-2024/website/VirtualTry-on/position.html?id=${productId}&img=${encodedImg}`;

    if (selectedColor) {
      tryonLink += `&selectedColor=${encodeURIComponent(selectedColor)}`;
    }

    if (product.category) {
      tryonLink += `&category=${encodeURIComponent(product.category)}`;
    }

    tryonBtn.href = tryonLink;
    console.log("✅ Try-on button updated:", tryonLink);
  }
}


// ✅ Load product from Firestore
async function loadProductDetail() {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const product = docSnap.data();

      // ✅ Set main image
      mainImage.src = product.imageUrl || "";
      mainImage.alt = product.name || "Product Image";

      // ✅ Save 3D model URL for modal
      productModelUrl = product.modelUrl || "";

      // ✅ Set text content
      nameEl.textContent = product.name || "No Name";
      brandEl.textContent = product.brand || "No Brand";
      priceEl.textContent = `Rs. ${product.price || "0000"}`;

      // ✅ Set colors dynamically
      colorContainer.innerHTML = "";
      if (Array.isArray(product.colors) && product.colors.length > 0) {
        product.colors.forEach((color, index) => {
          const div = document.createElement("div");
          div.className = `w-6 h-6 rounded-full border border-gray-400 cursor-pointer`;
          div.style.backgroundColor = color.toLowerCase();
          div.title = color;

          div.addEventListener("click", () => {
            selectedColor = color;
            colorNameText.innerHTML = `${color} <span class="text-green-600 font-medium">In stock</span>`;

            // highlight selected color
            document.querySelectorAll("#color-options div").forEach(d => {
              d.classList.remove("ring-2", "ring-black");
            });
            div.classList.add("ring-2", "ring-black");

          
            // update try-on button
updateTryonLink(product.imageUrl, product);

          });

          // ✅ default: first color selected
          if (index === 0) {
            selectedColor = color;
            colorNameText.innerHTML = `${color} <span class="text-green-600 font-medium">In stock</span>`;
            div.classList.add("ring-2", "ring-black");
          }

          colorContainer.appendChild(div);
        });

       
        // ✅ Initial update of Try-on button
updateTryonLink(product.imageUrl, product);


      } else {
        colorNameText.textContent = "No colors available";
      }

    } else {
      alert("Product not found.");
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    alert("Error loading product details.");
  }
}

loadProductDetail();

// ✅ Show 3D Model modal on button click
show3DButton.addEventListener("click", () => {
  if (productModelUrl) {
    popupModelViewer.src = productModelUrl;
    modelModal.classList.remove("hidden");
  } else {
    alert("No 3D Model available for this product.");
  }
});

// ✅ Close 3D Model modal
closeModelModal.addEventListener("click", () => {
  modelModal.classList.add("hidden");
  popupModelViewer.src = ""; // stop loading
});
