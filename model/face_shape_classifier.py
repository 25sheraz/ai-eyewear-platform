import os
import argparse
import numpy as np
import tensorflow as tf

# Corrected imports to fix Pylance errors
from keras.preprocessing import image
from keras.src.legacy.preprocessing.image import ImageDataGenerator
from PIL import Image, ImageFile
from sklearn.utils import class_weight
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Direct Keras architectural imports
from keras.applications import MobileNetV2
from keras.layers import GlobalAveragePooling2D, Dropout, Dense
from keras.models import Model

ImageFile.LOAD_TRUNCATED_IMAGES = True

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 64
EPOCHS = 90
MODEL_FILE = "model/face_shape_model.h5"
LABELS_FILE = "labels.txt"

def build_model(input_shape):
    base_model = MobileNetV2(include_top=False, input_shape=input_shape, weights='imagenet')
    base_model.trainable = False
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.3)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.2)(x)
    predictions = Dense(5, activation='softmax')(x)
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

def train_model(dataset_path):
    datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2,
        rotation_range=10,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2]
    )

    train_generator = datagen.flow_from_directory(
        dataset_path,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        color_mode='rgb',
        class_mode='sparse',
        subset='training',
        shuffle=True
    )

    val_generator = datagen.flow_from_directory(
        dataset_path,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        color_mode='rgb',
        class_mode='sparse',
        subset='validation',
        shuffle=False
    )

    class_weights = class_weight.compute_class_weight(
        class_weight='balanced',
        classes=np.unique(train_generator.classes),
        y=train_generator.classes
    )
    class_weights = dict(enumerate(class_weights))

    model = build_model((224, 224, 3))
    model.fit(train_generator,
              epochs=EPOCHS,
              validation_data=val_generator,
              class_weight=class_weights)

    model.save(MODEL_FILE)

    labels = {v: k for k, v in train_generator.class_indices.items()}
    with open(LABELS_FILE, 'w') as f:
        for idx in range(len(labels)):
            f.write(labels[idx] + "\n")

    evaluate_model(model, val_generator, list(labels.values()))
    return model, labels

def evaluate_model(model, val_generator, class_names):
    val_generator.reset()
    y_true = val_generator.classes
    y_pred = np.argmax(model.predict(val_generator), axis=1)

    print("\nClassification Report:\n")
    print(classification_report(y_true, y_pred, target_names=class_names))

    print("\nConfusion Matrix:\n")
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', xticklabels=class_names, yticklabels=class_names, cmap='Blues')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix')
    plt.tight_layout()
    plt.show()

def load_labels():
    with open(LABELS_FILE, 'r') as f:
        return [line.strip() for line in f.readlines()]

def predict_image(model, labels, image_path):
    from jinja2 import Template

    img = image.load_img(image_path, target_size=IMAGE_SIZE)
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array)
    predicted_class = np.argmax(prediction)
    face_shape = labels[predicted_class]

    print(f"Predicted Face Shape: {face_shape}")
    with open("template.html", "r") as file:
        template = Template(file.read())
    result_html = template.render(face_shape=face_shape)
    with open("result.html", "w") as f:
        f.write(result_html)
    print("Prediction saved to result.html")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train or Predict Face Shape")
    parser.add_argument("--train", help="Path to training dataset")
    parser.add_argument("--predict", help="Path to image for prediction")
    args = parser.parse_args()

    if args.train:
        train_model(args.train)
    elif args.predict:
        model = tf.keras.models.load_model(MODEL_FILE)
        labels = load_labels()
        predict_image(model, labels, args.predict)
    else:
        print("Please provide --train or --predict argument.")
