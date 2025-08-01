from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
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

def preprocess_damien(image_bytes):
    """Préprocesse une image pour la prédiction (identique à l'entraînement)"""
    try:
        import tempfile
        
        # Créer un fichier temporaire pour sauvegarder l'image
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(image_bytes)
            temp_path = temp_file.name
        
        # Charger l'image avec la même méthode que l'entraînement
        image_size = (128, 128)  # target_size du modèle
        img = tf.keras.preprocessing.image.load_img(temp_path, target_size=image_size)
        
        # Convertir en array
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        
        # Normalisation IDENTIQUE à l'entraînement
        img_array = img_array / 255.0
        
        # Ajouter dimension batch
        img_array = np.expand_dims(img_array, axis=0)
        
        # Nettoyer le fichier temporaire
        os.unlink(temp_path)
        
        return img_array
    except Exception as e:
        print(f"Erreur preprocessing: {e}")
        # Nettoyer le fichier temporaire en cas d'erreur
        try:
            if 'temp_path' in locals():
                os.unlink(temp_path)
        except:
            pass
        return None

def preprocess_mohand(image_bytes):
    """Préprocesse une image pour la prédiction (identique à l'entraînement)"""
    try:
        # Convertir bytes en array numpy pour cv2
        file_bytes = np.asarray(bytearray(image_bytes), dtype=np.uint8)
        
        # Charger l'image en niveaux de gris (comme dans le notebook)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_GRAYSCALE)
        
        if image is None:
            return None
            
        # Redimensionner à 100x100 (comme dans le notebook)
        image = cv2.resize(image, (100, 100))
        
        # Normalisation
        image = image.astype('float32') / 255.0
        
        # Ajouter les dimensions (canal et batch)
        image = np.expand_dims(image, axis=-1)  # Canal
        image = np.expand_dims(image, axis=0)   # Batch
        
        return image
    except Exception as e:
        print(f"Erreur preprocessing mohand: {e}")
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
        processed_image = preprocess_damien(file_content)
        
        if processed_image is None:
            return jsonify({'error': 'Impossible de traiter l\'image'}), 400
        
        # Faire la prédiction
        prediction = model.predict(processed_image, verbose=0)
        confidence = prediction[0][0]
        
        # Interpréter le résultat
        if confidence > 0.5:
            result = {
                'is_same': True,
                'confidence': float(confidence),
                'percentage': f"{confidence:.2%}",
                'message': f"C'est Damien avec {confidence:.2%} de confiance"
            }
        else:
            non_confidence = 1 - confidence
            result = {
                'is_same': False,
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
