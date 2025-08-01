# Templates d'emails avec React Email et Tailwind CSS

Ce projet contient les templates d'emails pour l'application, réalisés avec React Email et Tailwind CSS.

## Installation

```bash
# Installer les dépendances
pnpm install
# OU
npm install
```

## Développement

Pour démarrer le serveur de développement :

```bash
pnpm dev
# OU
npm run dev
```

Cela lancera un serveur de prévisualisation sur [http://localhost:3000](http://localhost:3000).

## Export des templates

Pour exporter les templates au format HTML :

```bash
pnpm export
# OU
npm run export
```

Les fichiers HTML seront générés dans le dossier `out`.

## Structure du projet

- `emails/` - Contient tous les templates d'emails
- `tailwind.config.js` - Configuration de Tailwind CSS
- `postcss.config.js` - Configuration de PostCSS pour utiliser Tailwind

## Création d'un nouveau template

Pour créer un nouveau template, ajoutez un fichier `.tsx` dans le dossier `emails/`. Par exemple :

```tsx
import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components';

export default function MonTemplate() {
  return (
    <Html>
      <Head />
      <Preview>Mon template</Preview>
      <Tailwind>
        <Body className="bg-white">
          <Container>
            <Heading className="text-xl">Titre</Heading>
            <Text>Contenu</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
``` 