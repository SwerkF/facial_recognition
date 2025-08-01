import { ApiResponse } from '@/types';
import { jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';

import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

type RequestType<TBody = unknown, TQuery = unknown, TParams = unknown> = {
    Body: TBody;
    Querystring: TQuery;
    Params: TParams;
};

type StrictRequestHandler<TRequest extends RequestType, TResponse = any> = (
    request: FastifyRequest<TRequest>,
    reply: FastifyReply
) => Promise<ApiResponse<TResponse> | void>;

export type BodyHandlerOptions<TBody, TResponse = any> = {
    bodySchema: z.ZodType<TBody>;
    querySchema?: never;
    paramsSchema?: never;
    logger?: any;
    handler: StrictRequestHandler<RequestType<TBody>, TResponse>;
};

export type ParamsHandlerOptions<TParams, TResponse = any> = {
    bodySchema?: never;
    querySchema?: never;
    paramsSchema: z.ZodType<TParams>;
    logger?: any;
    handler: StrictRequestHandler<RequestType<unknown, unknown, TParams>, TResponse>;
};

export type QueryHandlerOptions<TQuery, TResponse = any> = {
    bodySchema?: never;
    querySchema: z.ZodType<TQuery>;
    paramsSchema?: never;
    logger?: any;
    handler: StrictRequestHandler<RequestType<unknown, TQuery>, TResponse>;
};

export type BodyParamsHandlerOptions<TBody, TParams, TResponse = any> = {
    bodySchema: z.ZodType<TBody>;
    querySchema?: never;
    paramsSchema: z.ZodType<TParams>;
    logger?: any;
    handler: StrictRequestHandler<RequestType<TBody, unknown, TParams>, TResponse>;
};

type AsyncHandlerOptions<TBody = unknown, TQuery = unknown, TParams = unknown, TResponse = any> =
    | BodyHandlerOptions<TBody, TResponse>
    | ParamsHandlerOptions<TParams, TResponse>
    | QueryHandlerOptions<TQuery, TResponse>
    | BodyParamsHandlerOptions<TBody, TParams, TResponse>
    | {
          bodySchema?: z.ZodType<TBody>;
          querySchema?: z.ZodType<TQuery>;
          paramsSchema?: z.ZodType<TParams>;
          logger?: any;
          handler: StrictRequestHandler<RequestType<TBody, TQuery, TParams>, TResponse>;
      };

/**
 * DTO for validation errors
 */
export interface ValidationErrorDto {
    field: string;
    message: string;
    code: string;
}

/**
 * Format validation errors
 * @param error - The validation error
 * @returns The validation errors
 */
function formatZodError(error: z.ZodError): ValidationErrorDto[] {
    return Object.entries(error.flatten().fieldErrors).map(([field, errors]) => ({
        field,
        message: errors?.[0] || 'Validation error',
        code: 'VALIDATION_ERROR',
    }));
}

/**
 * Async request handler
 * @param handler - The request handler
 * @returns The request handler
 */
export function asyncHandler<
    TBody = unknown,
    TQuery = unknown,
    TParams = unknown,
    _TResponse = any,
>(
    handler: StrictRequestHandler<RequestType<TBody, TQuery, TParams>>
): StrictRequestHandler<RequestType<TBody, TQuery, TParams>>;

/**
 * Async request handler with full options
 * @param options - The request handler options
 * @returns The request handler
 */
export function asyncHandler<
    TBody = unknown,
    TQuery = unknown,
    TParams = unknown,
    _TResponse = any,
>(
    options: AsyncHandlerOptions<TBody, TQuery, TParams>
): StrictRequestHandler<RequestType<TBody, TQuery, TParams>>;

/**
 * Implementation of the async request handler
 * @param options - The request handler options
 * @returns The request handler
 */
export function asyncHandler<TBody = unknown, TQuery = unknown, TParams = unknown, TResponse = any>(
    options:
        | StrictRequestHandler<RequestType<TBody, TQuery, TParams>, TResponse>
        | AsyncHandlerOptions<TBody, TQuery, TParams, TResponse>
): StrictRequestHandler<RequestType<TBody, TQuery, TParams>, TResponse> {
    return async function (
        request: FastifyRequest<RequestType<TBody, TQuery, TParams>>,
        reply: FastifyReply
    ): Promise<ApiResponse<TResponse> | void> {
        try {
            if (typeof options === 'function') {
                await options(request, reply);
                return;
            }

            // Destructure the options
            const {
                bodySchema,
                querySchema,
                paramsSchema,
                handler,
                logger: customLogger,
            } = options;

            // Use the custom logger if provided, otherwise use the default logger
            const loggerToUse = customLogger || logger;

            // Validation of the body
            if (bodySchema) {
                // Convert the fields of type 'field' to simple values only if the request is multipart
                const processedBody = request.isMultipart()
                    ? Object.fromEntries(
                          Object.entries(request.body as any).map(([key, value]: any) => [
                              key,
                              value?.type === 'field'
                                  ? value.value === 'true'
                                      ? true
                                      : value.value === 'false'
                                        ? false
                                        : value.value
                                  : value,
                          ])
                      )
                    : request.body;

                const body = bodySchema.safeParse(processedBody);
                if (!body.success) {
                    loggerToUse.error(
                        `Validation error in body: ${JSON.stringify(body.error.flatten().fieldErrors)}`
                    );
                    jsonResponse<ValidationErrorDto[]>(
                        reply,
                        'Invalid body data',
                        formatZodError(body.error),
                        400
                    );
                    return;
                }
                request.body = body.data as TBody;
            }

            // Validation of the query
            if (querySchema) {
                const query = querySchema.safeParse(request.query);
                if (!query.success) {
                    loggerToUse.error(
                        `Validation error in query: ${JSON.stringify(query.error.flatten().fieldErrors)}`
                    );
                    jsonResponse<ValidationErrorDto[]>(
                        reply,
                        'Invalid query parameters',
                        formatZodError(query.error),
                        400
                    );
                    return;
                }
                request.query = query.data as TQuery;
            }

            // Validation of the params
            if (paramsSchema) {
                const params = paramsSchema.safeParse(request.params);
                if (!params.success) {
                    loggerToUse.error(
                        `Validation error in params: ${JSON.stringify(params.error.flatten().fieldErrors)}`
                    );
                    jsonResponse<ValidationErrorDto[]>(
                        reply,
                        'Invalid route parameters',
                        formatZodError(params.error),
                        400
                    );
                    return;
                }
                request.params = params.data as TParams;
            }

            await handler(request, reply);
        } catch (error) {
            const loggerToUse = typeof options === 'function' ? logger : options.logger || logger;
            loggerToUse.error(`Error in async handler: ${JSON.stringify(error)}`);

            if (error instanceof z.ZodError) {
                loggerToUse.error(
                    `Validation error in async handler: ${JSON.stringify(error.flatten().fieldErrors)}`
                );
                jsonResponse<ValidationErrorDto[]>(
                    reply,
                    'Validation error',
                    formatZodError(error),
                    400
                );
                return;
            }

            if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
                jsonResponse<unknown>(reply, 'Database error', error, 500);
                return;
            }

            if (error instanceof Error && error.name === 'ZodError') {
                loggerToUse.error(`Validation error in async handler: ${JSON.stringify(error)}`);
                jsonResponse<ValidationErrorDto[]>(
                    reply,
                    'Validation error',
                    formatZodError(error as z.ZodError),
                    400
                );
                return;
            }

            if (error instanceof Error && error.name === 'PrismaClientUnknownRequestError') {
                loggerToUse.error(`Database error in async handler: ${JSON.stringify(error)}`);
                jsonResponse<unknown>(reply, 'Database error', error, 500);
                return;
            }

            if (error instanceof Error && error.name === 'PrismaClientRustPanicError') {
                loggerToUse.error(`Database error in async handler: ${JSON.stringify(error)}`);
                jsonResponse<unknown>(reply, 'Database error', error, 500);
                return;
            }

            loggerToUse.error(`Internal server error in async handler: ${JSON.stringify(error)}`);
            jsonResponse<unknown>(reply, 'Internal server error', error, 500);
        }
    };
}
