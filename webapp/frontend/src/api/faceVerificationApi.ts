import { api } from '@/api/interceptor';
import type { ApiResponse } from '@/types';

import type { FaceVerificationDto, FaceVerificationQueryDto } from '@shared/dto/faceVerificationDto';

export interface CreateFaceVerificationRequest {
    referenceImage: File;
    uploadedImage: File;
}

class FaceVerificationService {
    private apiUrl = '/api/face-verifications';

    /**
     * Crée une nouvelle vérification faciale avec deux images
     * @param request - Les deux images (référence et upload)
     * @returns Promise<ApiResponse<FaceVerificationDto>>
     */
    public async createFaceVerification(
        request: CreateFaceVerificationRequest
    ): Promise<ApiResponse<FaceVerificationDto>> {
        const formData = new FormData();
        formData.append('referenceImage', request.referenceImage);
        formData.append('uploadedImage', request.uploadedImage);

        return api.fetchMultipartRequest(this.apiUrl, 'POST', formData, false);
    }

    /**
     * Récupère toutes les vérifications faciales avec pagination et filtres
     * @param params - Paramètres de requête (pagination, filtres)
     * @returns Promise<ApiResponse<FaceVerificationDto[]>>
     */
    public async getAllFaceVerifications(
        params: FaceVerificationQueryDto
    ): Promise<ApiResponse<FaceVerificationDto[]>> {
        const queryParams = new URLSearchParams();
        
        if (params.page) {
            queryParams.append('page', params.page.toString());
        }
        if (params.limit) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params.search) {
            queryParams.append('search', params.search);
        }
        if (params.imageType) {
            queryParams.append('imageType', params.imageType);
        }

        const url = queryParams.toString() 
            ? `${this.apiUrl}?${queryParams.toString()}`
            : this.apiUrl;

        return api.fetchRequest(url, 'GET', null, false);
    }

    /**
     * Récupère une vérification faciale par ID
     * @param verificationId - L'ID de la vérification
     * @returns Promise<ApiResponse<FaceVerificationDto>>
     */
    public async getFaceVerificationById(
        verificationId: string
    ): Promise<ApiResponse<FaceVerificationDto>> {
        return api.fetchRequest(`${this.apiUrl}/${verificationId}`, 'GET', null, false);
    }
}

export const faceVerificationService = new FaceVerificationService();
