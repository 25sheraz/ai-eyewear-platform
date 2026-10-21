from icrawler.builtin import BingImageCrawler
import os
from PIL import Image
import imagehash
import face_recognition
import shutil

# Configuration
CLASSES = ['heart face shape', 'oval face shape', 'square face shape', 'round face shape', 'oblong face shape']
SAVE_DIR = 'faceshape_dataset'
NUM_IMAGES_PER_CLASS = 5200  # Download more to filter out bad ones

def download_images():
    os.makedirs(SAVE_DIR, exist_ok=True)
    for cls in CLASSES:
        label = cls.split()[0]  # heart, oval, etc.
        crawler = BingImageCrawler(storage={'root_dir': os.path.join(SAVE_DIR, label)})
        crawler.crawl(keyword=cls + " person", max_num=NUM_IMAGES_PER_CLASS)

# def remove_duplicates_and_filter_faces():
#     print("Cleaning dataset...")
#     for cls in os.listdir(SAVE_DIR):
#         class_dir = os.path.join(SAVE_DIR, cls)
#         hashes = set()
#         for img_file in os.listdir(class_dir):
#             img_path = os.path.join(class_dir, img_file)

#             try:
#                 img = Image.open(img_path).convert("RGB")
#                 hash_val = imagehash.average_hash(img)

#                 if hash_val in hashes:
#                     os.remove(img_path)
#                     continue

#                 hashes.add(hash_val)

#                 # Face detection
#                 img_np = face_recognition.load_image_file(img_path)
#                 face_locations = face_recognition.face_locations(img_np)
#                 if len(face_locations) == 0:
#                     os.remove(img_path)

#             except Exception as e:
#                 print(f"Error processing {img_file}: {e}")
#                 if os.path.exists(img_path):
#                     os.remove(img_path)

if __name__ == "__main__":
    download_images()
    # remove_duplicates_and_filter_faces()
    print("Dataset ready!")
