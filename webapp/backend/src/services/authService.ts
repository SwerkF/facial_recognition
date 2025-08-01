import { Token, User } from "@/config/client";
import { tokenRepository } from '@/repositories/tokenRepository';
import { jsonResponse } from '@/utils/jsonResponse';
import { getLocationFromIp } from '@/utils/locationFromIp';
import { parseUserAgent } from '@/utils/userAgentParser';
import { FastifyReply, FastifyRequest } from 'fastify';
import { sign, verify } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET!;
const RESET_TOKEN_EXPIRATION_HOURS = 2;

class AuthService {
    constructor() { }

      /**
     * Génère un token d'accès pour un utilisateur
     * @param user - L'utilisateur à générer le token
     * @param type - Le type de token à générer
     * @param request - La requête Fastify
     * @returns Le token d'accès généré
     */
      async generateToken(user: User, type: 'access' | 'refresh', request: FastifyRequest): Promise<Token | null> {
        const rawUserAgent = request.headers['user-agent'] || '';
        const parsedUserAgent = parseUserAgent(rawUserAgent);
        const location = await getLocationFromIp(request.ip);

        const expiresIn = type === 'access' ? '24h' : '7d';
        const tokenPayload = sign(user, process.env.JWT_SECRET as string, {
            expiresIn,
        });

        if (!user.id) {
            return null;
        }

        const token = await tokenRepository.create({
            deviceName: parsedUserAgent.device.model || parsedUserAgent.browser.name || 'Unknown device',
            deviceIp: location?.ip || 'Unknown IP',
            userAgent: rawUserAgent,
            browserName: parsedUserAgent.browser.name,
            browserVersion: parsedUserAgent.browser.version,
            osName: parsedUserAgent.os.name,
            osVersion: parsedUserAgent.os.version,
            deviceType: parsedUserAgent.device.type,
            deviceVendor: parsedUserAgent.device.vendor,
            deviceModel: parsedUserAgent.device.model,
            locationCity: location?.city,
            locationCountry: location?.country,
            locationLat: location?.latitude,
            locationLon: location?.longitude,
            token: tokenPayload,
            type:  type === 'access' ? 'access_token' : 'refresh_token',
            scopes: JSON.stringify(['read', 'write']),
            owner: {
                connect: {
                    id: user.id
                }
            },
            expiresAt: type === 'access' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return token;
    }

    /**
     * Génère un token pour un utilisateur
     * @param user - L'utilisateur à générer le token
     * @param request - La requête Fastify
     * @returns Le token généré
     */
    async generateTokens(user: User, request: FastifyRequest): Promise<{ accessToken: Token; refreshToken: Token } | null> {
        if (!user.id) return null;

        const accessToken = await this.generateToken(user, 'access', request);
        const refreshToken = await this.generateToken(user, 'refresh', request);

        if (!accessToken || !refreshToken) {
            return null;
        }

        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * 
     * Vérifie si un utilisateur est connecté avec un nouveau device
     * 
     * @param user - L'utilisateur à vérifier
     * @param request - La requête Fastify
     * @returns true si l'utilisateur est connecté avec un nouveau device, false sinon
     */
    async isNewDevice(user: User, request: FastifyRequest): Promise<boolean> {
        const ip = request.ip;
        const userAgent = request.headers['user-agent'] || '';
        
        // Récupérer tous les tokens de l'utilisateur
        const tokens = await tokenRepository.findAllByUserId(user.id);
        
        // Si l'utilisateur n'a pas de tokens, c'est forcément un nouvel appareil
        if (tokens.length === 0) {
            return true;
        }
        
        // Vérifier si l'utilisateur a déjà un token avec cette IP et ce user-agent
        const existingDevice = tokens.some(token => 
            token.deviceIp === ip && 
            token.userAgent === userAgent
        );
        
        // Si aucun token ne correspond à l'appareil actuel, c'est un nouvel appareil
        return !existingDevice;
    }


    /**
     * Vérifie un token
     * @param request - La requête Fastify
     * @param reply - La réponse Fastify
     * @returns Le token décodé ou null si le token est invalide
     */
    async verifyToken(request: FastifyRequest, reply: FastifyReply): Promise<User | null> {
        try {
            const authorization = request.headers.authorization;
            const token = authorization?.split(' ')[1];
            if (!token) {
                jsonResponse(reply, 'Token invalide', {}, 401);
                return null;
            }
            const decoded = verify(token, process.env.JWT_SECRET as string) as User;
            return decoded;
        } catch (error) {
            jsonResponse(reply, 'Token invalide', {}, 401);
            return null;
        }
    }



    /**
     * Trouve un token par son token
     * @param token - Le token à trouver
     * @returns Le token trouvé ou null si aucun token n'est trouvé
     */
    async findByToken(token: string): Promise<Token | null> {
        return tokenRepository.findByToken(token);
    }

    /**
     * Supprime un token par son id
     * @param id - L'id du token à supprimer
     * @returns Le token supprimé ou null si aucun token n'est trouvé
     */
    async deleteToken(id: string): Promise<Token | null> {
        return tokenRepository.delete(id);
    }

    /**
     * Génère un token de réinitialisation de mot de passe pour un utilisateur
     * @param userId - L'id de l'utilisateur
     * @param ip - L'ip de l'utilisateur
     * @returns Le token de réinitialisation de mot de passe
     */
    async generatePasswordResetToken(userId: string, ip: string): Promise<string> {
        // Supprime les anciens tokens de reset
        await tokenRepository.deleteByUserAndType(userId, 'reset_password');
    
        const expiresIn = RESET_TOKEN_EXPIRATION_HOURS * 60 * 60; // en secondes
    
        // Génère le token JWT
        const token = sign(
            {
                sub: userId,
                scope: 'reset',
            },
            JWT_SECRET,
            {
                expiresIn,
            }
        );
    
        const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
        // Stocke les métadonnées (et potentiellement pour invalidation)
        await tokenRepository.create({
            token: token,
            owner: {
                connect: {
                    id: userId,
                },
            },
            type: 'reset_password',
            scopes: 'reset',
            deviceName: 'Password Reset',
            deviceIp: ip,
            expiresAt,
        });
    
        return token;
    }

    async generateInvitationToken(email: string, deviceIp: string, senderId: string, deviceName: string): Promise<Token> {
        await tokenRepository.deleteByUserAndType(senderId, 'invitation');

        const tempToken = uuidv4();
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 100); // Never expires (set to 100 years in the future)
        const token = await tokenRepository.create({
            token: tempToken,
            owner: {
                connect: {
                    id: senderId
                }
            },
            type: 'invitation',
            scopes: 'invitation',
            deviceName,
            deviceIp,
            expiresAt,
        });

        return token;
    }
}

export const authService = new AuthService();
