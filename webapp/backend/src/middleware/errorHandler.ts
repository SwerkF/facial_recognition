import { AppError, ValidationError } from '@/utils/appError';
import { jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

/**
 * Error handler amélioré pour Fastify
 * @param app - Fastify instance
 */
export async function errorHandlerMiddleware(app: FastifyInstance): Promise<void> {
    app.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
        // Enrichir le contexte de l'erreur
        const errorContext = {
            method: request.method,
            url: request.url,
            userAgent: request.headers['user-agent'],
            ip: request.ip,
            correlationId: request.headers['x-correlation-id'] || crypto.randomUUID(),
        };

        // Gestion des erreurs personnalisées de l'application
        if (error instanceof AppError) {
            logger.error('Application Error', {
                ...error.toJSON(),
                context: { ...error.context, ...errorContext },
            });

            // Gestion spéciale pour les erreurs de validation
            if (error instanceof ValidationError && error.fieldErrors) {
                return jsonResponse(reply, error.message, error.fieldErrors, error.statusCode);
            }

            return jsonResponse(reply, error.message, {}, error.statusCode);
        }

        // Gestion des erreurs Zod (validation)
        if (error instanceof ZodError) {
            const validationError = new ValidationError(
                'Données de requête invalides',
                Object.fromEntries(
                    Object.entries(error.flatten().fieldErrors).filter(
                        ([_, value]) => value !== undefined
                    )
                ) as Record<string, string[]>
            );

            logger.error('Validation Error (Zod)', {
                ...validationError.toJSON(),
                context: errorContext,
            });

            return jsonResponse(
                reply,
                validationError.message,
                validationError.fieldErrors || {},
                400
            );
        }

        // Gestion des erreurs de syntaxe JSON
        if (error instanceof SyntaxError) {
            logger.error('Syntax Error', {
                error: error.message,
                context: errorContext,
            });

            return jsonResponse(reply, 'Format JSON invalide', {}, 400);
        }

        // Erreurs Fastify spécifiques
        if ('statusCode' in error && error.statusCode) {
            logger.error('Fastify Error', {
                statusCode: error.statusCode,
                message: error.message,
                context: errorContext,
            });

            return jsonResponse(reply, error.message, {}, error.statusCode as number);
        }

        // Erreurs non gérées (500)
        logger.error('Unhandled Error', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            context: errorContext,
        });

        // En production, ne pas exposer les détails des erreurs internes
        const message =
            process.env.NODE_ENV === 'production'
                ? "Une erreur interne s'est produite"
                : error.message;

        return jsonResponse(reply, message, {}, 500);
    });
}
