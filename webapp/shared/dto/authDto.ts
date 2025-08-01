import { Serialize } from '@shared/types/Serialize';
import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    rememberMe: z.boolean().optional(),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type LoginDto = Serialize<LoginSchema>;

export const registerSchema = z.object({
    email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
    password: z
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    acceptTerms: z.boolean().optional(),
    acceptPrivacy: z.boolean().optional(),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type RegisterDto = Serialize<RegisterSchema>;

export const resetPasswordSchema = z
    .object({
        currentPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
        newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
        confirmPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
        token: z.string().min(1),
    });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordDto = Serialize<ResetPasswordSchema>;

export const tokenSchema = z.object({
    token: z.string().min(1),
});

export type TokenSchema = z.infer<typeof tokenSchema>;
export type TokenDto = Serialize<TokenSchema>;

export const authResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});

export type AuthResponseSchema = z.infer<typeof authResponseSchema>;
export type AuthResponseDto = Serialize<AuthResponseSchema>;

export const querySessionsSchema = z.object({
    userId: z.string().min(1),
});

export type QuerySessionsSchema = z.infer<typeof querySessionsSchema>;
export type QuerySessionsDto = Serialize<QuerySessionsSchema>;

export const requestPasswordResetSchema = z.object({
    email: z.string().email(),
});

export type RequestPasswordResetSchema = z.infer<typeof requestPasswordResetSchema>;
export type RequestPasswordResetDto = Serialize<RequestPasswordResetSchema>;

export const updatePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(6)
            .max(255, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
        newPassword: z
            .string()
            .min(6)
            .max(255, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
        confirmPassword: z
            .string()
            .min(6)
            .max(255, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
    });

export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
export type UpdatePasswordDto = Serialize<UpdatePasswordSchema>;
