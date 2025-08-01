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
import { aiModelService } from '@/services/aiModelService';

class FaceVerificationController {

    private logger = logger.child({
        module: '[App][FaceVerification]',
    });

    public createFaceVerification = asyncHandler<any, unknown, unknown, FaceVerificationDto>({
        handler: async (req: FastifyRequest, res: FastifyReply) => {
            try {
                const startTime = Date.now();

                // Récupération de l'image depuis la requête multipart
                const uploadedImageData = (req as any).body?.uploadedImage;

                if (!uploadedImageData) {
                    return badRequestResponse(res, 'L\'image à analyser est requise');
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

                if (!allowedMimeTypes.includes(uploadedImageData.mimetype)) {
                    return badRequestResponse(res, 'Type de fichier non supporté. Formats acceptés: JPEG, PNG, WEBP, GIF, BMP, TIFF');
                }

                // Upload de l'image vers MinIO
                const uploadedFileName = await minioService.uploadFile(uploadedImageData);

                // Création des deux médias avec seulement le nom de fichier (pas l'URL complète)
                const [uploadedMedia] = await Promise.all([
                    mediaRepository.create({
                        url: uploadedFileName, // Stocker seulement le nom du fichier
                        filename: uploadedFileName,
                        mimeType: uploadedImageData.mimetype,
                        size: uploadedImageData._buf?.length || 0,
                        createdAt:  new Date(),
                    })
                ]);

                //Add AI model service
                const result = await aiModelService.recognizeFace(uploadedImageData, uploadedFileName);
                console.log('result:', result);

                // Création de la vérification faciale
                const faceVerification = await faceVerificationRepository.create({
                    uploadedImage: {
                        connect: {
                            id: uploadedMedia.id,
                        },
                    },
                    imageType: 'uploaded',
                    result: result.is_same ? 'success' : 'failure',
                    duration: Date.now() - startTime,
                    confidence: result.confidence,
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