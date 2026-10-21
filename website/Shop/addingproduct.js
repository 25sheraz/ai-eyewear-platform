// ============================
// FIREBASE IMPORTS
// ============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// ============================
// FIREBASE CONFIG
// ============================
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
const db = getFirestore(app);

// ============================
// DOM ELEMENTS
// ============================
const addSection = document.getElementById("addSection");
const deleteSection = document.getElementById("deleteSection");
const editSection = document.getElementById("editSection");

const showAddBtn = document.getElementById("showAdd");
const showDeleteBtn = document.getElementById("showDelete");
const showEditBtn = document.getElementById("showEdit");

const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList"); 
const editForm = document.getElementById("editForm");

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/duwtldvzo/upload";
const CLOUDINARY_UPLOAD_PRESET = "unsignedDemo"; // replace with real preset

// ============================
// SECTION TOGGLE BUTTONS
// ============================
showAddBtn.addEventListener("click", () => {
  addSection.classList.remove("hidden");
  deleteSection.classList.add("hidden");
  editSection.classList.add("hidden");
});

showDeleteBtn.addEventListener("click", () => {
  deleteSection.classList.remove("hidden");
  addSection.classList.add("hidden");
  editSection.classList.add("hidden");
  loadProducts();
});

showEditBtn.addEventListener("click", () => {
  editSection.classList.remove("hidden");
  addSection.classList.add("hidden");
  deleteSection.classList.add("hidden");
  loadProductsEdit();
});

// ============================
// ADD PRODUCT
// ============================
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const brand = document.getElementById("brand").value;
  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const price = parseFloat(document.getElementById("price").value);

  const imageFile = document.getElementById("productImage").files[0];
  const modelFile = document.getElementById("modelFile").files[0];

  const colorsSelect = document.getElementById("colors");
  const selectedColors = Array.from(colorsSelect.selectedOptions).map(opt => opt.value);

  if (!imageFile) {
    alert("Please upload a product image.");
    return;
  }

  try {
    // Upload image
    const formDataImage = new FormData();
    formDataImage.append("file", imageFile);
    formDataImage.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const imageRes = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formDataImage });
    const imageData = await imageRes.json();
    const imageUrl = imageData.secure_url;

    // Upload model (optional)
    let modelUrl = "";
    if (modelFile) {
      const formDataModel = new FormData();
      formDataModel.append("file", modelFile);
      formDataModel.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const modelRes = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formDataModel });
      const modelData = await modelRes.json();
      modelUrl = modelData.secure_url;
    }

    // Save to Firestore
    await addDoc(collection(db, "products"), {
      brand,
      name,
      category,
      price,
      colors: selectedColors,
      imageUrl,
      modelUrl,
      createdAt: new Date()
    });

    alert("Product added successfully!");
    productForm.reset();
    loadProducts();

    // Redirect to category page
    if (category === "women") {
      window.location.href = "productswomen.html";
    } else if (category === "men") {
      window.location.href = "productman.html";
    } else if (category === "kids") {
      window.location.href = "productkid.html";
    }

  } catch (error) {
    console.error("Error adding product:", error);
    alert("Error uploading product.");
  }
});

// ============================
// LOAD PRODUCTS (DELETE LIST)
// ============================
async function loadProducts() {
  productList.innerHTML = "";

  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach((docSnap) => {
    const product = docSnap.data();
    const productId = docSnap.id;

    const item = document.createElement("div");
    item.className = "bg-white p-4 rounded shadow flex justify-between items-center";

item.innerHTML = `
  <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition w-full h-full flex flex-col p-4">
    <!-- Product Image (fixed height) -->
    <div class="flex justify-center items-center h-40 mb-3 bg-gray-50 rounded-lg">
      <img src="${product.imageUrl}" class="max-h-36 object-contain" />
    </div>

    <!-- Product Details -->
    <div class="flex-1 text-center space-y-1">
      <p class="font-semibold text-lg">${product.brand} - ${product.name}</p>
      <p class="text-sm text-gray-500">Category: ${product.category}</p>
      <p class="text-sm font-medium text-gray-700">Price: Rs. ${product.price}</p>
      <p class="text-sm ${product.modelUrl ? 'text-green-600' : 'text-red-500'} font-medium">
        ${product.modelUrl ? '3D Available' : 'No 3D'}
      </p>
    </div>

    <!-- Buttons -->
    <div class="grid grid-cols-2 gap-3 mt-4">
      <a href="product-view.html?id=${productId}" 
         class="bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition text-center">
         View
      </a>
      <button class="bg-black text-white py-2 rounded-lg hover:bg-red-700 transition" data-id="${productId}">
        Delete
      </button>
    </div>
  </div>
`;


    // Delete button
    item.querySelector("button").addEventListener("click", async () => {
      const confirmDelete = confirm("Are you sure you want to delete this product?");
      if (!confirmDelete) return;

      try {
        await deleteDoc(doc(db, "products", productId));
        loadProducts();
      } catch (error) {
        alert("Error deleting product.");
        console.error(error);
      }
    });

    productList.appendChild(item);
  });
}

// ============================
// EDIT PRODUCT
// ============================
let currentEditId = null;

async function loadProductsEdit() {
  const productListEdit = document.getElementById("productListEdit");
  productListEdit.innerHTML = "";

  // Grid layout apply
  productListEdit.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";

  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach((docSnap) => {
    const product = docSnap.data();
    const productId = docSnap.id;

    const item = document.createElement("div");

    item.innerHTML = `
      <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition w-full h-full flex flex-col p-4">
        
        <!-- Product Image -->
        <div class="flex justify-center items-center h-40 mb-3 bg-gray-50 rounded-lg">
          <img src="${product.imageUrl}" class="max-h-36 object-contain" />
        </div>

        <!-- Product Details -->
        <div class="flex-1 text-center space-y-1">
          <p class="font-semibold text-lg">${product.brand} - ${product.name}</p>
          <p class="text-sm text-gray-500">Category: ${product.category}</p>
          <p class="text-sm font-medium text-gray-700">Price: Rs. ${product.price}</p>
        </div>

        <!-- Edit Button -->
        <div class="mt-4">
          <button class="bg-black text-white py-2 w-full rounded-lg hover:bg-gray-800 transition" data-edit="${productId}">
            Edit
          </button>
        </div>
      </div>
    `;

    // Edit button → fill form
    item.querySelector("button").addEventListener("click", () => {
      currentEditId = productId;
      document.getElementById("editFormWrapper").classList.remove("hidden");

      document.getElementById("editBrand").value = product.brand;
      document.getElementById("editName").value = product.name;
      document.getElementById("editCategory").value = product.category;
      document.getElementById("editPrice").value = product.price;

      const colorsSelect = document.getElementById("editColors");
      Array.from(colorsSelect.options).forEach(opt => {
        opt.selected = product.colors.includes(opt.value);
      });
    });

    productListEdit.appendChild(item);
  });
}

// ============================
// SUBMIT EDIT FORM
// ============================
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentEditId) return alert("No product selected for editing");

  const brand = document.getElementById("editBrand").value;
  const name = document.getElementById("editName").value;
  const category = document.getElementById("editCategory").value;
  const price = parseFloat(document.getElementById("editPrice").value);
  

  const colorsSelect = document.getElementById("editColors");
  const selectedColors = Array.from(colorsSelect.selectedOptions).map(opt => opt.value);

  let imageUrl = "";
  let modelUrl = "";

  const imageFile = document.getElementById("editImage").files[0];
  const modelFile = document.getElementById("editModel").files[0];

  if (imageFile) {
    const formDataImage = new FormData();
    formDataImage.append("file", imageFile);
    formDataImage.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formDataImage });
    const data = await res.json();
    imageUrl = data.secure_url;
  }

  if (modelFile) {
    const formDataModel = new FormData();
    formDataModel.append("file", modelFile);
    formDataModel.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formDataModel });
    const data = await res.json();
    modelUrl = data.secure_url;
  }

  await updateDoc(doc(db, "products", currentEditId), {
    brand,
    name,
    category,
    price,

    colors: selectedColors,
    ...(imageUrl && { imageUrl }),
    ...(modelUrl && { modelUrl })
  });

  alert("Product updated successfully!");
  loadProductsEdit();
  editForm.reset();
  document.getElementById("editFormWrapper").classList.add("hidden");
  currentEditId = null;
});

// ============================
// INITIAL LOAD
// ============================
window.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadProductsEdit();
});
