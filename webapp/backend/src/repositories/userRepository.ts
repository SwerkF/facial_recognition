import { Prisma, User } from '@/config/client';
import prisma from '@/config/prisma';
import { FilterService } from '@/services';
import { PaginationMeta } from '@/types';
import { logger } from '@/utils/logger';

import { UpdateUserDto } from '@shared/dto';
import { Role } from '@shared/enums';

interface UserFilters {
    search?: string;
    sort?: string;
    [key: string]: unknown;
}

class UserRepository {
    private logger = logger.child({
        class: '[App][UserRepository]',
    });

    /**
     * Create a new user
     * @param user - The user to create
     * @returns The created user
     */
    async create(user: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data: {
                ...user,
                roles: [Role.USER],
            },
        });
    }

    /**
     * Update a user
     * @param id - The id of the user to update
     * @param user - The user to update
     * @returns The updated user
     */
    async update(id: string, user: UpdateUserDto & { lastLoginAt?: Date }): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: user,
        });
    }

    /**
     * Update user password
     * @param id - The id of the user
     * @param password - The new password
     * @returns The updated user
     */
    async updatePassword(id: string, password: string): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: { password },
        });
    }

    /**
     * Delete a user
     * @param id - The id of the user to delete
     * @returns The deleted user
     */
    async delete(id: string): Promise<User> {
        return prisma.user.delete({
            where: { id },
        });
    }

    /**
     * Find all users with pagination
     * @param filters - The filters to apply (search, sort, etc)
     * @param skip - The number of users to skip
     * @param take - The number of users to take
     * @returns Object containing users data and pagination metadata
     */
    async findAll(
        filters: UserFilters = {},
        skip: number = 0,
        take: number = 10
    ): Promise<{
        data: User[];
        pagination: PaginationMeta;
    }> {
        const { search, ...otherFilters } = filters;

        const where: Prisma.UserWhereInput = {
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const baseQuery = FilterService.buildQuery(otherFilters);
        Object.assign(where, baseQuery);

        // Apply the sorting
        let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'desc' };
        if (filters.sort) {
            const [field, order] = filters.sort.split(':');
            const trimmedField = field.trim();
            const trimmedOrder = (order || 'asc').trim();
            orderBy = { [trimmedField]: trimmedOrder };
        }

        // Execute the queries
        const [data, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take,
                orderBy,
            }),
            prisma.user.count({ where }),
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

    /**
     * Find a user by its email
     * @param email - The email of the user
     * @returns The user found or null if no user is found
     */
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: {
                email,
            },
        });
    }

    /**
     * Find a user by its id
     * @param id - The id of the user to find
     * @returns The user found or null if no user is found
     */
    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    }
}

export const userRepository = new UserRepository();
