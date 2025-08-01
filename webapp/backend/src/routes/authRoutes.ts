import { authController } from '@/controllers/authController';
import { verifyAccess } from '@/middleware';
import { isAuthenticated } from '@/middleware/auth';
import { authService } from '@/services';
import { createSwaggerSchema } from '@/utils/swaggerUtils';

import {
   loginSchema,
   resetPasswordSchema,
   registerSchema,
   requestPasswordResetSchema,
   tokenSchema,
   updatePasswordSchema,
   querySessionsSchema
} from '@shared/dto';

import { Role } from '@shared/enums';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export async function authRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Créer un nouvel utilisateur
    fastify.post('/register', {
        schema: createSwaggerSchema(
            'Crée un nouvel utilisateur.',
            [
                { message: 'Utilisateur créé avec succès', data: {}, status: 200 },
                { message: 'Utilisateur déjà existant', data: {}, status: 400 },
                { message: "Erreur lors de la création de l'utilisateur", data: {}, status: 500 },
            ],
            registerSchema,
            false,
            null,
            ['Auth']
        ),
        handler: authController.createUser,
    });

    // Récupérer l'utilisateur via le token
    fastify.get('/me', {
        schema: createSwaggerSchema(
            "Récupère l'utilisateur via le token.",
            [
                { message: 'Utilisateur récupéré avec succès', data: {}, status: 200 },
                { message: 'Token invalide', data: {}, status: 401 },
            ],
            null,
            true,
            null,
            ['Auth']
        ),
        preHandler: [isAuthenticated],
        handler: authController.getCurrentUser,
    });

    fastify.post('/update-password', {
        schema: createSwaggerSchema(
            "Met à jour le mot de passe de l'utilisateur.",
            [
                { message: 'Mot de passe mis à jour avec succès', data: {}, status: 200 },
                { message: 'Mot de passe incorrect', data: {}, status: 401 },
                { message: 'Erreur lors de la mise à jour du mot de passe', data: {}, status: 500 },
            ],
            updatePasswordSchema,
            false,
            null,
            ['Auth']
        ),
        preHandler: [isAuthenticated],
        handler: authController.updatePassword,
    });

    fastify.post('/refresh_token', {
        schema: createSwaggerSchema(
            "Refresh l'access token de l'utilisateur.",
            [
                { message: 'Token rafraîchi avec succès', data: [], status: 200 },
                { message: 'Token invalide', data: [], status: 401 },
            ],
            tokenSchema,
            false,
            null,
            ['Auth']
        ),
        handler: authController.refreshToken,
    });

    // Login
    fastify.post('/login', {
        schema: createSwaggerSchema(
            "Connexion à l'application.",
            [
                {
                    message: 'Connexion réussie',
                    data: {},
                    status: 200,
                },
                { message: 'Identifiants invalides', data: {}, status: 401 },
                { message: 'Erreur lors de la connexion', data: {}, status: 500 },
            ],
            loginSchema,
            false,
            null,
            ['Auth']
        ),
        handler: authController.login,
    });

    // Route pour demander une réinitialisation de mot de passe
    fastify.post('/forgot-password', {
        schema: createSwaggerSchema(
            'Demande une réinitialisation de mot de passe.',
            [
                { message: 'Réinitialisation de mot de passe demandée', data: {}, status: 200 },
                { message: 'Erreur de validation', data: {}, status: 400 },
                {
                    message: 'Erreur lors de la demande de réinitialisation de mot de passe',
                    data: {},
                    status: 500,
                },
            ],
            requestPasswordResetSchema,
            false,
            null,
            ['Auth']
        ),
        handler: authController.requestPasswordReset,
    });

    // Route pour réinitialiser le mot de passe
    fastify.post('/reset-password', {
        schema: createSwaggerSchema(
            'Réinitialise le mot de passe.',
            [
                { message: 'Mot de passe réinitialisé avec succès', data: {}, status: 200 },
                { message: 'Erreur de validation', data: {}, status: 400 },
                {
                    message: 'Erreur lors de la réinitialisation du mot de passe',
                    data: {},
                    status: 500,
                },
            ],
            resetPasswordSchema,
            false,
            null,
            ['Auth']
        ),
        handler: authController.resetPassword,
    });

    fastify.get('/sessions', {
        schema: createSwaggerSchema(
            "Récupère les sessions de l'utilisateur.",
            [
                { message: 'Sessions récupérées avec succès', data: {}, status: 200 },
                { message: 'Utilisateur non autorisé', data: {}, status: 403 },
                { message: 'Erreur lors de la récupération des sessions', data: {}, status: 500 },
            ],
            null,
            true,
            querySessionsSchema,
            ['Auth']
        ),
        preHandler: [isAuthenticated],
        handler: authController.getMySessions,
    });
}
