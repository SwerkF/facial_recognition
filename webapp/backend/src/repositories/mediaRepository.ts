import { Media, Prisma, PrismaClient } from '@/config/client';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

class MediaRepository {
    private logger = logger.child({
        class: '[App][MediaRepository]',
    });

    /**
     * Créer un nouveau média
     * @param data - Données du média à créer
     * @returns Promise<Media>
     */
    async create(data: Prisma.MediaCreateInput): Promise<Media> {
        return prisma.media.create({
            data
        });
    }

    /**
     * Récupérer un média par ID
     * @param id - ID du média
     * @returns Promise<Media | null>
     */
    async findById(id: string): Promise<Media | null> {
        return prisma.media.findUnique({
            where: { id }
        });
    }

    /**
     * Récupérer tous les médias
     * @returns Promise<Media[]>
     */
    async findAll(): Promise<Media[]> {
        return prisma.media.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Mettre à jour un média
     * @param id - ID du média
     * @param data - Données partielles de mise à jour
     * @returns Promise<Media>
     */
    async update(id: string, data: Prisma.MediaUpdateInput): Promise<Media> {
        return prisma.media.update({
            where: { id },
            data
        });
    }

    /**
     * Supprimer un média
     * @param id - ID du média
     * @returns Promise<void>
     */
    async delete(id: string): Promise<void> {
        await prisma.media.delete({
            where: { id }
        });
    }

}

export const mediaRepository = new MediaRepository();
