# API Fastify avec Prisma et MySQL

Une API RESTful construite avec Fastify, TypeScript, Prisma ORM et MySQL.

## Fonctionnalités

- Architecture RESTful
- TypeScript pour la sécurité des types
- Fastify comme framework web rapide et efficace
- Prisma ORM pour l'accès à la base de données
- MySQL comme base de données
- Validation des données avec Zod

## Prérequis

- Node.js (v14 ou supérieur)
- MySQL

## Installation

1. Cloner le dépôt
2. Installer les dépendances

```bash
npm install
```

3. Configurer les variables d'environnement dans le fichier `.env`

```
DATABASE_URL="mysql://user:password@localhost:3306/fastify_api_db"
PORT=3000
NODE_ENV=development
```

4. Générer le client Prisma

```bash
npm run prisma:generate
```

5. Créer la base de données et appliquer les migrations

```bash
npm run prisma:migrate
```

## Démarrage

### Mode développement

```bash
npm run dev
```

### Mode production

```bash
npm run build
npm start
```

## Structure du projet

```
├── prisma/
│   └── schema.prisma    # Schéma de la base de données
├── src/
│   ├── commands/        # Commandes
│   ├── config/          # Configuration de l'application
│   ├── controllers/     # Contrôleurs
│   ├── emails/          # Emails
│   ├── fixtures/        # Fixtures
│   ├── middleware/      # Middleware
│   ├── models/          # Modèles de données
│   ├── plugins/         # Plugins Fastify
│   ├── repositories/    # Repositories
│   ├── routes/          # Routes de l'API
│   ├── services/        # Services métier
│   ├── tests/           # Tests
│   ├── transformers/    # Transformers
│   ├── types/           # Types
│   ├── utils/           # Utilitaires
│   └── index.ts         # Point d'entrée de l'application
├── .env                 # Variables d'environnement
├── package.json         # Dépendances et scripts
└── tsconfig.json        # Configuration TypeScript
```
