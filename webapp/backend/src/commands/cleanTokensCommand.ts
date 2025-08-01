import prisma from '@/config/prisma';
import { logger } from '@/utils/logger';

export const main = async () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    await prisma.token.deleteMany({
        where: {
            expiresAt: {
                lt: threeMonthsAgo,
            },
        },
    });

    logger.info('Tokens cleaned successfully');
};
