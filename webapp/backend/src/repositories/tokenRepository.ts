import { logger } from '@/utils/logger';
import { Prisma, PrismaClient, Token } from '@/config/client';

const prisma = new PrismaClient();

export const tokenInclude = Prisma.validator<Prisma.TokenInclude>()({
    owner: {
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
        },
    },
});



class TokenRepository {
    private logger = logger.child({
        class: '[App][TokenRepository]',
    });


    /**
     * Trouve un token par son token
     * @param token - Le token à trouver
     * @returns Le token trouvé ou null si aucun token n'est trouvé
     */
    async findByToken(token: string): Promise<Token | null> {
        return prisma.token.findFirst({
            where: { token },
        });
    }

    /**
     * Supprime un token par son id
     * @param userId - L'id de l'utilisateur
     * @param type - Le type de token à supprimer
     * @returns Le nombre de tokens supprimés
     */
    async deleteByUserAndType(userId: string, type: string): Promise<{ count: number }> {
        return prisma.token.deleteMany({
            where: { 
                ownedById: userId, 
                type 
            }
        });
    }

    /**
     * Récupère tous les tokens d'un utilisateur
     * @param userId - L'id de l'utilisateur à récupérer
     * @returns Les tokens de l'utilisateur
     */
    async findAllByUserId(userId: string): Promise<Token[]> {
        return prisma.token.findMany({
            where: {
                ownedById: userId
            }
        });
    }

    /**
     * Récupère les tokens les plus récents pour chaque Browser
     * @param userId - L'id de l'utilisateur
     * @returns Les tokens les plus récents par navigateur
     */
    async findAllByUserIdAndBrowser(userId: string): Promise<Token[]> {
        return prisma.token.findMany({
            where: {
                ownedById: userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            distinct: ['browserName']
        });
    }

    /**
     * Crée un nouveau token
     * @param data - Les données du token à créer
     * @returns Le token créé
     */
    async create(data: Prisma.TokenCreateInput): Promise<Token> {
        return prisma.token.create({
            data
        });
    }


    async update(id: string, data: Prisma.TokenUpdateInput): Promise<Token> {
        return prisma.token.update({
            where: { id },
            data
        });
    }

    /**
     * Supprime un token par son id
     * @param id - L'id du token à supprimer
     * @returns Le token supprimé ou null si aucun token n'est trouvé
     */
    async delete(id: string): Promise<Token | null> {
        return prisma.token.delete({
            where: { id }
        });
    }
}

export const tokenRepository = new TokenRepository();
