import { InvitationRequestStatus, InvitationRequestType } from '@shared/enums';
import { z } from 'zod';

import { Serialize } from '../types/Serialize';
import { querySchema } from './commonDto';
import { userRestrictedSchema } from './userDto';

export const createInvitationRequestSchema = z.object({
    email: z.string().email(),
    type: z.nativeEnum(InvitationRequestType),
});

export type CreateInvitationRequestSchema = z.infer<typeof createInvitationRequestSchema>;
export type CreateInvitationRequestDto = Serialize<CreateInvitationRequestSchema>;

export const getInvitationRequestsSchema = querySchema.extend({
    status: z.nativeEnum(InvitationRequestStatus).optional(),
    invitedBy: z.string().optional(),
});

export type GetInvitationRequestsSchema = z.infer<typeof getInvitationRequestsSchema>;
export type GetInvitationRequestsDto = Serialize<GetInvitationRequestsSchema>;

export const updateInvitationRequestSchema = z.object({
    status: z.nativeEnum(InvitationRequestStatus),
    registeredAt: z.date().optional(),
    userId: z.string().optional(),
});

export type UpdateInvitationRequestSchema = z.infer<typeof updateInvitationRequestSchema>;
export type UpdateInvitationRequestDto = Serialize<UpdateInvitationRequestSchema>;

export const invitationRequestSchema = createInvitationRequestSchema.extend({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    status: z.nativeEnum(InvitationRequestStatus),
    token: z.string(),
    expiresAt: z.date(),
    invitedAt: z.date(),
    registeredAt: z.date(),
    invitedBy: userRestrictedSchema,
    user: userRestrictedSchema.optional(),
});

export type InvitationRequestSchema = z.infer<typeof invitationRequestSchema>;
export type InvitationRequestDto = Serialize<InvitationRequestSchema>;

export const acceptInvitationSchema = z.object({
    token: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string(),
    acceptNewsletter: z.boolean(),
});

export type AcceptInvitationSchema = z.infer<typeof acceptInvitationSchema>;
export type AcceptInvitationDto = Serialize<AcceptInvitationSchema>;

export const verifyInvitationTokenSchema = z.object({
    token: z.string(),
});

export type VerifyInvitationTokenSchema = z.infer<typeof verifyInvitationTokenSchema>;
export type VerifyInvitationTokenDto = Serialize<VerifyInvitationTokenSchema>;
