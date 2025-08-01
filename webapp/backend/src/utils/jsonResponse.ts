import { ApiResponse, PaginationMeta } from '@/types/apiTypes';

import { FastifyReply } from 'fastify';

export interface FastifyReplyTest extends FastifyReply {
    custom: {
        env: string;
    };
}

/**
 * Respond to the request with a message, data and a status. This is used to send a response to the client.
 * @param reply - The Fastify response
 * @param message - The message to send
 * @param data - The data to send
 * @param status - The status to send
 * @param pagination - The pagination information (optional)
 * @returns The API response or void in production
 */
export function jsonResponse<T>(
    reply: FastifyReply | FastifyReplyTest,
    message: string,
    data: T,
    status: number,
    pagination?: PaginationMeta
): ApiResponse<T> | FastifyReply {
    let finalData = data;

    if (Array.isArray(finalData)) {
        finalData = [...finalData] as T;
    }

    const response: ApiResponse<T> = {
        message,
        data: finalData,
        status,
        timestamp: new Date().toISOString(),
        pagination: pagination ? pagination : undefined,
    };

    if (process.env.NODE_ENV === 'test' && reply.constructor.name === 'FastifyReplyTest') {
        return response;
    }

    const jsonString = JSON.stringify(response);
    return reply.status(status).type('application/json').send(jsonString);
}
/**
 * Respond to the request with a message, accessToken and refreshToken
 * @param reply - The Fastify response
 * @param message - The message to send
 * @param accessToken - The access token to send
 * @param refreshToken - The refresh token to send
 */
export function authResponse(
    reply: FastifyReply | FastifyReplyTest,
    accessToken: string,
    refreshToken: string
): ApiResponse<undefined> | FastifyReply {
    return reply.status(200).type('application/json').send({
        accessToken,
        refreshToken,
    });
}

/**
 * Respond to the request with a 400 status and a message. This is used when the request fails.
 * @param reply - The Fastify response
 * @param message - The message to send
 * @returns The response schema
 */
export function badRequestResponse(
    reply: FastifyReply | FastifyReplyTest,
    message: string = 'Bad request.',
    error?: any
): ApiResponse<undefined> | FastifyReply {
    return reply.status(400).type('application/json').send({
        status: 400,
        timestamp: new Date().toISOString(),
        url: reply.url,
        message,
        error,
    });
}

/**
 * Respond to the request with a 404 status and a message. This is used when the resource is not found.
 * @param reply - The Fastify response
 * @param message - The message to send
 * @returns The response schema
 */
export function notFoundResponse(
    reply: FastifyReply | FastifyReplyTest,
    message: string = 'Not found.',
    error?: any
): ApiResponse<undefined> | FastifyReply {
    return reply.status(404).type('application/json').send({
        status: 404,
        timestamp: new Date().toISOString(),
        url: reply.url,
        message,
        error,
    });
}

/**
 * Respond to the request with a 401 status and a message. This is used when the user is not authenticated.
 * @param reply - The Fastify response
 * @param message - The message to send
 * @returns The response schema
 */
export function unauthorizedResponse(
    reply: FastifyReply | FastifyReplyTest,
    message: string = 'Unauthorized.',
    error?: any
): ApiResponse<undefined> | FastifyReply {
    return reply.status(401).type('application/json').send({
        status: 401,
        timestamp: new Date().toISOString(),
        url: reply.url,
        message,
        error,
    });
}

/**
 * Respond to the request with a 403 status and a message. This is used when the user is forbidden to access the resource.
 * @param reply - The Fastify response
 * @param message - The message to send
 * @returns The response schema
 */
export function forbiddenResponse(
    reply: FastifyReply | FastifyReplyTest,
    message: string = 'Forbidden.',
    error?: any
): ApiResponse<undefined> | FastifyReply {
    return reply.status(403).type('application/json').send({
        status: 403,
        timestamp: new Date().toISOString(),
        url: reply.url,
        message,
        error,
    });
}

/**
 * Respond to the request with a 500 status and a message. This is used when the server encounters an error.
 * @param reply - The Fastify response
 * @param message - The message to send
 * @returns The response schema
 */
export function internalServerError(
    reply: FastifyReply | FastifyReplyTest,
    message: string = 'Internal server error.',
    error?: any
): ApiResponse<undefined> | FastifyReply {
    return reply.status(500).type('application/json').send({
        status: 500,
        timestamp: new Date().toISOString(),
        url: reply.url,
        message,
        error,
    });
}

/**
 * Generate the response schema for the API
 * @param message - The message to send
 * @param data - The data to send
 * @param status - The status to send
 * @returns The response schema
 */
export const responseSchema = (
    message: string,
    data: any,
    status: number,
    pagination?: PaginationMeta
) => {
    return {
        type: 'object',
        properties: {
            message: { type: 'string', example: message },
            data: { type: 'object', example: data },
            timestamp: { type: 'string', example: new Date().toISOString() },
            status: { type: 'number', example: status },
            pagination: pagination ? pagination : undefined,
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
        },
    };
};

export type responseSchemaType = {
    message: string;
    data: any;
    status: number;
    pagination?: PaginationMeta;
    timestamp?: string;
    accessToken?: string;
    refreshToken?: string;
};
