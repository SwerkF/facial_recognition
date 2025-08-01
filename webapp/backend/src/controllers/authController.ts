import { Token, User } from '@/config/client';
import { FailedLoginAttempt } from '@/email-templates/emails/security/failedLoginAttempt';
import { NewDeviceLogin } from '@/email-templates/emails/security/newDeviceLogin';
import { tokenRepository, userRepository } from '@/repositories';
import { authService, mailerService } from '@/services';
import { ApiResponse } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import {
    authResponse,
    badRequestResponse,
    internalServerError,
    jsonResponse,
    notFoundResponse,
    unauthorizedResponse,
} from '@/utils/jsonResponse';
import { getLocationFromIp } from '@/utils/locationFromIp';
import { logger } from '@/utils/logger';
import { parseUserAgent } from '@/utils/userAgentParser';

import { render } from '@react-email/components';
import {
    AuthResponseDto,
    AuthTokenDto,
    LoginSchema,
    QuerySessionsSchema,
    RegisterSchema,
    RequestPasswordResetSchema,
    ResetPasswordSchema,
    TokenDto,
    UpdatePasswordSchema,
    UpdateUserDto,
    loginSchema,
    querySessionsSchema,
    registerSchema,
    requestPasswordResetSchema,
    resetPasswordSchema,
    tokenSchema,
    updatePasswordSchema,
} from '@shared/dto';
import bcrypt from 'bcryptjs';
import { verify } from 'jsonwebtoken';

class AuthController {
    private logger = logger.child({
        module: '[App][Auth]',
    });

    public createUser = asyncHandler<RegisterSchema>({
        bodySchema: registerSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<AuthResponseDto | void> | void> => {
            const existingUser = await userRepository.findByEmail(request.body.email);

            if (existingUser) {
                return badRequestResponse(reply, 'User already exists');
            }

            const hashedPassword = await bcrypt.hash(request.body.password, 10);

            const { confirmPassword: _confirmPassword, ...userData } = request.body;
            const createdUser = await userRepository.create({
                ...userData,
                password: hashedPassword,
            });

            const tokens = await authService.generateTokens(createdUser, request);

            if (!tokens) {
                return internalServerError(reply, 'Error generating tokens');
            }

            return authResponse(reply, tokens.accessToken.token, tokens.refreshToken.token);
        },
    });

    public login = asyncHandler<LoginSchema>({
        bodySchema: loginSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<AuthResponseDto | void> | void> => {
            const user = await userRepository.findByEmail(request.body.email);

            if (!user) {
                return unauthorizedResponse(reply, 'Invalid credentials');
            }

            const isPasswordValid = await bcrypt.compare(request.body.password, user.password);

            const isNewDevice = await authService.isNewDevice(user, request);

            const parsedUserAgent = parseUserAgent(request.headers['user-agent'] as string);
            const location = await getLocationFromIp(request.ip);

            if (!isPasswordValid) {
                if (isNewDevice) {
                    mailerService.sendEmail(
                        user.email,
                        'Failed Login Attempt',
                        await render(
                            FailedLoginAttempt({
                                name: user.firstName,
                                attemptDate: new Date().toLocaleString(),
                                ipAddress: request.ip,
                                location:
                                    location?.city || location?.country
                                        ? `${location?.city || ''}, ${location?.region || ''}, ${location?.country || ''}`
                                        : 'Non disponible',
                                deviceInfo: `${parsedUserAgent.device.model || 'Unknown device'}, ${parsedUserAgent.os.name} ${parsedUserAgent.os.version}, ${parsedUserAgent.browser.name} ${parsedUserAgent.browser.version}, ${request.ip}`,
                            })
                        )
                    );
                }
                return unauthorizedResponse(reply, 'Invalid credentials');
            }

            await userRepository.update(user.id, { lastLoginAt: new Date() } as UpdateUserDto & {
                lastLoginAt?: Date;
            });

            const tokens = await authService.generateTokens(user, request);

            // check if is a new device
            if (isNewDevice) {
                try {
                    mailerService.sendEmail(
                        user.email,
                        'New Device Login',
                        await render(
                            NewDeviceLogin({
                                name: user.firstName,
                                deviceName: `${parsedUserAgent.device.model || 'Unknown device'}, ${parsedUserAgent.os.name} ${parsedUserAgent.os.version}, ${parsedUserAgent.browser.name} ${parsedUserAgent.browser.version}`,
                                loginDate: new Date().toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                }),
                                location:
                                    location?.city || location?.country
                                        ? `${location?.city || ''}, ${location?.region || ''}, ${location?.country || ''}`
                                        : 'Non disponible',
                                deviceId: parsedUserAgent.raw.slice(0, 20),
                            })
                        )
                    );
                } catch (error) {
                    this.logger.error({
                        msg: "Erreur lors de l'envoi de l'email de nouveau appareil",
                        error,
                    });
                }
            }

            if (!tokens) {
                return internalServerError(reply, 'Error generating tokens');
            }

            return authResponse(reply, tokens.accessToken.token, tokens.refreshToken.token);
        },
    });

    public updatePassword = asyncHandler<UpdatePasswordSchema>({
        bodySchema: updatePasswordSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<void> | void> => {
            const { currentPassword, newPassword } = request.body;

            const existingUser = await userRepository.findById(request.user.id);

            if (!existingUser || !existingUser.id) {
                return notFoundResponse(reply, 'User not found');
            }

            if (existingUser.id !== request.user.id) {
                return unauthorizedResponse(reply, 'Unauthorized');
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, existingUser.password);

            if (!isPasswordValid) {
                return unauthorizedResponse(reply, 'Invalid password');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await userRepository.update(existingUser.id, {
                password: hashedPassword,
            } as UpdateUserDto);

            return jsonResponse(reply, 'Password updated successfully', undefined, 200);
        },
    });

    public refreshToken = asyncHandler<TokenDto>({
        bodySchema: tokenSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<AuthResponseDto | void> | void> => {
            const body = request.body as { token: string };
            const { token } = body;
            const decoded = verify(token, process.env.JWT_SECRET as string) as User;

            const foundToken = await tokenRepository.findByToken(token);

            if (!foundToken || foundToken.unvailableAt) {
                return unauthorizedResponse(reply, 'Invalid token');
            }

            const user = await userRepository.findById(decoded.id);

            if (!user) {
                return notFoundResponse(reply, 'User not found');
            }

            const newTokens = await authService.generateTokens(user, request);

            if (!newTokens) {
                return internalServerError(reply, 'Error generating tokens');
            }

            return authResponse(reply, newTokens.accessToken.token, newTokens.refreshToken.token);
        },
    });

    public requestPasswordReset = asyncHandler<RequestPasswordResetSchema>({
        bodySchema: requestPasswordResetSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<TokenDto | void> | void> => {
            const user = await userRepository.findByEmail(request.body.email);

            if (!user || !user.id) {
                return unauthorizedResponse(reply, 'Invalid credentials');
            }

            const token = await authService.generatePasswordResetToken(user.id, request.ip);

            if (!token) {
                return internalServerError(reply, 'Error generating token');
            }

            return jsonResponse(reply, 'Password reset requested', { token }, 200);
        },
    });

    public resetPassword = asyncHandler<ResetPasswordSchema>({
        bodySchema: resetPasswordSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<void> | void> => {
            const { token, currentPassword, newPassword } = request.body;

            const resetToken = await authService.findByToken(token);

            if (
                !resetToken ||
                resetToken.type !== 'reset_password' ||
                new Date() > resetToken.expiresAt
            ) {
                return badRequestResponse(reply, 'Invalid or expired token');
            }

            const user = await userRepository.findById(resetToken.ownedById as string);
            if (!user) {
                return notFoundResponse(reply, 'User not found');
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return badRequestResponse(reply, 'Current password is incorrect');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await userRepository.updatePassword(resetToken.ownedById as string, hashedPassword);

            await authService.deleteToken(resetToken.id);

            return jsonResponse(reply, 'Password reset successfully', undefined, 200);
        },
    });

    public getCurrentUser = asyncHandler<User>({
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<User | void> | void> => {
            if (!request.user?.id) {
                return unauthorizedResponse(reply, 'Unauthorized');
            }

            const user = await userRepository.findById(request.user.id);
            if (!user) {
                return notFoundResponse(reply, 'User not found');
            }

            const token = request.headers.authorization?.split(' ')[1];
            const foundedToken = await tokenRepository.findByToken(token as string);

            if (!token || foundedToken?.unvailableAt) {
                return unauthorizedResponse(reply, 'Invalid token');
            }

            await userRepository.update(user.id, { lastLoginAt: new Date() } as UpdateUserDto & {
                lastLoginAt?: Date;
            });

            return jsonResponse(reply, 'User retrieved successfully', user, 200);
        },
    });

    public getMySessions = asyncHandler<unknown, QuerySessionsSchema, unknown, AuthTokenDto[]>({
        querySchema: querySessionsSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<Token[] | void> | void> => {
            if (!request.user?.id) {
                return unauthorizedResponse(reply, 'Unauthorized');
            }

            if (request.query.userId !== request.user.id && request.user.roles !== 'ROLE_ADMIN') {
                return unauthorizedResponse(reply, 'Unauthorized');
            }

            const tokens = await tokenRepository.findAllByUserIdAndBrowser(request.query.userId);
            return jsonResponse(reply, 'Sessions retrieved successfully', tokens, 200);
        },
    });
}

export const authController = new AuthController();
