import sys
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os

# Load trained model
model = load_model("plant_disease_model.h5")

# Load class names from the 'train' folder
class_names = sorted(os.listdir("PlantVillage/train"))

# Check if image path is provided
if len(sys.argv) < 2:
    print("❗ Please provide the path to a leaf image.")
    print("Usage: python predict_disease.py path_to_image.jpg")
    sys.exit(1)

# Load and preprocess image
img_path = sys.argv[1]
img = image.load_img(img_path, target_size=(128, 128))  # Match your model input size
img_array = image.img_to_array(img) / 255.0
img_array = np.expand_dims(img_array, axis=0)

# Predict
prediction = model.predict(img_array)
predicted_class = class_names[np.argmax(prediction)]
confidence = np.max(prediction)

# Output result
print(f"\n🩺 Predicted Disease: {predicted_class}")
print(f"📊 Confidence: {confidence:.2%}")
