# Optic Suite: AI Eyewear Platform

My final-year project for a BS in Software Engineering at The University of Faisalabad (2026). It's an online eyewear store that detects your face shape from a photo or webcam, recommends frames that suit it, and lets you try glasses on live in the browser.

![Optic Suite landing page](docs/screenshot.jpg)

## What it does

- **Face shape detection.** Upload a photo or use the webcam, and a CNN classifies the face as Heart, Oblong, Oval, Round or Square.
- **Frame recommendations.** The API reads products for the chosen category (men, women or kids) from Firestore and returns the ones tagged as suiting that face shape.
- **Virtual try-on.** MediaPipe Face Mesh tracks facial landmarks in real time in the browser and keeps the glasses on the face as the head moves. In functional testing it tracked faces with over 95% accuracy under normal indoor lighting.
- **Online shop.** Product pages for men, women and kids, lens and prescription choices, cart and checkout, Firebase sign-in (email, Google and Facebook), and an admin dashboard for adding products.

## How it works

```mermaid
flowchart LR
    subgraph rec ["Face shape and recommendations"]
        A["Photo or webcam<br/>in the browser"] --> B["Flask API<br/>POST /api/predict"]
        B --> C["CNN classifier<br/>224×224 input, 5 classes"]
        C --> D["Face shape"]
        D --> E[("Firestore products<br/>filtered by category<br/>and face shape")]
        E --> F["Recommended frames"]
    end
    subgraph tryon ["Virtual try-on"]
        G["Webcam"] --> H["MediaPipe Face Mesh<br/>facial landmarks"]
        H --> I["Glasses placed<br/>on the face"]
    end
```

## The model

| File | What it does |
| --- | --- |
| `model/face_shape_classifier.py` | Transfer learning on **MobileNetV2** (ImageNet weights, frozen base) with a small dense head. Uses data augmentation (rotation, shifts, zoom, flips, brightness), balanced class weights, and a classification report and confusion matrix on the validation split. Also predicts a single image. |
| `train_model.py` | A simpler three-block CNN baseline. |
| `script.py` | Builds the dataset by collecting images for each face shape. |
| `model/clean_dataset.py` | Removes corrupted images before training. |

The trained model is about 267 MB, which is over GitHub's file size limit, so it isn't in this repo. Train your own with the scripts above.

## Project structure

```
app.py                  Flask API: face shape prediction and product recommendations
model/                  Classifier training, prediction and dataset clean-up
templates/              Flask page and the face shape client script
website/
  mainpage/             Landing page
  loginpages/           Sign-up and sign-in (email, Google, Facebook)
  Shop/                 Catalogue, product pages, lens choice, checkout, admin dashboard
  VirtualTry-on/        Live try-on with MediaPipe Face Mesh
  ResetPassword/        Password reset
```

## Run it locally

1. Install the dependencies: `pip install -r requirements.txt`
2. Create a Firebase project and download a service account key as `serviceAccountKey.json` in the project root. It is git-ignored.
3. In Firestore, add a `products` collection. Each product needs a `category` field (`men`, `women` or `kids`) and a `recommendedFor` field listing the face shapes it suits.
4. Put your Firebase web settings in the website files. Search for `YOUR_FIREBASE_` to find every place.
5. Train a model from the project root: `python model/face_shape_classifier.py --train dataset`. Use one folder per face shape inside `dataset`.
6. Start the server with `python app.py` and open http://127.0.0.1:5000.

## Not included

The trained model files, the product and marketing images, photos uploaded by users, and all Firebase keys.

## Tech stack

Python · TensorFlow / Keras · MobileNetV2 · Flask · Firebase Authentication and Firestore · MediaPipe Face Mesh · JavaScript · HTML · Tailwind CSS
