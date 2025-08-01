import { Serialize } from '@shared/types/Serialize';
import { z } from 'zod';

import { basicUserSchema } from './userDto';

export const authTokenSchema = z.object({
    id: z.string().optional(),
    ownedById: z.string().optional(),
    token: z.string(),
    type: z.string(),
    scopes: z.string(),
    deviceName: z.string().optional(),
    deviceIp: z.string().optional(),
    userAgent: z.string().optional(),
    browserName: z.string().optional(),
    browserVersion: z.string().optional(),
    osName: z.string().optional(),
    osVersion: z.string().optional(),
    deviceType: z.string().optional(),
    deviceVendor: z.string().optional(),
    deviceModel: z.string().optional(),
    locationCity: z.string().optional(),
    locationCountry: z.string().optional(),
    locationLat: z.number().optional(),
    locationLon: z.number().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    expiresAt: z.date(),
    unvailableAt: z.date().optional(),
    owner: basicUserSchema.optional(),
});

export type AuthTokenSchema = z.infer<typeof authTokenSchema>;
export type AuthTokenDto = Serialize<AuthTokenSchema>;
