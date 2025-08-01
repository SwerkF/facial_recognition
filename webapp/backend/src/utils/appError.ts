/**
 * Classe de base pour toutes les erreurs de l'application
 */
export abstract class AppError extends Error {
    abstract readonly statusCode: number;
    abstract readonly errorCode: string;
    abstract readonly isOperational: boolean;

    constructor(
        message: string,
        public readonly context?: Record<string, any>
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Convertit l'erreur en objet sérialisable pour les logs/API
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            errorCode: this.errorCode,
            context: this.context,
            stack: this.stack,
        };
    }
}

/**
 * Erreur de validation (400)
 */
export class ValidationError extends AppError {
    readonly statusCode = 400;
    readonly errorCode = 'VALIDATION_ERROR';
    readonly isOperational = true;

    constructor(
        message: string = 'Données invalides',
        public readonly fieldErrors?: Record<string, string[]>,
        context?: Record<string, any>
    ) {
        super(message, context);
    }
}

/**
 * Erreur d'authentification (401)
 */
export class AuthenticationError extends AppError {
    readonly statusCode = 401;
    readonly errorCode = 'AUTHENTICATION_ERROR';
    readonly isOperational = true;

    constructor(message: string = 'Authentification requise', context?: Record<string, any>) {
        super(message, context);
    }
}

/**
 * Erreur d'autorisation (403)
 */
export class AuthorizationError extends AppError {
    readonly statusCode = 403;
    readonly errorCode = 'AUTHORIZATION_ERROR';
    readonly isOperational = true;

    constructor(message: string = 'Accès non autorisé', context?: Record<string, any>) {
        super(message, context);
    }
}

/**
 * Erreur de ressource non trouvée (404)
 */
export class NotFoundError extends AppError {
    readonly statusCode = 404;
    readonly errorCode = 'NOT_FOUND_ERROR';
    readonly isOperational = true;

    constructor(message: string = 'Ressource non trouvée', context?: Record<string, any>) {
        super(message, context);
    }
}

/**
 * Erreur de conflit (409)
 */
export class ConflictError extends AppError {
    readonly statusCode = 409;
    readonly errorCode = 'CONFLICT_ERROR';
    readonly isOperational = true;

    constructor(message: string = 'Conflit de données', context?: Record<string, any>) {
        super(message, context);
    }
}

/**
 * Erreur de limite de débit (429)
 */
export class RateLimitError extends AppError {
    readonly statusCode = 429;
    readonly errorCode = 'RATE_LIMIT_ERROR';
    readonly isOperational = true;

    constructor(
        message: string = 'Trop de requêtes',
        public readonly retryAfter?: number,
        context?: Record<string, any>
    ) {
        super(message, context);
    }
}

/**
 * Erreur serveur interne (500)
 */
export class InternalServerError extends AppError {
    readonly statusCode = 500;
    readonly errorCode = 'INTERNAL_SERVER_ERROR';
    readonly isOperational = false; // Erreur non-opérationnelle

    constructor(message: string = 'Erreur serveur interne', context?: Record<string, any>) {
        super(message, context);
    }
}

/**
 * Erreur de service externe (502/503)
 */
export class ExternalServiceError extends AppError {
    readonly statusCode = 502;
    readonly errorCode = 'EXTERNAL_SERVICE_ERROR';
    readonly isOperational = true;

    constructor(
        message: string = 'Service externe indisponible',
        public readonly serviceName?: string,
        context?: Record<string, any>
    ) {
        super(message, context);
    }
}
