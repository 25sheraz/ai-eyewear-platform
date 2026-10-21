from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from flask import send_from_directory
import os
import base64
from PIL import Image
import io
import numpy as np
from keras.models import load_model
from keras.preprocessing.image import img_to_array
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__, static_url_path='/static')
CORS(app)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load AI model + labels
model = load_model("model/face_shape_model.h5", compile=False)
with open('labels.txt', 'r') as f:
    labels = [line.strip() for line in f.readlines()]

# Initialize Firestore with your own Firebase service account key (not committed)
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def preprocess_image(image):
    image = image.convert('RGB')
    image = image.resize((224, 224))
    img_array = img_to_array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array
# Glasses mapping by category (fallback images)
glasses_map = {
    "men": {
        "Oval": "static/glasses/men/oval.png",
        "Round": "static/glasses/men/round.png",
        "Square": "static/glasses/men/square.png",
        "Heart": "static/glasses/men/heart.png",
        "Diamond": "static/glasses/men/diamond.png"
    },
    "women": {
        "Oval": "static/glasses/women/oval.png",
        "Round": "static/glasses/women/round.png",
        "Square": "static/glasses/women/square.png",
        "Heart": "static/glasses/women/heart.png",
        "Diamond": "static/glasses/women/diamond.png"
    },
    "kids": {
        "Oval": "static/glasses/kids/oval.png",
        "Round": "static/glasses/kids/round.png",
        "Square": "static/glasses/kids/square.png",
        "Heart": "static/glasses/kids/heart.png",
        "Diamond": "static/glasses/kids/diamond.png"
    }
}


@app.route('/')
def index():
    return render_template('base.html')

@app.route('/api/predict', methods=['POST'])
@app.route('/api/predict', methods=['POST'])
@app.route('/api/predict', methods=['POST'])
def api_predict():
    image = None
    filepath = None

    category = request.form.get("category", "men").lower()

    # Handle image from file input
    if 'image' in request.files and request.files['image']:
        file = request.files['image']
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        image = Image.open(filepath)

    # Handle image from webcam
    elif 'camera_image' in request.form and request.form['camera_image']:
        image_data = request.form['camera_image']
        header, encoded = image_data.split(",", 1)
        binary = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(binary))
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'captured_image.jpg')
        image.save(filepath)

    if not image:
        return jsonify({"error": "No valid image provided"}), 400

    # Run AI model
    img_array = preprocess_image(image)
    prediction = model.predict(img_array)
    predicted_label = labels[np.argmax(prediction)].strip()

    # 🔎 Debugging outputs
    print(">>> Predicted face shape:", predicted_label)
    print(">>> Selected category:", category)

 # Query Firestore
       # Query Firestore
    products_ref = db.collection("products")

    # Correct query execution
    query = products_ref.where("category", "==", category).stream()

    # Convert documents to dict properly
    products = []

    for doc in query:
        data = doc.to_dict()
        data["id"] = doc.id
        products.append(data)

    print(">>> Products fetched from Firestore:", len(products))

    for p in products:
        print("Product:", p)

    # Filter by face shape
    recommended = []

    for p in products:
        rec_list = p.get("recommendedFor", [])

        # Ensure list format
        if isinstance(rec_list, str):
            rec_list = [rec_list]

        # Match face shape
        if any(predicted_label.lower() == str(r).lower() for r in rec_list):
            recommended.append(p)

    print(">>> Recommended products count:", len(recommended))

    return jsonify({
        "prediction": predicted_label,
        "category": category,
        "uploaded_image": filepath,
        "recommended_products": recommended
    })
@app.route("/product/<product_id>")
def product_detail(product_id):

    doc = db.collection("products").document(product_id).get()

    if not doc.exists:
        return "Product not found", 404

    product = doc.to_dict()
    product["id"] = doc.id

    return render_template("product_detail.html", product=product)

@app.route('/product-view')
def product_view():
    return send_from_directory(
        os.path.join(os.getcwd(),"FYP-2024", "website", "Shop","product-view.html"),
    )
if __name__ == '__main__':
    app.run(debug=True)
