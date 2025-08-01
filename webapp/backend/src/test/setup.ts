/// <reference types="jest" />

import prisma from '@/config/prisma';
import { logger } from '@/utils/logger';

import dotenv from 'dotenv';

// Charger explicitement les variables d'environnement de test
dotenv.config({ path: '.env.test' });

// Variable pour stocker l'application si nécessaire
let app: any;

beforeAll(async () => {
    // Vérifier que nous sommes bien en environnement de test
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('Les tests doivent être exécutés avec NODE_ENV=test');
    }

    // Vérifier que nous utilisons bien la base de données de test
    if (!process.env.DATABASE_URL?.includes('database_test')) {
        throw new Error('Les tests doivent utiliser la base de données de test');
    }

    logger.info('Utilisation de la base de données:', process.env.DATABASE_URL);
    logger.info('Schéma de base de données de test créé');
});

beforeEach(async () => {
    // Nettoyer les tables avant chaque test
    logger.info('Nettoyage des tables...');

    try {
        // Nettoyer les tables
        await prisma.token.deleteMany();
        await prisma.user.deleteMany();
    } catch (error) {
        console.error('Erreur lors du nettoyage des tables:', error);
    }
});

afterEach(async () => {
    // Fermer l'application si elle a été ouverte
    if (app) {
        await app.close();
    }
});

afterAll(async () => {
    // Fermer la connexion Prisma à la fin de tous les tests
    logger.info('Fermeture de la connexion à la base de données...');
    await prisma.$disconnect();
});
