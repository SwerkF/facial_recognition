import { logger } from '@/utils/logger';
import { Prisma, PrismaClient, FaceVerification } from '@/config/client';
import { FaceVerificationQueryDto } from '@shared/dto/faceVerificationDto';
import { PaginationMeta } from '@/types/apiTypes';
import { FaceVerificationWithRelations } from '@/types';

const prisma = new PrismaClient();

export const faceVerificationInclude = {
    uploadedImage: true,
};

class FaceVerificationRepository {
    private logger = logger.child({
        class: '[App][FaceVerificationRepository]',
    });

    async create(data: Prisma.FaceVerificationCreateInput): Promise<FaceVerificationWithRelations> {
        return prisma.faceVerification.create({
            data,
            include: faceVerificationInclude,
        });
    }

    async getById(id: number): Promise<FaceVerificationWithRelations | null> {
        return prisma.faceVerification.findUnique({
            where: { id },
            include: faceVerificationInclude,
        });
    }

    async findAll(query: FaceVerificationQueryDto, skip: number = 0, take: number = 10): Promise<{
        data: FaceVerificationWithRelations[];
        pagination: PaginationMeta;
    }> {
        const { imageType } = query;
        const where: Prisma.FaceVerificationWhereInput = {};
        if (imageType) {
            where.imageType = imageType;
        }

        const [data, total] = await Promise.all([
            prisma.faceVerification.findMany({
                where,
                include: faceVerificationInclude,
            }),
            prisma.faceVerification.count({ where }),
        ]);

        const currentPage = Math.floor(skip / take) + 1;
        const totalPages = Math.ceil(total / take);

        return {
            data,
            pagination: {
                currentPage,
                totalPages,
                totalItems: total,
                nextPage: currentPage < totalPages ? currentPage + 1 : 0,
                previousPage: currentPage > 1 ? currentPage - 1 : 0,
                perPage: take,
            },
        };
    }

}

export const faceVerificationRepository = new FaceVerificationRepository();
