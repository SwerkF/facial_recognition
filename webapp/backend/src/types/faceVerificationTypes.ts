import { faceVerificationInclude } from "@/repositories/faceVerificationRepository";
import { Prisma } from "@/config/client";

export type FaceVerificationWithRelations = Prisma.FaceVerificationGetPayload<{
    include: typeof faceVerificationInclude;
}>;