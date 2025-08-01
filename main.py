#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de reconnaissance faciale en temps réel pour détecter Oliwer.

Ce script capture la vidéo en temps réel depuis la webcam, utilise le modèle CNN 
entraîné pour prédire si la personne dans l'image est Oliwer ou non, et affiche 
le résultat en temps réel sur l'écran.

Auteur: Assistant IA
Date: 2024
"""

import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
import os
import sys
import logging
from typing import Tuple, Optional
import time  # Ajouter cet import en haut du fichier

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class OliwerDetector:
    """
    Classe pour la détection d'Oliwer en temps réel.
    """
    
    def __init__(self, model_path: str = './oliwer_best.keras'):
        """
        Initialise le détecteur d'Oliwer.
        
        @param {string} model_path - Le chemin vers le modèle entraîné
        """
        self.model_path = model_path
        self.model = None
        self.face_cascade = None
        self.cap = None
        
        # Configuration de l'affichage
        self.font = cv2.FONT_HERSHEY_SIMPLEX
        self.font_scale = 0.8
        self.thickness = 2
        
        # Couleurs pour l'affichage (BGR)
        self.color_oliwer = (0, 255, 0)      # Vert pour Oliwer
        self.color_not_oliwer = (0, 0, 255)  # Rouge pour pas Oliwer
        self.color_no_face = (255, 255, 0)   # Cyan pour aucun visage
        
        self._load_model()
        self._load_face_detector()
    
    def _load_model(self) -> None:
        """
        Charge le modèle CNN entraîné.
        """
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Le modèle {self.model_path} n'existe pas")
            
            self.model = keras.models.load_model(self.model_path)
            logging.info(f"Modèle chargé avec succès depuis {self.model_path}")
            
            # Afficher les informations du modèle
            input_shape = self.model.input_shape
            logging.info(f"Forme d'entrée du modèle: {input_shape}")
            
        except Exception as e:
            logging.error(f"Erreur lors du chargement du modèle: {e}")
            sys.exit(1)
    
    def _load_face_detector(self) -> None:
        """
        Charge le détecteur de visages Haar Cascade.
        """
        try:
            # Chemin vers le classificateur Haar pour les visages
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            
            if self.face_cascade.empty():
                logging.warning("Détecteur de visages non chargé, utilisation de l'image complète")
                self.face_cascade = None
            else:
                logging.info("Détecteur de visages chargé avec succès")
                
        except Exception as e:
            logging.warning(f"Erreur lors du chargement du détecteur de visages: {e}")
            self.face_cascade = None
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Préprocesse une image pour la prédiction.
        
        @param {numpy.ndarray} image - L'image à préprocesser (BGR)
        @returns {numpy.ndarray} L'image préprocessée prête pour la prédiction
        """
        # Convertir en niveaux de gris
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Redimensionner à 64x64 (taille utilisée par le modèle)
        resized = cv2.resize(gray, (64, 64))
        
        # Normaliser les valeurs entre 0 et 1
        normalized = resized.astype('float32') / 255.0
        
        # Ajouter les dimensions nécessaires pour le modèle
        # (batch_size, height, width, channels)
        preprocessed = np.expand_dims(normalized, axis=-1)  # Ajouter dimension canal
        preprocessed = np.expand_dims(preprocessed, axis=0)  # Ajouter dimension batch
        
        return preprocessed
    
    def predict(self, image: np.ndarray) -> Tuple[float, bool]:
        """
        Effectue une prédiction sur une image.
        
        @param {numpy.ndarray} image - L'image à analyser
        @returns {tuple} Tuple contenant (confiance, is_oliwer)
        """
        try:
            # Préprocesser l'image
            processed_image = self.preprocess_image(image)
            
            # Faire la prédiction
            prediction = self.model.predict(processed_image, verbose=0)
            confidence = float(prediction[0][0])
            
            # Le modèle retourne >0.5 pour Oliwer, <0.5 pour pas Oliwer
            is_oliwer = confidence > 0.5
            
            return confidence, is_oliwer
            
        except Exception as e:
            logging.error(f"Erreur lors de la prédiction: {e}")
            return 0.0, False
    
    def detect_faces(self, frame: np.ndarray) -> list:
        """
        Détecte les visages dans une image.
        
        @param {numpy.ndarray} frame - L'image dans laquelle détecter les visages
        @returns {list} Liste des rectangles des visages détectés [(x, y, w, h), ...]
        """
        if self.face_cascade is None:
            return []
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(50, 50)
        )
        
        return faces
    
    def draw_prediction(self, frame: np.ndarray, confidence: float, is_oliwer: bool, 
                       face_rect: Optional[Tuple[int, int, int, int]] = None) -> np.ndarray:
        """
        Dessine la prédiction sur l'image.
        
        @param {numpy.ndarray} frame - L'image sur laquelle dessiner
        @param {float} confidence - La confiance de la prédiction
        @param {bool} is_oliwer - Si c'est Oliwer ou non
        @param {tuple} face_rect - Rectangle du visage détecté (x, y, w, h)
        @returns {numpy.ndarray} L'image avec la prédiction dessinée
        """
        # Créer une copie pour ne pas modifier l'original
        result_frame = frame.copy()
        
        # Dessiner le rectangle du visage si fourni
        if face_rect is not None:
            x, y, w, h = face_rect
            color = self.color_oliwer if is_oliwer else self.color_not_oliwer
            cv2.rectangle(result_frame, (x, y), (x + w, y + h), color, 2)
        
        # Préparer le texte
        if is_oliwer:
            text = f"OLIWER: {confidence:.1%}"
            color = self.color_oliwer
        else:
            text = f"PAS OLIWER: {(1-confidence):.1%}"
            color = self.color_not_oliwer
        
        # Position du texte
        text_x = 10
        text_y = 30
        
        # Dessiner un fond pour le texte
        (text_width, text_height), _ = cv2.getTextSize(text, self.font, self.font_scale, self.thickness)
        cv2.rectangle(result_frame, (text_x - 5, text_y - text_height - 5), 
                     (text_x + text_width + 5, text_y + 5), (0, 0, 0), -1)
        
        # Dessiner le texte
        cv2.putText(result_frame, text, (text_x, text_y), self.font, 
                   self.font_scale, color, self.thickness)
        
        # Ajouter des instructions
        instructions = "Appuyez sur 'q' pour quitter"
        cv2.putText(result_frame, instructions, (10, frame.shape[0] - 10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        return result_frame
    
    def start_detection(self, camera_index: int = 0) -> None:
        """
        Démarre la détection en temps réel.
        
        @param {int} camera_index - Index de la caméra à utiliser (0 par défaut)
        """
        try:
            # Initialiser la capture vidéo
            self.cap = cv2.VideoCapture(camera_index)
            
            if not self.cap.isOpened():
                raise RuntimeError(f"Impossible d'ouvrir la caméra {camera_index}")
            
            # Configurer la résolution
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            
            logging.info("Démarrage de la détection en temps réel...")
            logging.info("Appuyez sur 'q' pour quitter")
            
            while True:
                start_time = time.time()
                
                # Capturer une image
                ret, frame = self.cap.read()
                
                if not ret:
                    logging.error("Erreur lors de la capture de l'image")
                    break
                
                # Détecter les visages
                faces = self.detect_faces(frame)
                
                if len(faces) > 0:
                    # Prendre le premier visage détecté
                    x, y, w, h = faces[0]
                    
                    # Extraire la région du visage avec une marge
                    margin = 20
                    face_region = frame[max(0, y-margin):min(frame.shape[0], y+h+margin),
                                      max(0, x-margin):min(frame.shape[1], x+w+margin)]
                    
                    # Faire la prédiction sur le visage
                    confidence, is_oliwer = self.predict(face_region)
                    
                    # Dessiner la prédiction
                    result_frame = self.draw_prediction(frame, confidence, is_oliwer, (x, y, w, h))
                    
                else:
                    # Aucun visage détecté, analyser l'image complète
                    confidence, is_oliwer = self.predict(frame)
                    result_frame = self.draw_prediction(frame, confidence, is_oliwer)
                    
                    # Ajouter un message d'avertissement
                    cv2.putText(result_frame, "Aucun visage detecte", (10, 60), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.6, self.color_no_face, 2)
                
                # Afficher le résultat
                cv2.imshow('Detection Oliwer - Temps Reel', result_frame)
                
                # Vérifier si l'utilisateur veut quitter (attente courte)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                
                # Attendre pour atteindre 1 seconde par frame
                elapsed_time = time.time() - start_time
                sleep_time = max(0, 1.0 - elapsed_time)
                time.sleep(sleep_time)
            
        except Exception as e:
            logging.error(f"Erreur pendant la détection: {e}")
        
        finally:
            self._cleanup()
    
    def _cleanup(self) -> None:
        """
        Nettoie les ressources utilisées.
        """
        if self.cap is not None:
            self.cap.release()
        cv2.destroyAllWindows()
        logging.info("Nettoyage terminé")

def main():
    """
    Fonction principale du programme.
    """
    print("🎥 Démarrage de la reconnaissance faciale Oliwer en temps réel")
    print("=" * 60)
    
    try:
        # Créer et démarrer le détecteur
        detector = OliwerDetector('./model.keras')
        detector.start_detection()
        
    except KeyboardInterrupt:
        logging.info("Arrêt demandé par l'utilisateur")
    except Exception as e:
        logging.error(f"Erreur fatale: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()