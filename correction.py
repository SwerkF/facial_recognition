#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de correction et debug pour le modèle de reconnaissance faciale
Problème: Le modèle prédit toujours 0 même pour les images USER

Author: GitHub Copilot
Date: 2025-07-31
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import matplotlib.pyplot as plt

class FacialRecognitionDebugger:
    def __init__(self, model_path="./models/best_model_damien.h5"):
        self.model_path = model_path
        self.model = None
        self.image_size = (128, 128)
        self.selected_user = "damien"
        
        # Charger le modèle
        self.load_model()
    
    def load_model(self):
        """Charge le modèle sauvegardé"""
        if os.path.exists(self.model_path):
            try:
                self.model = tf.keras.models.load_model(self.model_path)
                print(f"✅ Modèle chargé: {self.model_path}")
                return True
            except Exception as e:
                print(f"❌ Erreur chargement modèle: {e}")
                return False
        else:
            print(f"❌ Modèle non trouvé: {self.model_path}")
            return False
    
    def preprocess_image(self, image_path):
        """Préprocesse une image"""
        try:
            # Charger l'image
            img = tf.keras.preprocessing.image.load_img(image_path, target_size=self.image_size)
            
            # Convertir en array
            img_array = tf.keras.preprocessing.image.img_to_array(img)
            
            # Normaliser les pixels (0-1) - CRITIQUE
            img_array = img_array / 255.0
            
            # Ajouter dimension batch
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array
        except Exception as e:
            print(f"❌ Erreur preprocessing: {e}")
            return None
    
    def analyze_image_stats(self, image_path):
        """Analyse les statistiques d'une image"""
        print(f"\n🔍 ANALYSE: {os.path.basename(image_path)}")
        print("-" * 50)
        
        # Image originale
        img_orig = tf.keras.preprocessing.image.load_img(image_path, target_size=self.image_size)
        img_orig_array = tf.keras.preprocessing.image.img_to_array(img_orig)
        
        print(f"📊 Image originale:")
        print(f"   Shape: {img_orig_array.shape}")
        print(f"   Min: {img_orig_array.min():.1f}")
        print(f"   Max: {img_orig_array.max():.1f}")
        print(f"   Mean: {img_orig_array.mean():.1f}")
        
        # Image préprocessée
        img_processed = self.preprocess_image(image_path)
        if img_processed is not None:
            print(f"📊 Image préprocessée:")
            print(f"   Shape: {img_processed.shape}")
            print(f"   Min: {img_processed.min():.3f}")
            print(f"   Max: {img_processed.max():.3f}")
            print(f"   Mean: {img_processed.mean():.3f}")
            
            return img_processed
        return None
    
    def predict_with_debug(self, image_path):
        """Prédiction avec debug complet"""
        if self.model is None:
            print("❌ Aucun modèle chargé")
            return None
        
        # Analyser l'image
        img_array = self.analyze_image_stats(image_path)
        if img_array is None:
            return None
        
        # Prédiction brute
        raw_prediction = self.model.predict(img_array, verbose=0)[0][0]
        
        print(f"\n🎯 PRÉDICTION:")
        print(f"   Brute: {raw_prediction:.6f}")
        print(f"   Type: {type(raw_prediction)}")
        
        # Analyser la distribution des activations
        self.analyze_model_layers(img_array)
        
        return raw_prediction
    
    def analyze_model_layers(self, img_array):
        """Analyse les activations des couches du modèle"""
        print(f"\n🧠 ANALYSE DES COUCHES:")
        
        try:
            # Analyser couche par couche
            x = img_array
            for i, layer in enumerate(self.model.layers[:8]):  # Analyser les premières couches
                if hasattr(layer, '__call__'):
                    x = layer(x)
                    layer_name = layer.name
                    print(f"   Couche {i} ({layer_name}):")
                    print(f"     Shape: {x.shape}")
                    print(f"     Min: {x.numpy().min():.4f}")
                    print(f"     Max: {x.numpy().max():.4f}")
                    print(f"     Mean: {x.numpy().mean():.4f}")
                    
                    # Détecter les problèmes
                    if x.numpy().max() == 0:
                        print(f"     ⚠️  PROBLÈME: Toutes les valeurs sont 0!")
                        break
                    if np.isnan(x.numpy()).any():
                        print(f"     ⚠️  PROBLÈME: Valeurs NaN détectées!")
                        break
                        
        except Exception as e:
            print(f"   ❌ Erreur analyse couches: {e}")
            
            # Analyse simple de la sortie finale
            print(f"   📊 Analyse de la sortie finale seulement:")
    
    def test_dataset_labels(self):
        """Vérifie les labels du dataset d'entraînement"""
        print(f"\n📋 VÉRIFICATION DES LABELS:")
        
        # Charger le dataset
        try:
            train_ds = tf.keras.preprocessing.image_dataset_from_directory(
                './binary_dataset',
                validation_split=0.2,
                subset='training',
                seed=1,
                label_mode='binary',
                batch_size=32,
                image_size=self.image_size
            )
            
            class_names = train_ds.class_names
            print(f"   Classes: {class_names}")
            
            # Vérifier l'ordre des classes
            if class_names[0] == 'others' and class_names[1] == 'user':
                print("   ✅ Labels corrects: others=0, user=1")
                return False  # Pas d'inversion
            elif class_names[0] == 'user' and class_names[1] == 'others':
                print("   ⚠️  Labels inversés: user=0, others=1")
                print("   💡 Le modèle a été entraîné avec les labels inversés!")
                return True  # Inversion détectée
            else:
                print(f"   ❓ Ordre de classes inattendu: {class_names}")
                return None
                
        except Exception as e:
            print(f"   ❌ Erreur chargement dataset: {e}")
            return None
    
    def correct_prediction(self, raw_prediction, is_inverted=None):
        """Corrige la prédiction si les labels sont inversés"""
        if is_inverted is None:
            is_inverted = self.test_dataset_labels()
        
        if is_inverted:
            corrected = 1.0 - raw_prediction
            print(f"🔄 Correction appliquée: {raw_prediction:.3f} → {corrected:.3f}")
            return corrected
        else:
            return raw_prediction
    
    def test_multiple_user_images(self):
        """Teste plusieurs images du dossier user"""
        user_dir = './binary_dataset/user'
        
        if not os.path.exists(user_dir):
            print(f"❌ Dossier non trouvé: {user_dir}")
            return
        
        user_images = [f for f in os.listdir(user_dir) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        if not user_images:
            print("❌ Aucune image dans le dossier user")
            return
        
        print(f"\n🧪 TEST DE {len(user_images)} IMAGES USER:")
        print("=" * 60)
        
        # Vérifier les labels une seule fois
        labels_inverted = self.test_dataset_labels()
        
        for i, img_file in enumerate(user_images[:5]):  # Limiter à 5 images
            img_path = os.path.join(user_dir, img_file)
            print(f"\n{i+1}. {img_file}")
            
            # Prédiction brute
            raw_pred = self.predict_with_debug(img_path)
            
            if raw_pred is not None:
                # Correction si nécessaire
                corrected_pred = self.correct_prediction(raw_pred, labels_inverted)
                
                # Décision
                is_user = corrected_pred >= 0.5
                status = "✅ DAMIEN DETECTE" if is_user else "❌ AUTRE PERSONNE"
                
                print(f"🎯 Résultat final: {status}")
                print(f"📊 Probabilité: {corrected_pred:.3f}")
                print(f"💪 Confiance: {max(corrected_pred, 1-corrected_pred):.1%}")
    
    def diagnose_zero_predictions(self):
        """Diagnostique spécifique pour les prédictions nulles"""
        print(f"\n🔍 DIAGNOSTIC PRÉDICTIONS NULLES:")
        print("=" * 50)
        
        # Tester plusieurs images
        user_dir = './binary_dataset/user'
        others_dir = './binary_dataset/others'
        
        test_results = {'user': [], 'others': []}
        
        # Tester images USER
        if os.path.exists(user_dir):
            user_images = [f for f in os.listdir(user_dir) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png'))][:3]
            
            print("📊 Test images USER:")
            for img_file in user_images:
                img_path = os.path.join(user_dir, img_file)
                img_array = self.preprocess_image(img_path)
                if img_array is not None:
                    pred = self.model.predict(img_array, verbose=0)[0][0]
                    test_results['user'].append(pred)
                    print(f"   {img_file}: {pred:.6f}")
        
        # Tester images OTHERS
        if os.path.exists(others_dir):
            others_images = [f for f in os.listdir(others_dir) 
                            if f.lower().endswith(('.jpg', '.jpeg', '.png'))][:3]
            
            print("📊 Test images OTHERS:")
            for img_file in others_images:
                img_path = os.path.join(others_dir, img_file)
                img_array = self.preprocess_image(img_path)
                if img_array is not None:
                    pred = self.model.predict(img_array, verbose=0)[0][0]
                    test_results['others'].append(pred)
                    print(f"   {img_file}: {pred:.6f}")
        
        # Analyser les résultats
        print(f"\n📈 ANALYSE DES RÉSULTATS:")
        if test_results['user']:
            user_preds = np.array(test_results['user'])
            print(f"   USER - Min: {user_preds.min():.6f}, Max: {user_preds.max():.6f}, Mean: {user_preds.mean():.6f}")
        
        if test_results['others']:
            others_preds = np.array(test_results['others'])
            print(f"   OTHERS - Min: {others_preds.min():.6f}, Max: {others_preds.max():.6f}, Mean: {others_preds.mean():.6f}")
        
        # Diagnostic
        all_preds = test_results['user'] + test_results['others']
        if all_preds:
            if all(pred < 0.001 for pred in all_preds):
                print(f"\n❌ PROBLÈME IDENTIFIÉ: Toutes les prédictions sont quasi-nulles!")
                print(f"💡 Causes possibles:")
                print(f"   1. Modèle mal entraîné ou corrompu")
                print(f"   2. Problème de normalisation des données")
                print(f"   3. Gradients qui disparaissent")
                print(f"   4. Problème d'architecture du modèle")
                return "all_zero"
            elif all(pred > 0.999 for pred in all_preds):
                print(f"\n❌ PROBLÈME: Toutes les prédictions sont quasi-maximales!")
                return "all_one"
            else:
                print(f"\n✅ Les prédictions semblent normales")
                return "normal"
        
        return "no_data"
    
    def suggest_solutions(self, problem_type):
        """Suggère des solutions selon le type de problème"""
        print(f"\n💡 SOLUTIONS SUGGÉRÉES:")
        
        if problem_type == "all_zero":
            print(f"🔧 Solution 1: Vérifier la normalisation")
            print(f"   - Les images doivent être normalisées entre 0 et 1")
            print(f"   - Diviser par 255.0, pas par 255")
            
            print(f"\n🔧 Solution 2: Réentraîner le modèle")
            print(f"   - Le modèle actuel semble défaillant")
            print(f"   - Utiliser un learning rate plus élevé")
            
            print(f"\n🔧 Solution 3: Vérifier l'architecture")
            print(f"   - Couche de sortie: Dense(1, activation='sigmoid')")
            print(f"   - Loss: 'binary_crossentropy'")
            
        elif problem_type == "all_one":
            print(f"🔧 Le modèle prédit toujours 1 - vérifier les labels")
            
        elif problem_type == "normal":
            print(f"✅ Le modèle fonctionne correctement")
            
        else:
            print(f"❓ Pas assez de données pour diagnostiquer")

    def quick_fix_test(self, image_path):
        """Test rapide avec correction automatique"""
        print(f"\n🚀 TEST RAPIDE: {os.path.basename(image_path)}")
        
        if not os.path.exists(image_path):
            print(f"❌ Image non trouvée: {image_path}")
            return None
        
        # Vérifier les labels
        labels_inverted = self.test_dataset_labels()
        
        # Prédiction
        img_array = self.preprocess_image(image_path)
        if img_array is None:
            return None
        
        raw_pred = self.model.predict(img_array, verbose=0)[0][0]
        corrected_pred = self.correct_prediction(raw_pred, labels_inverted)
        
        # Résultat
        is_user = corrected_pred >= 0.5
        status = "✅ DAMIEN DETECTE" if is_user else "❌ AUTRE PERSONNE"
        
        print(f"🎯 {status}")
        print(f"📊 Probabilité: {corrected_pred:.3f}")
        
        return {
            'raw': raw_pred,
            'corrected': corrected_pred,
            'is_user': is_user,
            'status': status
        }

def main():
    """Fonction principale de debug"""
    print("🔧 DEBUGGER DE RECONNAISSANCE FACIALE")
    print("=" * 50)
    
    # Initialiser le debugger
    debugger = FacialRecognitionDebugger()
    
    if debugger.model is None:
        print("❌ Impossible de charger le modèle. Arrêt.")
        return
    
    print(f"✅ Debugger initialisé pour {debugger.selected_user}")
    
    # Diagnostic spécifique pour les prédictions nulles
    problem_type = debugger.diagnose_zero_predictions()
    debugger.suggest_solutions(problem_type)
    
    # Test d'une image spécifique pour analyse détaillée
    user_dir = "./binary_dataset/user"
    if os.path.exists(user_dir):
        user_images = [f for f in os.listdir(user_dir) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if user_images:
            test_path = os.path.join(user_dir, user_images[0])
            print(f"\n" + "=" * 50)
            print("🎯 ANALYSE DÉTAILLÉE D'UNE IMAGE:")
            debugger.predict_with_debug(test_path)
    
    # Instructions pour l'utilisateur
    print(f"\n" + "=" * 50)
    print("📝 INSTRUCTIONS POUR CORRIGER:")
    print("1. Le modèle actuel semble défaillant")
    print("2. Recommandation: Réentraîner le modèle")
    print("3. Vérifier la normalisation des données (diviser par 255.0)")
    print("4. Utiliser un learning rate plus élevé (ex: 0.001)")
    print("5. Vérifier que la loss est 'binary_crossentropy'")

if __name__ == "__main__":
    main()