import { ImageType, VerificationResult } from '@shared/enums/verificationEnums';
import { Serialize } from '@shared/types/Serialize';
import { z } from 'zod';
import { querySchema } from './commonDto';

export const faceVerificationSchema = z.object({
    referenceImageUrl: z.string(),
    uploadedImageUrl: z.string(),
    imageType: z.nativeEnum(ImageType),
    result: z.nativeEnum(VerificationResult),
    duration: z.number(),
    createdAt: z.date(),

});

export type FaceVerificationSchema = z.infer<typeof faceVerificationSchema>;
export type FaceVerificationDto = Serialize<FaceVerificationSchema>;

export const faceVerificationQuerySchema = querySchema.extend({
    imageType: z.nativeEnum(ImageType).optional(),
});

export type FaceVerificationQuerySchema = z.infer<typeof faceVerificationQuerySchema>;
export type FaceVerificationQueryDto = Serialize<FaceVerificationQuerySchema>;