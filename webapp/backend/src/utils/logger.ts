import pino from 'pino';
import pinoLoki from 'pino-loki';

/**
 * Transport for logs
 */
const createTransports = () => {
    // Loki transport always configured to send logs
    const lokiTransport = pinoLoki({
        batching: false,
        labels: {
            app: process.env.APP_NAME || 'app',
            namespace: process.env.NODE_ENV || 'development',
            source: process.env.LOG_SOURCE || 'pino',
            runtime: `nodejs/${process.version}`,
        },
        host: process.env.LOKI_HOST || 'http://localhost:3100',
        basicAuth: {
            username: process.env.LOKI_USERNAME || 'admin',
            password: process.env.LOKI_PASSWORD || 'admin',
        },
    });

    return lokiTransport;
};

// Main logger that will send logs to Loki but not to the console
export const logger = pino(createTransports());

// Logger specific for application logs (non HTTP) that will be displayed in the console
export const appLogger = pino({
    transport:
        process.env.NODE_ENV === 'development'
            ? {
                  target: 'pino-pretty',
                  options: {
                      translateTime: 'HH:MM:ss Z',
                      ignore: 'pid,hostname',
                      colorize: true,
                  },
              }
            : undefined,
});
