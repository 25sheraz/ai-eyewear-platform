import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Sections
const productsSection = document.getElementById("productsSection");
const ordersSection = document.getElementById("ordersSection");
const pageTitle = document.getElementById("pageTitle");
const ordersTbody = document.getElementById("ordersTbody");
const orderDetail = document.getElementById("orderDetail");

// 🔹 Sidebar links
document.getElementById("linkProducts").addEventListener("click", () => {
  pageTitle.textContent = "Products";
  productsSection.classList.remove("hidden");
  ordersSection.classList.add("hidden");
});

document.getElementById("linkOrders").addEventListener("click", () => {
  pageTitle.textContent = "Orders";
  productsSection.classList.add("hidden");
  ordersSection.classList.remove("hidden");
  loadOrders(); // realtime listener
});

// 🔹 Load Orders (Realtime)
function loadOrders() {
  ordersTbody.innerHTML = "";

  const q = query(collection(db, "orders"), orderBy("orderDate", "desc"));
  onSnapshot(q, (snapshot) => {
    ordersTbody.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-3">${docSnap.id}</td>
        <td class="p-3">${data.userEmail || "Guest"}</td>
        <td class="p-3">Rs ${data.totalPrice}</td>
        <td class="p-3">${
          data.orderDate?.toDate ? data.orderDate.toDate().toLocaleDateString() : "-"
        }</td>
        <td class="p-3">${data.status || "Pending"}</td>
        <td class="p-3">
          <button class="viewBtn px-3 py-1 bg-black text-white rounded" data-id="${docSnap.id}">
            View
          </button>
        </td>
      `;
      ordersTbody.appendChild(tr);
    });

    // re-bind buttons
    document.querySelectorAll(".viewBtn").forEach((btn) => {
      btn.addEventListener("click", () => showOrderDetail(btn.dataset.id));
    });
  });
}

// 🔹 Show Order Detail
async function showOrderDetail(orderId) {
  const docRef = doc(db, "orders", orderId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    alert("Order not found!");
    return;
  }

  const data = docSnap.data();
  orderDetail.classList.remove("hidden");

  orderDetail.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">Order Summary</h2>
    <div class="space-y-3 text-lg">
      <div><strong>Customer:</strong> ${data.userEmail || "Guest"}</div>
      <div><strong>Product:</strong> ${data.productName}</div>
      <div><strong>Brand:</strong> ${data.productBrand}</div>
      <div><strong>Color:</strong> ${data.color}</div>
      <div><strong>Size:</strong> ${data.size}</div>
      <div><strong>Prescription:</strong> ${data.prescriptionType} (Rs ${data.prescriptionPrice})</div>
      <div><strong>Single Vision:</strong> ${data.singleVisionType} (Rs ${data.singleVisionPrice})</div>
      <div><strong>Lens:</strong> ${data.lensType} (Rs ${data.lensPrice})</div>
      <div><strong>Cleaning Kit:</strong> ${data.cleaningKit} (Rs ${data.cleaningKitPrice})</div>
      <div class="font-bold text-xl">Total: Rs ${data.totalPrice}</div>
      <div><strong>Status:</strong> ${data.status}</div>
    </div>
  `;
}
