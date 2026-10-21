from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import io
import os
from PIL import Image, ImageOps, ImageEnhance
from datetime import datetime

app = Flask(__name__)

# Initialize an in-memory history store (replace with database in production)
prediction_history = []

# CORS Configuration with credentials support
cors_config = {
    "origins": [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}

# Enable CORS with specific configuration
CORS(app, resources={
    r"/*": cors_config,
    r"/api/*": cors_config
})

# Print working directory for debugging
print(f"Working directory: {os.getcwd()}")

# Check if model file exists
model_path = 'plant_disease_model.h5'
if os.path.exists(model_path):
    print(f"Model file found: {model_path}")
    model = tf.keras.models.load_model(model_path)
else:
    print(f"ERROR: Model file not found: {model_path}")
    model = None

class_labels = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Blueberry___healthy',
    'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# Dictionary: definition, cause, remedy per class
disease_info = {
    'Apple___Apple_scab': {
        'definition': 'A fungal disease that causes dark, scabby lesions on leaves and fruit.',
        'cause': 'Caused by the fungus Venturia inaequalis.',
        'remedy': 'Use fungicides like captan and prune infected areas.'
    },
    'Apple___Black_rot': {
        'definition': 'Fungal infection causing fruit rot and leaf spots.',
        'cause': 'Caused by Botryosphaeria obtusa fungus.',
        'remedy': 'Remove mummified fruits and apply appropriate fungicides.'
    },
    'Apple___Cedar_apple_rust': {
        'definition': 'Fungal disease with orange spots on leaves.',
        'cause': 'Caused by the fungus Gymnosporangium juniperi-virginianae.',
        'remedy': 'Remove nearby junipers and use fungicides.'
    },
    'Apple___healthy': {
        'definition': 'Healthy apple leaf.',
        'cause': 'No infection.',
        'remedy': 'No treatment needed.'
    },
    'Blueberry___healthy': {
        'definition': 'Healthy blueberry leaf.',
        'cause': 'No infection.',
        'remedy': 'No treatment needed.'
    },
    'Cherry_(including_sour)___Powdery_mildew': {
        'definition': 'White powdery growth on leaves and stems.',
        'cause': 'Caused by Podosphaera clandestina.',
        'remedy': 'Apply sulfur-based fungicides and remove affected parts.'
    },
    'Cherry_(including_sour)___healthy': {
        'definition': 'Healthy cherry leaf.',
        'cause': 'No infection.',
        'remedy': 'No treatment needed.'
    },
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': {
        'definition': 'Gray or tan lesions on leaves.',
        'cause': 'Caused by Cercospora zeae-maydis.',
        'remedy': 'Use resistant hybrids and fungicides.'
    },
    'Corn_(maize)___Common_rust_': {
        'definition': 'Rust-colored pustules on leaves.',
        'cause': 'Caused by Puccinia sorghi fungus.',
        'remedy': 'Use resistant varieties and fungicides.'
    },
    'Corn_(maize)___Northern_Leaf_Blight': {
        'definition': 'Cigar-shaped lesions on leaves.',
        'cause': 'Caused by Exserohilum turcicum.',
        'remedy': 'Use resistant hybrids and apply fungicides.'
    },
    'Corn_(maize)___healthy': {
        'definition': 'Healthy corn leaf.',
        'cause': 'No infection.',
        'remedy': 'No treatment needed.'
    },
    'Grape___Black_rot': {
        'definition': 'Black lesions on leaves and shriveled fruit.',
        'cause': 'Caused by Guignardia bidwellii.',
        'remedy': 'Remove mummified grapes and use fungicides.'
    },
    'Grape___Esca_(Black_Measles)': {
        'definition': 'Leaves show black striping and interveinal chlorosis.',
        'cause': 'Complex of fungal pathogens like Phaeoacremonium.',
        'remedy': 'Prune infected wood and apply fungicides.'
    },
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
        'definition': 'Irregular brown spots with yellow halos.',
        'cause': 'Caused by Pseudopeziza tracheiphila.',
        'remedy': 'Apply fungicides and remove infected leaves.'
    },
    'Grape___healthy': {
        'definition': 'Healthy grape leaf.',
        'cause': 'No infection.',
        'remedy': 'No treatment needed.'
    },
    'Orange___Haunglongbing_(Citrus_greening)': {
        'definition': 'Yellowing of shoots and bitter, deformed fruits.',
        'cause': 'Caused by Candidatus Liberibacter and spread by psyllids.',
        'remedy': 'Control psyllids and remove infected trees.'
    },
    'Peach___Bacterial_spot': {
        'definition': 'Dark, sunken lesions on leaves and fruit.',
        'cause': 'Caused by Xanthomonas campestris pv. pruni.',
        'remedy': 'Use resistant varieties and copper-based sprays.'
    },
    'Peach___healthy': {
        'definition': 'Healthy peach leaf.',
        'cause': 'No infection.',
        'remedy': 'No treatment needed.'
    },
    'Pepper,_bell___Bacterial_spot': {
        'definition': 'Dark, water-soaked spots on leaves and fruit.',
        'cause': 'Caused by Xanthomonas campestris.',
        'remedy': 'Use copper fungicides and certified seeds.'
    },
    'Pepper,_bell___healthy': {
        'definition': 'Healthy bell pepper leaf.',
        'cause': 'No infection.',
        'remedy': 'No treatment needed.'
    },
    'Potato___Early_blight': {
        'definition': 'Concentric dark rings on leaves.',
        'cause': 'Caused by Alternaria solani.',
        'remedy': 'Use fungicides like mancozeb and crop rotation.'
    },
    'Potato___Late_blight': {
        'definition': 'Water-soaked lesions that turn brown.',
        'cause': 'Caused by Phytophthora infestans.',
        'remedy': 'Apply systemic fungicides and destroy infected plants.'
    },
    'Potato___healthy': {
        'definition': 'Healthy potato leaf.',
        'cause': 'No infection.',
        'remedy': 'No treatment needed.'
    },
    'Raspberry___healthy': {
        'definition': 'Healthy raspberry leaf.',
        'cause': 'No infection.',
        'remedy': 'No treatment needed.'
    },
    'Soybean___healthy': {
        'definition': 'Healthy soybean leaf.',
        'cause': 'No infection.',
        'remedy': 'No treatment needed.'
    },
    'Squash___Powdery_mildew': {
        'definition': 'White powdery patches on leaves.',
        'cause': 'Caused by Erysiphe cichoracearum.',
        'remedy': 'Apply neem oil or sulfur-based fungicides.'
    },
    'Strawberry___Leaf_scorch': {
        'definition': 'Scorched appearance and brown edges on leaves.',
        'cause': 'Caused by Diplocarpon earliana.',
        'remedy': 'Remove infected leaves and use fungicides.'
    },
    'Strawberry___healthy': {
        'definition': 'Healthy strawberry leaf.',
        'cause': 'No infection.',
        'remedy': 'No treatment needed.'
    },
    'Tomato___Bacterial_spot': {
        'definition': 'Dark spots with yellow halos.',
        'cause': 'Caused by Xanthomonas spp.',
        'remedy': 'Use copper-based fungicides.'
    },
    'Tomato___Early_blight': {
        'definition': 'Target-shaped lesions on older leaves.',
        'cause': 'Caused by Alternaria solani.',
        'remedy': 'Use fungicides like chlorothalonil.'
    },
    'Tomato___Late_blight': {
        'definition': 'Greasy-looking lesions that turn brown.',
        'cause': 'Caused by Phytophthora infestans.',
        'remedy': 'Apply fungicides and remove infected plants.'
    },
    'Tomato___Leaf_Mold': {
        'definition': 'Yellow spots and olive-green mold on underside of leaves.',
        'cause': 'Caused by Fulvia fulva.',
        'remedy': 'Improve air circulation and apply fungicides.'
    },
    'Tomato___Septoria_leaf_spot': {
        'definition': 'Small circular spots with dark borders.',
        'cause': 'Caused by Septoria lycopersici.',
        'remedy': 'Use fungicides and rotate crops.'
    },
    'Tomato___Spider_mites Two-spotted_spider_mite': {
        'definition': 'Speckled leaves with fine webbing.',
        'cause': 'Caused by Tetranychus urticae.',
        'remedy': 'Spray water, use miticides or insecticidal soap.'
    },
    'Tomato___Target_Spot': {
        'definition': 'Brown lesions with concentric rings.',
        'cause': 'Caused by Corynespora cassiicola.',
        'remedy': 'Use fungicides and remove debris.'
    },
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
        'definition': 'Upward curling of leaves and yellowing.',
        'cause': 'Spread by whiteflies.',
        'remedy': 'Use resistant varieties and control whiteflies.'
    },
    'Tomato___Tomato_mosaic_virus': {
        'definition': 'Mottled leaves with reduced growth.',
        'cause': 'Caused by Tobacco Mosaic Virus (TMV).',
        'remedy': 'Remove infected plants and sterilize tools.'
    },
    'Tomato___healthy': {
        'definition': 'Healthy tomato leaf.',
        'cause': 'No infection.',
        'remedy': 'No treatment needed.'
    }
}

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'online',
        'message': 'Plant Disease Prediction API is running'
    })

@app.route('/predict', methods=['POST'])
def predict():
    print("Predict endpoint called")
    
    # Debug: print request information
    print(f"Content-Type: {request.content_type}")
    print(f"Files: {request.files}")
    
    if 'file' not in request.files:
        print("No file part in the request")
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        print("No file selected for uploading")
        return jsonify({'error': 'No file selected for uploading'}), 400

    print(f"Processing file: {file.filename}")
    
    try:
        # Read image bytes
        img_bytes = file.read()
        
        try:
            # Standardized preprocessing pipeline for all image types
            img = tf.io.decode_image(img_bytes, channels=3)
            img = tf.image.resize(img, [128, 128])
            img = tf.cast(img, tf.float32) / 255.0
            img = tf.expand_dims(img, 0)
            
            print(f"Image shape after preprocessing: {img.shape}")
            
        except Exception as img_error:
            print(f"Error preprocessing image: {str(img_error)}")
            return jsonify({'error': f'Invalid image format: {str(img_error)}'}), 400
            
        # Check if model was loaded successfully
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500

        # Make prediction
        predictions = model.predict(img)
        scores = predictions[0]
        
        # Get top predictions
        top_indices = np.argsort(scores)[-5:][::-1]
        top_classes = [class_labels[i] for i in top_indices]
        top_confidences = [float(scores[i]) for i in top_indices]
        
        # Select highest confidence prediction
        class_index = np.argmax(scores)
        predicted_class = class_labels[class_index]
        confidence = float(scores[class_index])
        
        print(f"Top 5 predictions and confidence scores:")
        for i, (cls, conf) in enumerate(zip(top_classes, top_confidences)):
            print(f"{i+1}. {cls}: {conf:.4f}")
        
        # If confidence is very low, warn the user
        confidence_warning = None
        if confidence < 0.5:
            confidence_warning = "Low confidence prediction. This may not be accurate for this image."
            print(f"Warning: Low confidence prediction ({confidence:.2f})")

        # Get disease information
        info = disease_info.get(predicted_class, {
            'definition': 'No data available.',
            'cause': 'Unknown.',
            'remedy': 'No treatment needed.'
        })

        # Build response
        result = {
            'predicted_class': predicted_class,
            'confidence': confidence,
            'definition': info['definition'],
            'cause': info['cause'],
            'remedy': info['remedy'],
            'warning': confidence_warning
        }
        
        # Add top 3 predictions for reference
        result['top_predictions'] = [
            {'class': cls, 'confidence': conf} 
            for cls, conf in zip(top_classes[:3], top_confidences[:3])
        ]
        
        # Save to history
        history_entry = {
            'prediction': result,
            'date': datetime.now().isoformat(),
            'image': file.filename
        }
        prediction_history.append(history_entry)
        
        print(f"Final prediction result: {predicted_class} ({confidence:.2f})")
        
        return jsonify(result)

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/predict/history', methods=['GET'])
def get_history():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 6))
        
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        total_items = len(prediction_history)
        total_pages = (total_items + limit - 1) // limit
        
        paginated_history = prediction_history[start_idx:end_idx]
        
        return jsonify({
            'history': paginated_history,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_items,
                'totalPages': total_pages,
                'hasNextPage': end_idx < total_items,
                'hasPrevPage': page > 1
            }
        })
    except Exception as e:
        print(f"Error fetching history: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
