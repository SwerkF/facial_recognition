import { faceVerificationService, CreateFaceVerificationRequest } from '@/api/faceVerificationApi';
import queryClient from '@/configs/queryClient';

import type { FaceVerificationDto, FaceVerificationQueryDto } from '@shared/dto/faceVerificationDto';
import { useMutation, useQuery } from '@tanstack/react-query';

/**
 * Hook pour récupérer toutes les vérifications faciales avec pagination et filtres
 * @param searchParams - Paramètres de recherche et pagination
 * @returns Query pour les vérifications faciales
 */
export const useGetAllFaceVerifications = (searchParams: FaceVerificationQueryDto) => {
    return useQuery<FaceVerificationDto[]>({
        queryKey: ['faceVerifications', searchParams],
        queryFn: async () => {
            const response = await faceVerificationService.getAllFaceVerifications(searchParams);
            return response.data;
        },
    });
};

/**
 * Hook pour récupérer une vérification faciale par ID
 * @param verificationId - L'ID de la vérification faciale
 * @returns Query pour la vérification faciale
 */
export const useGetFaceVerificationById = (verificationId: string) => {
    return useQuery<FaceVerificationDto>({
        queryKey: ['faceVerifications', verificationId],
        queryFn: async () => {
            const response = await faceVerificationService.getFaceVerificationById(verificationId);
            return response.data;
        },
        enabled: !!verificationId, // Ne lance la requête que si l'ID est fourni
    });
};

/**
 * Hook pour créer une nouvelle vérification faciale
 * @returns Mutation pour créer une vérification faciale
 */
export const useCreateFaceVerification = () => {
    return useMutation<FaceVerificationDto, Error, CreateFaceVerificationRequest>({
        mutationFn: async (request: CreateFaceVerificationRequest) => {
            const response = await faceVerificationService.createFaceVerification(request);
            return response.data;
        },
        onSuccess: (data) => {
            // Invalider et refetch la liste des vérifications
            queryClient.invalidateQueries({ queryKey: ['faceVerifications'] });
            
            // Note: Les nouveaux éléments seront récupérés lors du prochain fetch
        },
        onError: (error) => {
            console.error('Erreur lors de la création de la vérification faciale:', error);
        },
    });
};
