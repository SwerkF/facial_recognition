import { PrismaClient } from '@/config/client';

import dotenv from 'dotenv';

// Chargement des variables d'environnement appropriées
if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' });
} else {
    dotenv.config();
}

// Déclaration de l'instance globale
declare global {
    var prisma: PrismaClient | undefined;
}

const prisma =
    global.prisma ||
    new PrismaClient({
        log: ['info', 'warn', 'error'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

// Middleware pour le suivi des performances
prisma.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;

    if (duration > 1000) {
        console.warn(
            `Requête lente détectée: ${params.model}.${params.action} a pris ${duration}ms`
        );
    }

    return result;
});

// En mode développement, on conserve l'instance dans le scope global
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
