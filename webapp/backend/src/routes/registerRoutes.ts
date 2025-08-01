import { FastifyInstance } from 'fastify';
import { faceVerificationRoutes } from './faceVerificationRoutes';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
    app.register(authRoutes, { prefix: '/api/auth' });
    app.register(userRoutes, { prefix: '/api/users' });
    app.register(faceVerificationRoutes, { prefix: '/api/face-verifications' });
}
