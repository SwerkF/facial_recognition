#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de réentraînement du modèle avec corrections
Corrige le problème des prédictions nulles

Author: GitHub Copilot
Date: 2025-07-31
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense, Conv2D, MaxPooling2D, Flatten, BatchNormalization, Dropout
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
import matplotlib.pyplot as plt

class FixedModelTrainer:
    def __init__(self):
        self.seed = 1
        self.batch_size = 32
        self.image_size = (128, 128)
        self.epochs = 10  # Plus d'époques
        self.selected_user = "damien"
        
        # Configuration fixe pour éviter les problèmes
        tf.random.set_seed(self.seed)
        np.random.seed(self.seed)
    
    def create_corrected_dataset(self):
        """Crée un dataset avec normalisation correcte"""
        print("📂 Chargement du dataset avec normalisation fixe...")
        
        try:
            train_ds = tf.keras.preprocessing.image_dataset_from_directory(
                './binary_dataset',
                validation_split=0.2,
                subset='training',
                seed=self.seed,
                label_mode='binary',
                batch_size=self.batch_size,
                image_size=self.image_size
            )
            
            val_ds = tf.keras.preprocessing.image_dataset_from_directory(
                './binary_dataset',
                validation_split=0.2,
                subset='validation',
                seed=self.seed,
                label_mode='binary',
                batch_size=self.batch_size,
                image_size=self.image_size
            )
            
            # NORMALISATION CORRECTE ET EXPLICITE
            def normalize_and_verify(image, label):
                # Convertir en float32 et normaliser
                image = tf.cast(image, tf.float32) / 255.0
                
                # Vérifier les valeurs (debug)
                tf.debugging.assert_all_finite(image, "Image contient des valeurs non-finies")
                tf.debugging.assert_greater_equal(image, 0.0, "Image contient des valeurs négatives")
                tf.debugging.assert_less_equal(image, 1.0, "Image contient des valeurs > 1")
                
                return image, label
            
            train_ds = train_ds.map(normalize_and_verify, num_parallel_calls=tf.data.AUTOTUNE)
            val_ds = val_ds.map(normalize_and_verify, num_parallel_calls=tf.data.AUTOTUNE)
            
            # Optimisation des performances
            train_ds = train_ds.cache().prefetch(tf.data.AUTOTUNE)
            val_ds = val_ds.cache().prefetch(tf.data.AUTOTUNE)
            
            print(f"✅ Dataset créé:")
            print(f"   Batch size: {self.batch_size}")
            
            return train_ds, val_ds
            
        except Exception as e:
            print(f"❌ Erreur création dataset: {e}")
            return None, None
    
    def create_improved_model(self):
        """Crée un modèle avec une architecture améliorée"""
        print("🧠 Création du modèle amélioré...")
        
        model = Sequential([
            # Première couche Conv
            Conv2D(32, (3,3), padding='same', activation='relu', 
                   input_shape=(*self.image_size, 3),
                   kernel_initializer='he_normal'),
            BatchNormalization(),
            MaxPooling2D((2,2)),
            
            # Deuxième couche Conv
            Conv2D(64, (3,3), padding='same', activation='relu',
                   kernel_initializer='he_normal'),
            BatchNormalization(),
            MaxPooling2D((2,2)),
            
            # Troisième couche Conv
            Conv2D(128, (3,3), padding='same', activation='relu',
                   kernel_initializer='he_normal'),
            BatchNormalization(),
            MaxPooling2D((2,2)),
            
            # Couches denses avec moins de dropout
            Flatten(),
            Dense(256, activation='relu', kernel_initializer='he_normal'),
            Dropout(0.3),  # Moins de dropout
            Dense(128, activation='relu', kernel_initializer='he_normal'),
            Dropout(0.2),
            
            # Couche de sortie CRITIQUE
            Dense(1, activation='sigmoid', kernel_initializer='glorot_uniform')
        ])
        
        # COMPILATION AVEC PARAMÈTRES OPTIMISÉS
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),  # LR plus élevé
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        print("✅ Modèle créé et compilé")
        model.summary()
        
        return model
    
    def train_fixed_model(self, train_ds, val_ds):
        """Entraîne le modèle avec des paramètres fixes"""
        print("🚀 Début de l'entraînement corrigé...")
        
        # Créer le modèle
        model = self.create_improved_model()
        
        # Callbacks améliorés
        checkpoint_path = f"./models/fixed_model_{self.selected_user}.keras"
        os.makedirs("./models", exist_ok=True)
        
        callbacks = [
            ModelCheckpoint(
                filepath=checkpoint_path,
                monitor='val_accuracy',
                save_best_only=True,
                save_weights_only=False,
                mode='max',
                verbose=1
            ),
            EarlyStopping(
                monitor='val_loss',
                patience=5,  # Plus de patience
                restore_best_weights=True,
                verbose=1
            )
        ]
        
        # ENTRAÎNEMENT
        history = model.fit(
            train_ds,
            epochs=self.epochs,
            validation_data=val_ds,
            callbacks=callbacks,
            verbose=1
        )
        
        print(f"✅ Entraînement terminé!")
        print(f"📁 Modèle sauvegardé: {checkpoint_path}")
        
        return model, history
    
    def test_new_model(self, model):
        """Teste le nouveau modèle"""
        print("\n🧪 TEST DU NOUVEAU MODÈLE:")
        print("-" * 40)
        
        # Tester sur images USER
        user_dir = './binary_dataset/user'
        if os.path.exists(user_dir):
            user_images = [f for f in os.listdir(user_dir) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png'))][:3]
            
            print("📊 Test images USER:")
            for img_file in user_images:
                img_path = os.path.join(user_dir, img_file)
                
                # Preprocessing identique à l'entraînement
                img = tf.keras.preprocessing.image.load_img(img_path, target_size=self.image_size)
                img_array = tf.keras.preprocessing.image.img_to_array(img)
                img_array = img_array / 255.0  # Normalisation identique
                img_array = np.expand_dims(img_array, axis=0)
                
                # Prédiction
                pred = model.predict(img_array, verbose=0)[0][0]
                status = "✅ DAMIEN" if pred >= 0.5 else "❌ AUTRE"
                print(f"   {img_file}: {pred:.4f} {status}")
        
        # Tester sur images OTHERS
        others_dir = './binary_dataset/others'
        if os.path.exists(others_dir):
            others_images = [f for f in os.listdir(others_dir) 
                            if f.lower().endswith(('.jpg', '.jpeg', '.png'))][:3]
            
            print("📊 Test images OTHERS:")
            for img_file in others_images:
                img_path = os.path.join(others_dir, img_file)
                
                # Preprocessing
                img = tf.keras.preprocessing.image.load_img(img_path, target_size=self.image_size)
                img_array = tf.keras.preprocessing.image.img_to_array(img)
                img_array = img_array / 255.0
                img_array = np.expand_dims(img_array, axis=0)
                
                # Prédiction
                pred = model.predict(img_array, verbose=0)[0][0]
                status = "✅ AUTRE" if pred < 0.5 else "❌ DAMIEN"
                print(f"   {img_file}: {pred:.4f} {status}")

def main():
    """Fonction principale de réentraînement"""
    print("🔧 RÉENTRAÎNEMENT DU MODÈLE FACIAL")
    print("=" * 50)
    
    trainer = FixedModelTrainer()
    
    # 1. Créer le dataset corrigé
    train_ds, val_ds = trainer.create_corrected_dataset()
    if train_ds is None:
        print("❌ Impossible de créer le dataset")
        return
    
    # 2. Entraîner le modèle
    model, history = trainer.train_fixed_model(train_ds, val_ds)
    
    # 3. Tester le nouveau modèle
    trainer.test_new_model(model)
    
    # 4. Afficher les résultats
    if history:
        final_acc = history.history['val_accuracy'][-1]
        final_loss = history.history['val_loss'][-1]
        print(f"\n📈 Résultats finaux:")
        print(f"   Précision validation: {final_acc:.2%}")
        print(f"   Perte validation: {final_loss:.4f}")
    
    print("\n✅ Réentraînement terminé!")
    print("💡 Utilisez maintenant: fixed_model_damien.h5")

if __name__ == "__main__":
    main()
