# Projet de Reconnaissance Faciale + WebApp

## À propos du projet

Ce projet combine intelligence artificielle et développement web pour créer un système complet de reconnaissance faciale. Il se compose de deux parties principales :

### **IA & Machine Learning**
- Modèles de reconnaissance faciale entraînés avec TensorFlow/Keras
- Preprocessing d'images avec OpenCV
- Serveur Python Flask pour l'API de prédiction
- Support de classification binaire (reconnaissance de personnes spécifiques)

### **Application Web**
- Frontend React moderne et responsive
- Backend Fastify avec API REST
- Base de données MySQL avec Prisma ORM
- Stockage de fichiers avec MinIO
- Système d'authentification et gestion utilisateurs

### **Fonctionnalités**
- Upload d'images via interface web
- Analyse en temps réel des visages
- Résultats de prédiction avec pourcentages de confiance
- Historique des analyses
- Interface d'administration

## Prérequis

- Docker
- Node.js
- PNPM (npm install -g pnpm)
- Python 3.8+ (pour le serveur IA)

## Structure du projet

- `webapp/backend`: Serveur Fastify
- `webapp/frontend`: Frontend React
- `webapp/shared`: Fichiers partagés (types, interfaces, etc.)
- `ia/`: Modèles de reconnaissance faciale et serveur Python

## Installation et lancement

### 1. Lancer les services Docker

```bash
cd webapp/docker
docker compose -f docker-compose.dev.yml up -d --build
```

### 2. Installer les dépendances et configurer la base de données

```bash
# Retourner à la racine du projet webapp
cd ..
pnpm install

# Configuration de la base de données
cd backend
pnpm prisma:generate
pnpm prisma:migrate
cd ..

# Lancer le projet en mode développement
pnpm run dev
```

### 3. Lancer le serveur IA (reconnaissance faciale)

```bash
# Dans un nouveau terminal, aller au dossier IA
cd ia

# Installer les dépendances Python
pip install -r requirements.txt

# Lancer le serveur Flask
python server.py
```

## Services disponibles

Une fois tous les services lancés :

- **Frontend React**: http://localhost:5173
- **Backend Fastify**: http://localhost:3000
- **Serveur IA Python**: http://localhost:7777
- **Base de données MySQL**: localhost:3306
- **Interface PHPMyAdmin**: http://localhost:8080
- **MinIO (stockage)**: http://localhost:9000

## Développement

- Les modifications du frontend et backend se rechargent automatiquement
- Le serveur Python doit être relancé manuellement en cas de modification
- Les modèles de reconnaissance faciale sont dans le dossier `ia/`
