#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script final pour utiliser le modèle corrigé
fixed_model_damien.keras

Author: GitHub Copilot
Date: 2025-07-31
"""

import os
import numpy as np
import tensorflow as tf

class FinalFacialRecognition:
    def __init__(self):
        self.model_path = "./models/fixed_model_damien.keras"
        self.image_size = (128, 128)
        self.selected_user = "damien"
        self.model = None
        
        # Charger le modèle corrigé
        self.load_model()
    
    def load_model(self):
        """Charge le modèle corrigé"""
        if os.path.exists(self.model_path):
            try:
                self.model = tf.keras.models.load_model(self.model_path)
                print(f"✅ Modèle corrigé chargé: {self.model_path}")
                print(f"👤 Configuré pour: {self.selected_user}")
                return True
            except Exception as e:
                print(f"❌ Erreur chargement: {e}")
                return False
        else:
            print(f"❌ Modèle non trouvé: {self.model_path}")
            print("💡 Exécutez retrain_model.py pour créer le modèle")
            return False
    
    def preprocess_image(self, image_path):
        """Préprocesse une image (identique à l'entraînement)"""
        try:
            # Charger l'image
            img = tf.keras.preprocessing.image.load_img(image_path, target_size=self.image_size)
            
            # Convertir en array
            img_array = tf.keras.preprocessing.image.img_to_array(img)
            
            # Normalisation IDENTIQUE à l'entraînement
            img_array = img_array / 255.0
            
            # Ajouter dimension batch
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array
        except Exception as e:
            print(f"❌ Erreur preprocessing: {e}")
            return None
    
    def predict(self, image_path, threshold=0.5):
        """Prédiction avec le modèle corrigé"""
        if self.model is None:
            print("❌ Aucun modèle chargé")
            return None
        
        # Preprocessing
        img_array = self.preprocess_image(image_path)
        if img_array is None:
            return None
        
        # Prédiction
        prediction = self.model.predict(img_array, verbose=0)[0][0]
        
        # Décision
        is_user = prediction >= threshold
        
        return {
            'image_path': image_path,
            'probability': float(prediction),
            'is_user': bool(is_user),
            'confidence': float(max(prediction, 1 - prediction)),
            'user_name': self.selected_user if is_user else 'autre',
            'decision': 1 if is_user else 0
        }
    
    def test_image(self, image_path, threshold=0.5):
        """Test une image avec affichage des résultats"""
        print(f"\n🧪 TEST: {os.path.basename(image_path)}")
        print("-" * 50)
        
        if not os.path.exists(image_path):
            print(f"❌ Image non trouvée: {image_path}")
            return None
        
        result = self.predict(image_path, threshold)
        if result:
            status = "✅ DAMIEN DETECTE" if result['is_user'] else "❌ AUTRE PERSONNE"
            
            print(f"🎯 Résultat: {status}")
            print(f"📊 Probabilité: {result['probability']:.4f}")
            print(f"💪 Confiance: {result['confidence']:.1%}")
            print(f"🎚️  Seuil utilisé: {threshold}")
            
            # Suggestions de seuils
            print(f"\n📋 Avec différents seuils:")
            for t in [0.3, 0.5, 0.7, 0.9]:
                decision = "DAMIEN" if result['probability'] >= t else "AUTRE"
                icon = "✅" if (result['probability'] >= t) == result['is_user'] else "⚠️"
                print(f"   Seuil {t}: {icon} {decision}")
        
        return result
    
    def test_interactive(self):
        """Test interactif"""
        print("🎯 TEST INTERACTIF DU MODÈLE CORRIGÉ")
        print("=" * 50)
        
        while True:
            image_path = input("\n📂 Entrez le chemin de votre image (ou 'quit' pour sortir): ").strip().replace('"', '')
            
            if image_path.lower() in ['quit', 'exit', 'q']:
                print("👋 Au revoir!")
                break
            
            if not image_path:
                print("❌ Veuillez entrer un chemin")
                continue
            
            # Test avec différents seuils
            print(f"\n🔍 Test avec seuil par défaut (0.5):")
            self.test_image(image_path, 0.5)
            
            # Demander un seuil personnalisé
            custom_threshold = input("\n🎚️  Seuil personnalisé (0.1-0.9) ou Enter pour continuer: ").strip()
            if custom_threshold:
                try:
                    threshold = float(custom_threshold)
                    if 0.1 <= threshold <= 0.9:
                        print(f"\n🔍 Test avec seuil {threshold}:")
                        self.test_image(image_path, threshold)
                    else:
                        print("⚠️  Seuil doit être entre 0.1 et 0.9")
                except ValueError:
                    print("⚠️  Seuil invalide")

def main():
    """Fonction principale"""
    print("🚀 RECONNAISSANCE FACIALE - MODÈLE CORRIGÉ")
    print("=" * 50)
    
    # Initialiser le système
    recognizer = FinalFacialRecognition()
    
    if recognizer.model is None:
        print("❌ Système non opérationnel")
        return
    
    # Test automatique sur quelques images
    print("\n🧪 TESTS AUTOMATIQUES:")
    
    # Test images USER
    user_dir = './binary_dataset/user'
    if os.path.exists(user_dir):
        user_images = [f for f in os.listdir(user_dir) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png'))][:2]
        
        for img_file in user_images:
            img_path = os.path.join(user_dir, img_file)
            recognizer.test_image(img_path)
    
    # Instructions
    print(f"\n📝 INSTRUCTIONS:")
    print(f"• Le modèle est maintenant fonctionnel!")
    print(f"• Probabilité proche de 1.0 = DAMIEN détecté")
    print(f"• Probabilité proche de 0.0 = AUTRE personne")
    print(f"• Seuil recommandé: 0.5 (équilibré)")
    
    # Démarrer le test interactif
    recognizer.test_interactive()

if __name__ == "__main__":
    main()
