import startCronJobs from '@/commands';
import { configureRateLimiter, errorHandlerMiddleware, httpLoggerMiddleware } from '@/middleware';
import { multipartPlugin } from '@/plugins/multipart';
import { authRoutes, userRoutes } from '@/routes';
import { faceVerificationRoutes } from '@/routes/faceVerificationRoutes';
import { minioService } from '@/services';
import { appLogger } from '@/utils/logger';
import { initSwagger } from '@/utils/swaggerUtils';

import cors from '@fastify/cors';
import dotenv from 'dotenv';
import Fastify, { FastifyInstance } from 'fastify';
import metricsPlugin from 'fastify-metrics';

// Loading environment variables
dotenv.config();
const buildApp = async () => {
    // Creating the Fastify instance
    const app: FastifyInstance = Fastify({
        logger: false,
    });

    // Registering the metrics plugin
    await app.register(metricsPlugin, { endpoint: '/metrics' });

    // Registering the plugins
    app.register(cors, {
        origin: true,
    });

    // Registering the request and response logging middleware
    app.addHook('preHandler', httpLoggerMiddleware);

    // Registering the multipart plugin
    multipartPlugin(app, {});

    // Configuring the rate limiter
    configureRateLimiter(app);

    // Error handler
    errorHandlerMiddleware(app);

    // Swagger
    initSwagger(app);

    // Registering the routes
    app.register(userRoutes, { prefix: '/api/users' });
    app.register(authRoutes, { prefix: '/api/auth' });
    app.register(faceVerificationRoutes, { prefix: '/api/face-verifications' });

    // Base route
    app.get('/', async (_request, _reply) => {
        return { message: 'Welcome to the Fastify API with Prisma and MySQL.' };
    });

    await minioService.initializeMinio();

    return app;
};

// Ensuring that the plugins are registered before starting the server
const start = async () => {
    const app = await buildApp();

    try {
        // Start the server
        const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
        await app.listen({ port, host: '0.0.0.0' });
        appLogger.info(`Server started on port ${port}`);
        startCronJobs();
    } catch (err) {
        appLogger.error(err);
    }
};

start();

export default buildApp;
