import { logger } from '@/utils/logger';

import Redis from 'ioredis';

/**
 * Interface for the Redis cache service
 */
interface ICacheService {
    set(key: string, value: unknown, ttlSeconds?: number): Promise<string>;
    get(key: string): Promise<unknown | null>;
    del(key: string): Promise<number>;
    exists(key: string): Promise<number>;
    setWithExpiry(key: string, value: string, ttlSeconds: number): Promise<string>;
    flushAll(): Promise<void>;
    size(): Promise<number>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    ping(): Promise<string>;
    expire(key: string, ttlSeconds: number): Promise<number>;
    ttl(key: string): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    incr(key: string, increment?: number): Promise<number>;
    decr(key: string, decrement?: number): Promise<number>;
}

/**
 * Redis cache service
 * Only one cache implementation supported
 */
class RedisService implements ICacheService {
    private client: Redis;
    private logger = logger.child({
        module: '[Nexelis][Redis]',
    });

    constructor() {
        if (!process.env.REDIS_HOST) {
            throw new Error('REDIS_HOST environment variable is required');
        }

        this.client = new Redis({
            host: process.env.REDIS_HOST,
            password: process.env.REDIS_PASSWORD,
            port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
            db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
            enableReadyCheck: false,
            maxRetriesPerRequest: null,
            lazyConnect: true,
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.client.on('connect', () => {
            this.logger.info('Redis connection established');
        });

        this.client.on('ready', () => {
            this.logger.info('Redis is ready to receive commands');
        });

        this.client.on('error', (error: Error) => {
            this.logger.error('Redis error:', error);
        });

        this.client.on('close', () => {
            this.logger.warn('Redis connection closed');
        });

        this.client.on('reconnecting', () => {
            this.logger.info('Reconnecting to Redis...');
        });
    }

    /**
     * Stocke une valeur dans Redis
     * @param key - The key to store the value
     * @param value - The value to store
     * @param ttlSeconds - The expiration time in seconds (optional)
     * @returns 'OK' if the command was successful
     */
    async set(key: string, value: unknown, ttlSeconds?: number): Promise<string> {
        try {
            const serializedValue = JSON.stringify(value);

            if (ttlSeconds) {
                await this.client.setex(key, ttlSeconds, serializedValue);
            } else {
                await this.client.set(key, serializedValue);
            }

            this.logger.debug(`Value stored for the key: ${key}`);
            return 'OK';
        } catch (error) {
            this.logger.error(`Error while storing the key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Get a value from Redis
     * @param key - The key to get the value
     * @returns The deserialized value or null if the key does not exist
     */
    async get(key: string): Promise<unknown | null> {
        try {
            const value = await this.client.get(key);

            if (value === null) {
                return null;
            }

            return JSON.parse(value);
        } catch (error) {
            this.logger.error(`Error while getting the key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Delete a key from Redis
     * @param key - The key to delete
     * @returns The number of keys deleted (0 or 1)
     */
    async del(key: string): Promise<number> {
        try {
            const result = await this.client.del(key);
            this.logger.debug(`Key deleted: ${key}`);
            return result;
        } catch (error) {
            this.logger.error(`Error while deleting the key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Check if a key exists in Redis
     * @param key - The key to check
     * @returns 1 if the key exists, 0 if it does not
     */
    async exists(key: string): Promise<number> {
        try {
            return await this.client.exists(key);
        } catch (error) {
            this.logger.error(`Error while checking if the key ${key} exists:`, error);
            throw error;
        }
    }

    /**
     * Set a value with expiration (for Redis compatibility)
     * @param key - The key
     * @param value - The value
     * @param ttlSeconds - The expiration time in seconds
     * @returns 'OK' if the command was successful
     */
    async setWithExpiry(key: string, value: string, ttlSeconds: number): Promise<string> {
        return this.set(key, value, ttlSeconds);
    }

    /**
     * Set the TTL of a key
     * @param key - The key
     * @param ttlSeconds - The expiration time in seconds
     * @returns The number of seconds until the key expires
     */
    async expire(key: string, ttlSeconds: number): Promise<number> {
        try {
            return await this.client.expire(key, ttlSeconds);
        } catch (error) {
            this.logger.error(`Error while setting the TTL for the key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Get the TTL of a key
     * @param key - The key
     * @returns The TTL in seconds, -1 if there is no expiration, -2 if the key does not exist
     */
    async ttl(key: string): Promise<number> {
        try {
            return await this.client.ttl(key);
        } catch (error) {
            this.logger.error(`Error while getting the TTL for the key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Flush all data from Redis
     */
    async flushAll(): Promise<void> {
        try {
            await this.client.flushall();
            this.logger.info('Redis cache flushed');
        } catch (error) {
            this.logger.error('Error while flushing the Redis cache:', error);
            throw error;
        }
    }

    /**
     * Get the number of keys in Redis
     * @returns The number of keys
     */
    async size(): Promise<number> {
        try {
            return await this.client.dbsize();
        } catch (error) {
            this.logger.error('Error while getting the size of the cache:', error);
            throw error;
        }
    }

    /**
     * Get all keys matching a pattern
     * @param pattern - The pattern to search for (ex: "user:*")
     * @returns An array of keys
     */
    async keys(pattern: string): Promise<string[]> {
        try {
            return await this.client.keys(pattern);
        } catch (error) {
            this.logger.error(`Error while searching for keys with the pattern ${pattern}:`, error);
            throw error;
        }
    }

    /**
     * Increment a numeric value
     * @param key - The key
     * @param increment - The increment value (default: 1)
     * @returns The new value after incrementation
     */
    async incr(key: string, increment: number = 1): Promise<number> {
        try {
            if (increment === 1) {
                return await this.client.incr(key);
            }
            return await this.client.incrby(key, increment);
        } catch (error) {
            this.logger.error(`Error while incrementing the key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Decrement a numeric value
     * @param key - The key
     * @param decrement - The decrement value (default: 1)
     * @returns The new value after decrementation
     */
    async decr(key: string, decrement: number = 1): Promise<number> {
        try {
            if (decrement === 1) {
                return await this.client.decr(key);
            }
            return await this.client.decrby(key, decrement);
        } catch (error) {
            this.logger.error(`Error while decrementing the key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Close the Redis connection
     */
    async disconnect(): Promise<void> {
        try {
            await this.client.quit();
            this.logger.info('Redis connection closed properly');
        } catch (error) {
            this.logger.error('Error while closing the Redis connection:', error);
            throw error;
        }
    }

    /**
     * Check the state of the Redis connection
     * @returns true if connected, false otherwise
     */
    isConnected(): boolean {
        return this.client.status === 'ready';
    }

    /**
     * Ping Redis to check the connectivity
     * @returns 'PONG' if the connection is active
     */
    async ping(): Promise<string> {
        try {
            return await this.client.ping();
        } catch (error) {
            this.logger.error('Error while pinging Redis:', error);
            throw error;
        }
    }
}

/**
 * Create the Redis service
 * Throws an error if Redis is not available
 */
function createRedisService(): ICacheService {
    logger.info('🚀 Redis service initialization.');

    try {
        return new RedisService();
    } catch (error) {
        logger.error('❌ Impossible to initialize Redis:', error);
        throw new Error(`Redis service required but not available: ${error}`);
    }
}

export const cacheService = createRedisService();
