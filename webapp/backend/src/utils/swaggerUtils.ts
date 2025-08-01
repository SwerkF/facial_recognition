import swagger from '@fastify/swagger';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { responseSchemaType } from './jsonResponse';

/**
 * Initialize the swagger
 * @param app - The Fastify application instance
 */
export function initSwagger(app: FastifyInstance) {
    app.register(swagger, {
        mode: 'dynamic',
        openapi: {
            info: { title: 'Fastify API', version: '1.0.0' },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
            security: [
                {
                    bearerAuth: [],
                },
            ],
            tags: [
                { name: 'Auth', description: 'Authentication routes' },
                { name: 'Users', description: 'User routes' },
                { name: 'Posts', description: 'Post routes' },
                { name: 'Tokens', description: 'Token routes' },
            ],
        },
    });

    // Route to access the Swagger documentation
    if (process.env.NODE_ENV !== 'production') {
        app.register(require('@fastify/swagger-ui'), {
            routePrefix: '/api',
            uiConfig: {
                docExpansion: 'list',
                deepLinking: false,
                persistAuthorization: true,
                tagsSorter: 'alpha',
                operationsSorter: 'alpha',
                defaultModelsExpandDepth: 1,
                defaultModelExpandDepth: 2,
            },
            uiHooks: {
                onRequest(request: FastifyRequest, reply: FastifyReply, next: any) {
                    next();
                },
                preHandler(request: FastifyRequest, reply: FastifyReply, next: any) {
                    next();
                },
            },
            staticCSP: true,
            transformStaticCSP: (header: string) => header,
            transformSpecification: (
                swaggerObject: any,
                request: FastifyRequest,
                reply: FastifyReply
            ) => {
                return swaggerObject;
            },
            transformSpecificationClone: true,
        });
    }
}

/**
 * Create a swagger schema for a route
 * @param description - The description of the route
 * @param responses - The responses of the route
 * @param bodySchema - The zod schema of the request body
 * @param security - If the route is secured
 * @param querySchema - The zod schema of the request query
 * @param tags - The tags of the route for grouping
 * @returns Le schéma de swagger
 */
export function createSwaggerSchema(
    description: string,
    responses: responseSchemaType[],
    bodySchema?: z.ZodObject<any, any> | null,
    security?: boolean,
    querySchema?: z.ZodObject<any, any> | null,
    tags?: string[]
) {
    const schema: any = {
        description,
        response: responses.reduce(
            (acc, response) => {
                const baseSchema: {
                    type: string;
                    properties: {
                        message: { type: string };
                        status: { type: string };
                        data?: any;
                        pagination?: any;
                        accessToken?: any;
                        refreshToken?: any;
                        timestamp?: any;
                        url?: any;
                    };
                } = {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        status: { type: 'integer' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                        timestamp: { type: 'string' },
                        url: { type: 'string' },
                    },
                };

                if (response.data && response.data instanceof z.ZodObject) {
                    baseSchema.properties.data = generateSchemaProperties(response.data);
                } else if (response.data !== undefined) {
                    baseSchema.properties.data = {
                        type: 'object',
                        additionalProperties: true,
                    };
                }

                if (response.pagination !== undefined) {
                    baseSchema.properties.pagination = {
                        type: 'object',
                        properties: {
                            currentPage: { type: 'number' },
                            totalPages: { type: 'number' },
                            totalItems: { type: 'number' },
                            nextPage: { type: 'number' },
                            previousPage: { type: 'number' },
                            perPage: { type: 'number' },
                        },
                    };
                }

                acc[response.status] = {
                    description: response.message,
                    content: {
                        'application/json': {
                            schema: baseSchema,
                        },
                    },
                };
                return acc;
            },
            {} as Record<string, any>
        ),
    };

    if (security) {
        schema.security = [{ bearerAuth: [] }];
    }

    if (bodySchema) {
        schema.body = generateSchemaProperties(bodySchema);
    }

    if (querySchema) {
        schema.querystring = generateSchemaProperties(querySchema);
    }

    if (tags && tags.length > 0) {
        schema.tags = tags;
    }

    return schema;
}

/**
 * Generate the properties of the swagger schema
 * @param schema - The zod schema to convert
 * @returns The properties of the swagger schema
 */
export const generateSchemaProperties = (schema: z.ZodObject<any, any>) => {
    const { shape } = schema;
    const properties: {
        [key: string]: {
            type: string;
            format?: string;
            enum?: string[];
            description?: string;
            items?: {
                type: string;
                properties?: any;
                required?: string[];
            };
        };
    } = {};
    const required: string[] = [];

    for (const key in shape) {
        const zodType = shape[key];
        let isRequired = true;
        let description = '';

        // Extract the real type, handling optionals
        const realType = zodType instanceof z.ZodOptional ? zodType._def.innerType : zodType;

        // Check if the field is optional
        if (zodType instanceof z.ZodOptional) {
            isRequired = false;
            description = '(Optional) ';
        } else {
            required.push(key);
        }

        // Add the description if it exists
        if (realType._def.description) {
            description += realType._def.description;
        }

        if (realType instanceof z.ZodString) {
            properties[key] = {
                type: 'string',
                description: description || undefined,
            };
        } else if (realType instanceof z.ZodNumber) {
            properties[key] = {
                type: 'number',
                description: description || undefined,
            };
        } else if (realType instanceof z.ZodBoolean) {
            properties[key] = {
                type: 'boolean',
                description: description || undefined,
            };
        } else if (realType instanceof z.ZodDate) {
            properties[key] = {
                type: 'string',
                format: 'date-time',
                description: description || undefined,
            };
        } else if (realType instanceof z.ZodEnum) {
            properties[key] = {
                type: 'string',
                enum: realType.options,
                description: description || undefined,
            };
        } else if (realType instanceof z.ZodArray) {
            // Improvement of the treatment of arrays
            const arrayType = realType._def.type;

            properties[key] = {
                type: 'array',
                description: description || undefined,
                items: { type: 'string' }, // Default value
            };

            // If the element type is an object, generate a schema for its properties
            if (arrayType instanceof z.ZodObject) {
                const nestedSchema = generateSchemaProperties(arrayType);
                properties[key].items = {
                    type: 'object',
                    properties: nestedSchema.properties,
                    required: nestedSchema.required,
                };
            } else if (arrayType instanceof z.ZodString) {
                properties[key].items = { type: 'string' };
            } else if (arrayType instanceof z.ZodNumber) {
                properties[key].items = { type: 'number' };
            } else if (arrayType instanceof z.ZodBoolean) {
                properties[key].items = { type: 'boolean' };
            }
        } else {
            properties[key] = {
                type: 'string',
                description: description || undefined,
            };
        }
    }

    return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
    };
};
