import { z } from 'zod';

export const querySchema = z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
    search: z.string().optional(),
});

export const idParamsSchema = z
    .object({
        id: z.string().min(1),
    })
    .required()
    .strict();

export type IdParams = z.infer<typeof idParamsSchema>;
