FROM node:18-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie des fichiers du projet
COPY . .

# Création d'un lien symbolique vers le dossier shared
RUN ln -s /shared /app/src/shared

# Exposition du port
EXPOSE 5173

# Variables d'environnement pour le développement
ENV VITE_API_URL=http://api:3000

# Lancement en mode développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]