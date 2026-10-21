import os
from PIL import Image

def is_image_valid(file_path):
    try:
        with Image.open(file_path) as img:
            img.verify()
        return True
    except Exception:
        return False

def clean_dataset(root_dir):
    total_deleted = 0
    for subdir, _, files in os.walk(root_dir):
        for file in files:
            path = os.path.join(subdir, file)
            if not is_image_valid(path):
                print(f"Removing corrupted image: {path}")
                os.remove(path)
                total_deleted += 1
    print(f"Cleanup complete. {total_deleted} corrupted images removed.")

if __name__ == "__main__":
    DATASET_DIR = "dataset"  # change if your dataset folder is named differently
    clean_dataset(DATASET_DIR)
