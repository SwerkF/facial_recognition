import { Role } from '@shared/enums';
import { Serialize } from '@shared/types/Serialize';
import { z } from 'zod';

export const basicUserSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    roles: z.array(z.nativeEnum(Role)),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type BasicUserSchema = z.infer<typeof basicUserSchema>;
export type BasicUserDto = Serialize<BasicUserSchema>;

export const getAllUsersSchema = z.object({
    page: z.string().min(1, 'Le numéro de page doit être supérieur à 0').optional(),
    limit: z.string().min(1, "Le nombre d'éléments par page doit être supérieur à 0").optional(),
    search: z.string().optional(),
});

export type GetAllUsersSchema = z.infer<typeof getAllUsersSchema>;
export type GetAllUsersDto = Serialize<GetAllUsersSchema>;

export const updateUserSchema = z.object({
    email: z.string().email("Format d'email invalide"),
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type UpdateUserDto = Serialize<UpdateUserSchema>;

export const userRestrictedSchema = basicUserSchema.pick({
    id: true,
    firstName: true,
    lastName: true,
    email: true,
});

export type UserRestrictedSchema = z.infer<typeof userRestrictedSchema>;
export type UserRestrictedDto = Serialize<UserRestrictedSchema>;
