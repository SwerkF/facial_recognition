import { PrismaClient, User } from '@/config/client';
import { FastifyRequest, RouteGenericInterface } from 'fastify';

// Basic
export interface Basic {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthenticatedRequest<T extends RouteGenericInterface = RouteGenericInterface>
    extends FastifyRequest<T> {
    user: User;
}

/**
 * Interface pour une réponse API standardisée
 */
export interface ApiResponse<T = any> {
    message: string;
    data: T;
    pagination?: PaginationMeta;
    status: number;
    timestamp: string;
    error?: string;
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    nextPage: number;
    previousPage: number;
    perPage: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

export interface Basic {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ErrorResponse {
    message: string;
    stack?: string;
    code?: string;
}

export type Transaction = Omit<
    PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
