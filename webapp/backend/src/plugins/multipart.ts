import fastifyMultipart from '@fastify/multipart';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export async function multipartPlugin(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.register(fastifyMultipart, {
        limits: {
            fieldNameSize: 100,
            fieldSize: 100 * 1024,
            fields: 10,
            fileSize: 10 * 1024 * 1024, // 10 MB par fichier (suffisant pour les images)
            files: 2, // Permettre 2 fichiers pour referenceImage et uploadedImage
            headerPairs: 2000,
        },
        attachFieldsToBody: true,
    });
}
