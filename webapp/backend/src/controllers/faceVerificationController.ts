import { ApiResponse } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { jsonResponse, notFoundResponse, internalServerError, badRequestResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';

import { FaceVerificationDto, FaceVerificationQueryDto, faceVerificationQuerySchema, faceVerificationSchema } from '@shared/dto/faceVerificationDto';
import { faceVerificationRepository } from '@/repositories';
import { minioService } from '@/services/minioService';
import { mediaRepository } from '@/repositories/mediaRepository';
import { faceVerificationTransformer } from '@/transformers/faceVerificationTransformer';
import { FastifyRequest, FastifyReply } from 'fastify';

class FaceVerificationController {

    private logger = logger.child({
        module: '[App][FaceVerification]',
    });

    public createFaceVerification = asyncHandler<any, unknown, unknown, FaceVerificationDto>({
        handler: async (req: FastifyRequest, res: FastifyReply) => {
            try {
                const startTime = Date.now();

                // Récupération des deux fichiers depuis la requête multipart
                const referenceImageData = (req as any).body?.referenceImage;
                const uploadedImageData = (req as any).body?.uploadedImage;

                if (!referenceImageData || !uploadedImageData) {
                    return badRequestResponse(res, 'Les deux fichiers sont requis: referenceImage et uploadedImage');
                }

                // Types MIME autorisés pour les images
                const allowedMimeTypes = [
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                    'image/webp',
                    'image/gif',
                    'image/bmp',
                    'image/tiff'
                ];

                if (!allowedMimeTypes.includes(referenceImageData.mimetype) ||
                    !allowedMimeTypes.includes(uploadedImageData.mimetype)) {
                    return badRequestResponse(res, 'Type de fichier non supporté. Formats acceptés: JPEG, PNG, WEBP, GIF, BMP, TIFF');
                }

                // Upload des deux fichiers vers MinIO
                const [uploadedReferenceFileName, uploadedUploadedFileName] = await Promise.all([
                    minioService.uploadFile(referenceImageData),
                    minioService.uploadFile(uploadedImageData)
                ]);

                // Création des deux médias avec seulement le nom de fichier (pas l'URL complète)
                const [referenceMedia, uploadedMedia] = await Promise.all([
                    mediaRepository.create({
                        url: uploadedReferenceFileName, // Stocker seulement le nom du fichier
                        filename: uploadedReferenceFileName,
                        mimeType: referenceImageData.mimetype,
                        size: referenceImageData._buf?.length || 0,
                        createdAt: new Date(),
                    }),
                    mediaRepository.create({
                        url: uploadedUploadedFileName, // Stocker seulement le nom du fichier
                        filename: uploadedUploadedFileName,
                        mimeType: uploadedImageData.mimetype,
                        size: uploadedImageData._buf?.length || 0,
                        createdAt: new Date(),
                    })
                ]);

                // Création de la vérification faciale
                const faceVerification = await faceVerificationRepository.create({
                    referenceImage: {
                        connect: {
                            id: referenceMedia.id,
                        },
                    },
                    uploadedImage: {
                        connect: {
                            id: uploadedMedia.id,
                        },
                    },
                    imageType: 'uploaded',
                    result: 'pending', // Par défaut en pending, sera mis à jour après traitement
                    duration: Date.now() - startTime,
                });

                // Récupération avec les relations pour le transformer
                const faceVerificationWithRelations = await faceVerificationRepository.getById(faceVerification.id);

                if (!faceVerificationWithRelations) {
                    return internalServerError(res, 'Erreur lors de la création de la vérification');
                }

                const faceVerificationDto = await faceVerificationTransformer.toFaceVerificationDto(faceVerificationWithRelations);

                return jsonResponse(res, 'Vérification faciale créée avec succès', faceVerificationDto, 201);

            } catch (error) {
                console.log('error:', error);
                this.logger.error('Erreur lors de la création de la vérification faciale:', error);
                return internalServerError(res, 'Erreur interne du serveur');
            }
        }
    });

    public getAll = asyncHandler<unknown, FaceVerificationQueryDto, unknown, FaceVerificationDto[]>({
        querySchema: faceVerificationQuerySchema,
        handler: async (req: FastifyRequest, res: FastifyReply) => {
            const query = req.query as FaceVerificationQueryDto;
            const result = await faceVerificationRepository.findAll(query, 0, 10);

            const faceVerificationDtos = await faceVerificationTransformer.toFaceVerificationDtoList(result.data);

            return jsonResponse(
                res,
                'Vérifications faciales récupérées avec succès',
                faceVerificationDtos,
                200,
                result.pagination
            );
        }
    });

}

export const faceVerificationController = new FaceVerificationController();