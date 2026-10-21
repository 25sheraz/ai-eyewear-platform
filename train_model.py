import tensorflow as tf
from keras.models import Sequential
from keras.layers import Dense, Conv2D, Flatten
from keras.preprocessing.image import ImageDataGenerator
import os
from PIL import ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

# ===============================
# 1. Data Preparation
# ===============================
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=15,
    zoom_range=0.1,
    width_shift_range=0.1,
    height_shift_range=0.1,
    validation_split=0.2
)

train_generator = train_datagen.flow_from_directory(
    "dataset/",                 
    target_size=(224, 224),
    batch_size=32,
    class_mode="categorical",
    subset="training"
)

val_generator = train_datagen.flow_from_directory(
    "dataset/",
    target_size=(224, 224),
    batch_size=32,
    class_mode="categorical",
    subset="validation"
)

# ===============================
# 2. CNN Model
# ===============================
model = tf.keras.models.Sequential([
    tf.keras.layers.Conv2D(32, (3,3), activation="relu", input_shape=(224,224,3)),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Conv2D(64, (3,3), activation="relu"),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Conv2D(128, (3,3), activation="relu"),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(256, activation="relu"),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(train_generator.num_classes, activation="softmax")
])
model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])

# ===============================
# 3. Training
# ===============================
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=20
)

# ===============================
# 4. Save Model
# ===============================
os.makedirs("model", exist_ok=True)

# Save in new format
model.save("model/face_shape_model.keras")

# Also save in h5 (if needed for compatibility)
model.save("model/face_shape_model.h5")

print("✅ Training complete. Model saved in 'model/' folder")
