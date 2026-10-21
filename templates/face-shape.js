// ===============================
// DOM Elements
// ===============================

const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");

const uploadForm = document.getElementById("uploadForm");
const cameraForm = document.getElementById("cameraForm");

const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");

const captureBtn = document.getElementById("captureBtn");

const cameraImageInput = document.getElementById("cameraImageInput");

const resultSection = document.getElementById("result");


// ===============================
// Preview Selected Image
// ===============================

fileInput.addEventListener("change", () => {

  const file = fileInput.files[0];

  if (file) {
    preview.src = URL.createObjectURL(file);
  }

});


// ===============================
// Start Webcam
// ===============================

navigator.mediaDevices
  .getUserMedia({ video: true })

  .then((stream) => {
    video.srcObject = stream;
  })

  .catch((error) => {
    console.error("Camera Error:", error);
    alert("Unable to access webcam");
  });


// ===============================
// Capture Image
// ===============================

captureBtn.addEventListener("click", (event) => {

  event.preventDefault();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(video, 0, 0);

  const imageData = canvas.toDataURL("image/jpeg");

  cameraImageInput.value = imageData;

  alert("✅ Photo Captured");

});


// ===============================
// Get Selected Category
// ===============================

function getCategory() {

  const selected = document.querySelector(
    'input[name="category"]:checked'
  );

  return selected ? selected.value : null;

}


// ===============================
// Upload Image Form
// ===============================

uploadForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const category = getCategory();

  if (!category) {
    alert("⚠️ Please select category");
    return;
  }

  const formData = new FormData(uploadForm);

  formData.append("category", category);

  try {

    const response = await fetch("/api/predict", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    showResult(result);

  } catch (error) {

    console.error(error);

    alert("Upload Failed");

  }

});


// ===============================
// Camera Upload Form
// ===============================

cameraForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const category = getCategory();

  if (!category) {
    alert("⚠️ Please select category");
    return;
  }

  const formData = new FormData(cameraForm);

  formData.append("category", category);

  try {

    const response = await fetch("/api/predict", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    showResult(result);

  } catch (error) {

    console.error(error);

    alert("Camera Upload Failed");

  }

});


// ===============================
// Show Result
// ===============================

function showResult(result) {

  if (result.error) {

    resultSection.innerHTML = `
      <p style="color:red;">
        ${result.error}
      </p>

      <button onclick="tryAgain()">
        Try Again
      </button>
    `;

    return;
  }

  let productsHTML = "";

  // ===========================
  // Products
  // ===========================

  if (
    result.recommended_products &&
    result.recommended_products.length > 0
  ) {

    result.recommended_products.forEach((product) => {

      productsHTML += `

        <div class="product-card">

          <img
            src="${product.imageUrl}"
            alt="${product.name}"
          >

          <p>
            <strong>${product.name}</strong>
          </p>

          <p>
            Rs. ${product.price}
          </p>

          <a
            href="/FYP-2024/website/Shop/product-view.html?id=${product.id}"
            class="view-btn"
          >
            View Product
          </a>

        </div>

      `;

    });

  } else {

    productsHTML = `
      <p>No products found.</p>
    `;

  }

  // ===========================
  // Final Result HTML
  // ===========================

  resultSection.innerHTML = `

    <h2>Prediction Result</h2>

    <p>
      <strong>Category:</strong>
      ${result.category}
    </p>

    <p>
      <strong>Predicted Face Shape:</strong>
      ${result.prediction}
    </p>

    <img
      src="${result.uploaded_image}"
      class="main-img"
    >

    <h3 style="margin-top:20px;">
      Recommended Glasses:
    </h3>

    <div class="products-container">
      ${productsHTML}
    </div>

    <button onclick="tryAgain()">
      Try Again
    </button>

  `;

}


// ===============================
// Reset
// ===============================

window.tryAgain = function () {

  resultSection.innerHTML = "";

  fileInput.value = "";

  preview.src = "";

  cameraImageInput.value = "";

};