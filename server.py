from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
import tensorflow as tf
from tensorflow import keras
from PIL import Image
import io

app = Flask(__name__)
CORS(app)  # Permet les requêtes cross-origin pour la webapp

# Charger le modèle pré-entraîné
MODEL_PATH = 'damien-model.keras'
model = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = keras.models.load_model(MODEL_PATH)
        print(f"Modèle chargé depuis {MODEL_PATH}")
    else:
        print(f"Modèle non trouvé à {MODEL_PATH}")

def preprocess_image_from_bytes(image_bytes):
    """Préprocesse une image pour la prédiction (identique à l'entraînement)"""
    try:
        # Charger l'image depuis les bytes
        img = Image.open(io.BytesIO(image_bytes))
        
        # Redimensionner à 128x128 (target_size)
        img = img.resize((128, 128))
        
        # Convertir en array
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        
        # Normalisation IDENTIQUE à l'entraînement
        img_array = img_array / 255.0
        
        # Ajouter dimension batch
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        print(f"Erreur preprocessing: {e}")
        return None


@app.route('/api/upload', methods=['POST'])
def upload_image():
    """Route API pour l'upload et la reconnaissance d'image"""
    try:
        # Vérifier si un fichier a été envoyé
        if 'image' not in request.files:
            return jsonify({'error': 'Aucun fichier image trouvé'}), 400
        
        file = request.files['image']
        
        # Vérifier si un fichier a été sélectionné
        if file.filename == '':
            return jsonify({'error': 'Aucun fichier sélectionné'}), 400
        
        # Vérifier le format du fichier
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'error': 'Format de fichier non supporté'}), 400
        
        # Vérifier si le modèle est chargé
        if model is None:
            return jsonify({'error': 'Modèle de reconnaissance non disponible'}), 500
        
        # Préparation de l'image avec TensorFlow/Keras (identique à l'entraînement)
        file_content = file.read()
        processed_image = preprocess_image_from_bytes(file_content)
        
        if processed_image is None:
            return jsonify({'error': 'Impossible de traiter l\'image'}), 400
        
        # Faire la prédiction
        prediction = model.predict(processed_image)
        confidence = prediction[0][0]
        
        # Interpréter le résultat
        if confidence > 0.5:
            result = {
                'is_oliwer': True,
                'confidence': float(confidence),
                'percentage': f"{confidence:.2%}",
                'message': f"C'est Damien avec {confidence:.2%} de confiance"
            }
        else:
            non_confidence = 1 - confidence
            result = {
                'is_oliwer': False,
                'confidence': float(non_confidence),
                'percentage': f"{non_confidence:.2%}",
                'message': f"Ce n'est pas Damien avec {non_confidence:.2%} de confiance"
            }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'Erreur lors du traitement: {str(e)}'}), 500



if __name__ == '__main__':
    # Charger le modèle au démarrage
    load_model()
    
    # Démarrer le serveur
    app.run(debug=True, host='0.0.0.0', port=7777)
