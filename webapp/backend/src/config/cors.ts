import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { FastifyInstance } from 'fastify';

dotenv.config();

export async function corsConfig(fastify: FastifyInstance) {
    fastify.register(cors, {
        origin: process.env.ALLOW_CORS_ORIGIN,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        preflightContinue: true,
        optionsSuccessStatus: 204,
    });
}
