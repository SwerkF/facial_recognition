# React + Fastify Skeleton

## Prérequis

- Docker
- Node.js
- PNPM (npm install -g pnpm)

## Structure du projet

- `backend`: Dossier pour le serveur Fastify
- `frontend`: Dossier pour le frontend React
- `shared`: Dossier pour les fichiers partagés entre le backend et le frontend, il contient les types, les interfaces, les fonctions utiles, etc.

## Installation

1. Cloner le repository

2. Créer un fichier `.env` dans le dossier `backend` et `frontend` avec les variables d'environnement nécessaires.

3. Installer les dépendances avec la commande suivante.

```bash
pnpm install
```

4. Lancer les conteneurs Docker avec la commande suivante. Ils permettent de lancer:

- Un serveur MySQL: http://localhost:8080: Gérer la base de données
- Un serveur PHPMyAdmin: http://localhost:8080: Gérer la base de données
- Un serveur Mailhog: http://localhost:8025 / smtp://mailhog:1025: Envoyer des emails
- Un serveur Minio: http://localhost:9000: Stockage de fichiers
- Un serveur Loki: http://localhost:3100: Logger
- Un serveur Grafana: http://localhost:3001: Consulter les logs
- Un serveur Frontend: http://localhost:5173: Frontend
- Un serveur Backend: http://localhost:3000: Backend

```bash
docker compose -f ./docker/docker-compose.dev.yml -p fastify-dev up -d
```

5. Créez la base de données avec la commande suivante:

```bash
cd backend
pnpm run prisma:docker:all
pnpm run prisma:all
```

## Notes de version

### Version 1.1.1

- Ajout des lints dans le code pour une meilleure qualité du code.
- Ajout de Husky pour des hooks sur les commits et pull.

### Version 1.1.0

- Mise à jour des cursor rules dans .cursor
- Ajout d'un serveur Redis pour la mise en cache
- Restructuration du projet pour une meilleure lisibilité
- Fix des dockers qui ne fonctionnent pas en dev
- Ajout d'un exemple concret pour le frontend
- Suppression du baseRepository
- Ajout d'une pipeline pour tester le formatage du code
- Amélioration du logging
- Autres petites améliorations...

### Version 1.0.2

- Fix de certains imports / exports.
- Ajout de la commande `pnpm prisma:docker:all` pour générer, migrer et planter la base de données dans un conteneur Docker.
- Ajout de la commande `pnpm prisma:docker:generate` pour générer les types de la base de données dans un conteneur Docker.
- Traduction des messages de réponses en anglais.
- Ajout de l'entité `Post` avec les routes CRUD, controllers, routes, repository, transformer, dto pour une meilleure compréhension du projet.
- Changement output de la base de données prisma.

```diff
# prisma/schema.prisma
+ output = "../../src/config/client"
```

Exemple concret du changement:

```diff
# src/repositories/userRepository.ts
- import { User } from '@prisma/client';
+ import { User } from '@/config/client';
```

### Version 1.0.1

- Ajout d'un docker compose pour le développement.
- Amélioration de la vitesse du build de l'application.
- Redémarrage du backend lors de la sauvegarde des DTOs.
- Renvoi des "data" sous format array.
- Changement roles user en JSON.
- Ajout de la commande `pnpm prisma:all` pour générer, migrer et planter la base de données.
- Ajout de la commande `pnpm prisma:docker` pour générer, migrer et planter la base de données dans un conteneur Docker.

### Version 1.0.0

- Première version du projet.
