import { userController } from '@/controllers/userController';
import { verifyAccess } from '@/middleware';
import { isAuthenticated } from '@/middleware/auth';
import { createSwaggerSchema } from '@/utils/swaggerUtils';

import { getAllUsersSchema, updateUserSchema } from '@shared/dto';
import { Role } from '@shared/enums';
import { FastifyInstance } from 'fastify';

export async function userRoutes(fastify: FastifyInstance) {
    // Récupérer tous les utilisateurs
    fastify.get('/', {
        schema: createSwaggerSchema(
            'Récupère tous les utilisateurs.',
            [
                { message: 'Utilisateurs récupérés avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                {
                    message: 'Erreur lors de la récupération des utilisateurs',
                    data: [],
                    status: 500,
                },
            ],
            null,
            true,
            getAllUsersSchema,
            ['Users']
        ),
        preHandler: [isAuthenticated, verifyAccess(Role.ADMIN)],
        handler: userController.getAllUsers,
    });
    // Récupérer un utilisateur par ID
    fastify.get('/:id', {
        schema: createSwaggerSchema(
            'Récupère un utilisateur par ID.',
            [
                { message: 'Utilisateur récupéré avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Utilisateur non trouvé', data: [], status: 404 },
                {
                    message: "Erreur lors de la récupération de l'utilisateur",
                    data: [],
                    status: 500,
                },
            ],
            null,
            true,
            null,
            ['Users']
        ),
        preHandler: [isAuthenticated, verifyAccess(Role.ADMIN)],
        handler: userController.getUserById,
    });

    // Mettre à jour un utilisateur
    fastify.patch('/:id', {
        schema: createSwaggerSchema(
            'Met à jour un utilisateur.',
            [
                { message: 'Utilisateur mis à jour avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Utilisateur non trouvé', data: [], status: 404 },
                {
                    message: "Erreur lors de la mise à jour de l'utilisateur",
                    data: [],
                    status: 500,
                },
            ],
            updateUserSchema,
            true,
            null,
            ['Users']
        ),
        preHandler: [isAuthenticated, verifyAccess(Role.ADMIN)],
        handler: userController.updateUser,
    });

    // Supprimer un utilisateur
    fastify.delete('/:id', {
        schema: createSwaggerSchema(
            'Supprime un utilisateur.',
            [
                { message: 'Utilisateur supprimé avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Utilisateur non trouvé', data: [], status: 404 },
                {
                    message: "Erreur lors de la suppression de l'utilisateur",
                    data: [],
                    status: 500,
                },
            ],
            null,
            true,
            null,
            ['Users']
        ),
        preHandler: [isAuthenticated, verifyAccess(Role.ADMIN)],
        handler: userController.deleteUser,
    });
}
