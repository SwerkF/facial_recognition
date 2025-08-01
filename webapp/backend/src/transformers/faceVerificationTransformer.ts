import { FaceVerificationDto } from "@shared/dto/faceVerificationDto";
import { FaceVerificationWithRelations } from "@/types";
import { ImageType, VerificationResult } from "@shared/enums/verificationEnums";
import { minioService } from "@/services/minioService";

class FaceVerificationTransformer {
    public async toFaceVerificationDto(faceVerification: FaceVerificationWithRelations): Promise<FaceVerificationDto> {
        // Générer les URLs pré-signées pour les images
        const referenceImageUrl = faceVerification.referenceImage?.url 
            ? await minioService.getFile(faceVerification.referenceImage.url)
            : '';
            
        const uploadedImageUrl = faceVerification.uploadedImage?.url 
            ? await minioService.getFile(faceVerification.uploadedImage.url)
            : '';

        return {
            referenceImageUrl,
            imageType: faceVerification.imageType as ImageType,
            duration: faceVerification.duration / 1000,
            uploadedImageUrl,
            result: faceVerification.result as VerificationResult,
            createdAt: faceVerification.timestamp.toISOString(),
        };
    }

    /**
     * Transforme une liste de vérifications faciales en DTOs
     * @param faceVerifications - Liste des vérifications faciales avec relations
     * @returns Promise<FaceVerificationDto[]>
     */
    public async toFaceVerificationDtoList(faceVerifications: FaceVerificationWithRelations[]): Promise<FaceVerificationDto[]> {
        const transformPromises = faceVerifications.map(verification => 
            this.toFaceVerificationDto(verification)
        );
        
        return Promise.all(transformPromises);
    }
}

export const faceVerificationTransformer = new FaceVerificationTransformer();