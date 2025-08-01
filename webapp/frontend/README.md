# React TSX Template

Ce projet est un template de démarrage pour une application React utilisant TypeScript, configurée avec Vite pour un développement rapide et TailwindCSS pour le style.

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Scripts](#scripts)
- [Structure du Projet](#structure-du-projet)
- [Dépendances Principales](#dépendances-principales)
- [Contribuer](#contribuer)

---

## Prérequis

- Node.js version >= 14.x et npm version >= 6.x

## Installation

1. Clonez ce repository :
  ```bash
  git clone https://github.com/votre-utilisateur/react-tsx-template.git
  cd react-tsx-template
  ```

2. Installez les dépendances :
  ```bash
  npm install
  ```

3. Lancez l'application en mode développement :
  ```bash
  npm run dev
  ```

L'application sera accessible à l'adresse `http://localhost:5173`.

## Scripts

Voici les principaux scripts disponibles :

- `npm run dev` : Démarre le serveur de développement avec Vite
- `npm run build` : Génère la version de production de l'application
- `npm run lint` : Linting du code avec ESLint
- `npm run preview` : Prévisualise l'application de production générée

## Structure du Projet

```bash
src/
├── api/                    # Logique API et requêtes
│   ├── queries/           # Requêtes API
│   ├── authQueries.ts
│   ├── authService.ts
│   └── interceptor.ts
├── assets/                # Ressources statiques
├── components/            # Composants réutilisables
│   ├── layout/           # Composants de mise en page
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── ui/               # Composants d'interface utilisateur
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Loader.tsx
│       ├── Modal.tsx
│       ├── Pagination.tsx
│       └── Tooltip.tsx
├── configs/              # Fichiers de configuration
│   └── queryClient.ts
├── features/             # Fonctionnalités principales
│   ├── auth/            # Authentication
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── user/            # Gestion utilisateur
│   │   └── Profile.tsx
│   └── Error.tsx
├── lib/                 # Utilitaires et helpers
│   └── utils.ts
├── routes/              # Configuration des routes
│   ├── AppRoutes.tsx
│   ├── PrivateRoutes.tsx
│   └── PublicRoutes.tsx
├── services/            # Services de l'application
├── stores/             # Gestion de l'état (Zustand)
│   ├── authStore.ts
│   └── userStore.ts
├── types/              # Types TypeScript
│   ├── apiType.ts
│   ├── authType.ts
│   └── userType.ts
├── validators/         # Validation des formulaires
│   ├── loginValidator.ts
│   └── registerValidator.ts
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

## Dépendances Principales

- `React` : Bibliothèque pour créer des interfaces utilisateur
- `TypeScript` : Superset typé de JavaScript
- `React Query` : Gestion des requêtes API et du cache
- `Zustand` : Gestion de l'état global
- `TailwindCSS` : Framework CSS utilitaire
- `React Router DOM` : Routage de l'application

## Fonctionnalités

- 🔐 Authentification complète (Login/Register)
- 🛣️ Système de routage avec routes protégées
- 🎨 Interface utilisateur responsive avec TailwindCSS
- 📡 Gestion des requêtes API avec React Query
- 🔄 Gestion de l'état global avec Zustand
- ✨ Composants UI réutilisables et animés
  - Boutons interactifs avec états de chargement
  - Cartes avec animations
  - Champs de formulaire avec validation
  - Badges et tooltips
  - Pagination
  - Modales
- 🛡️ Validation des formulaires avec Zod
- 📝 Types TypeScript complets
- 🎭 Animations fluides avec Framer Motion

## Contribuer

Les contributions sont les bienvenues ! Pour toute suggestion d'amélioration, veuillez ouvrir une issue ou une pull request.

---

Développez votre application avec ce template et personnalisez-le selon vos besoins pour un démarrage rapide 🚀 !

Ce `README.md` donne aux utilisateurs toutes les informations nécessaires pour démarrer, comprendre la structure, et personnaliser leur projet. 

