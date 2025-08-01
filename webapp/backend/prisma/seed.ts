import bcrypt from 'bcryptjs';

import { PrismaClient } from '../src/config/client';
import { fakerUser, users } from '../src/fixtures';

const prisma = new PrismaClient();

/**
 * Nettoie la base de données en supprimant tous les tokens et utilisateurs
 * @async
 * @function cleanDatabase
 * @returns {Promise<void>}
 */
async function cleanDatabase() {
    await prisma.token.deleteMany();
    await prisma.user.deleteMany();
}

/**
 * Fonction principale pour peupler la base de données
 * @async
 * @function main
 * @returns {Promise<void>}
 */
async function main() {
    await cleanDatabase();

    // Création des utilisateurs fixes en batch
    const fixedUsersPromises = users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return prisma.user.create({
            data: {
                ...user,
                password: hashedPassword,
            },
        });
    });

    // Création des utilisateurs aléatoires en batch
    const randomUsersPromises = Array.from({ length: 10 }).map(async () => {
        const user = fakerUser();
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return prisma.user.create({
            data: {
                ...user,
                password: hashedPassword,
            },
        });
    });

    await Promise.all([...fixedUsersPromises, ...randomUsersPromises]);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
