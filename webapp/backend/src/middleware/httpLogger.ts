import { logger } from '@/utils/logger';

import { FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
    interface FastifyRequest {
        startTime: number;
    }
    interface FastifyReply {
        url: string;
    }
}

/**
 * Middleware to log HTTP requests
 */
export function httpLoggerMiddleware(
    request: FastifyRequest,
    reply: FastifyReply,
    done: () => void
) {
    reply.url = request.url;

    request.startTime = Date.now();
    const requestId = request.id || crypto.randomUUID();
    request.log = logger.child({ requestId });

    // Log the incoming request synchronously
    process.nextTick(() => {
        logger.info({
            msg: `🟩 ${formatDate(new Date())} | 0ms | Incoming request | ${request.method} ${request.url}`,
            method: request.method,
            url: request.url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
        });
    });

    // Hook to log the response
    reply.raw.on('finish', () => {
        const responseTime = Date.now() - request.startTime;
        logger.info({
            msg: `🟩 ${formatDate(new Date())} | ${responseTime}ms | Request finished | ${request.method} ${request.url}`,
            method: request.method,
            url: request.url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            statusCode: reply.statusCode,
            responseTime: `${responseTime}ms`,
        });
    });

    done();
}

function formatDate(date: Date) {
    return date.toLocaleString('fr-FR', {
        timeZone: 'Europe/Paris',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}
