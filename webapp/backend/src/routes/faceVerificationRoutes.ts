import { faceVerificationController } from '@/controllers/faceVerificationController';
import { createSwaggerSchema } from '@/utils/swaggerUtils';

import { faceVerificationQuerySchema } from '@shared/dto/faceVerificationDto';
import { FastifyInstance } from 'fastify';

export async function faceVerificationRoutes(fastify: FastifyInstance) {
    // Créer une nouvelle vérification faciale
    fastify.post('/', {
        schema: createSwaggerSchema(
            'Crée une nouvelle vérification faciale avec deux images (référence et upload).',
            [
                { message: 'Vérification faciale créée avec succès', data: [], status: 201 },
                { message: 'Données invalides', data: [], status: 400 },
                { message: 'Type de fichier non supporté', data: [], status: 400 },
                {
                    message: 'Erreur lors de la création de la vérification',
                    data: [],
                    status: 500,
                },
            ],
            null, // Le schéma de body sera géré par multipart
            false, // Pas d'authentification requise pour le moment
            null,
            ['Face Verification']
        ),
        handler: faceVerificationController.createFaceVerification,
    });

    // Récupérer toutes les vérifications faciales
    fastify.get('/', {
        schema: createSwaggerSchema(
            'Récupère toutes les vérifications faciales avec pagination et filtres optionnels.',
            [
                { message: 'Vérifications faciales récupérées avec succès', data: [], status: 200 },
                { message: 'Paramètres de requête invalides', data: [], status: 400 },
                {
                    message: 'Erreur lors de la récupération des vérifications',
                    data: [],
                    status: 500,
                },
            ],
            null,
            false, // Pas d'authentification requise pour le moment
            faceVerificationQuerySchema,
            ['Face Verification']
        ),
        handler: faceVerificationController.getAll,
    });
}


