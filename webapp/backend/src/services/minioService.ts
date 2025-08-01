import { logger } from '@/utils/logger';

import { MultipartFile } from '@fastify/multipart';
import dotenv from 'dotenv';
import * as Minio from 'minio';

interface File {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
}

// Chargement des variables d'environnement
dotenv.config();

class MinioService {
    private minioClient: Minio.Client;
    private bucketName: string;
    private logger = logger.child({
        module: '[CFR][MINIO][Service]'
    });

    constructor() {
        // Récupérer le nom du bucket depuis la variable d'environnement
        this.bucketName = process.env.MINIO_BUCKET || 'files';

        // Configuration du client MinIO avec des options de débogage
        this.minioClient = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000,
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
            region: '',
            pathStyle: true,
        });
    }

    /**
     * Initialise le client MinIO
     */
    public async initializeMinio(): Promise<void> {
        try {
            const bucketExists = await this.minioClient.bucketExists(this.bucketName);

            if (!bucketExists) {
                await this.minioClient.makeBucket(this.bucketName);
            }
        } catch (err) {
            logger.error('Error details:', err);
        }
    }

    /**
     * Upload des fichiers
     * @param file - Le fichier à uploader
     * @returns Le nom du fichier
     */
    public async uploadFile(file: MultipartFile): Promise<string> {
        try {
            const fileName = `${Date.now()}-${file.fieldname}.${file.mimetype.split('/')[1]}`;
            const fileSize = await file.file.bytesRead;
            await this.minioClient.putObject(
                this.bucketName,
                fileName,
                await file.toBuffer(),
                fileSize,
                {
                    'Content-Type': file.mimetype,
                }
            );
            return fileName;
        } catch (err) {
            this.logger.error('Error uploading file:', err);
            throw err;
        }
    }

    /**
     *
     * @param fileName
     * @returns
     */
    public async getFile(fileName: string): Promise<string> {
        try {
            let url = await this.minioClient.presignedUrl(
                'GET',
                this.bucketName,
                fileName,
                60 * 60 * 24
            );
            return url;
        } catch (err) {
            this.logger.error('Error getting file:', err);
            throw err;
        }
    }

    /**
     * Télécharge un fichier depuis Minio
     * @param fileName - Le nom du fichier à télécharger
     * @returns Le fichier téléchargé
     */
    public async downloadFile(urlFile: string): Promise<Buffer> {
        try {
            // Ajouter le protocole 'https:' aux URLs qui commencent par '//'
            const fixedUrl = urlFile.startsWith('//') ? `https:${urlFile}` : urlFile;
            
            const response = await fetch(fixedUrl);
            return Buffer.from(await response.arrayBuffer());
            
        } catch (err) {
            this.logger.error('Error downloading file:', err);
            throw err;
        }
    }

    public async downloadAndStoreImage(urlFile: string): Promise<{ fileName: string, contentType: string }> {
        try {
            // Ajouter le protocole 'https:' aux URLs qui commencent par '//'
            const fixedUrl = urlFile.startsWith('//') ? `https:${urlFile}` : urlFile;
            
            const response = await fetch(fixedUrl);
            const fileBuffer = Buffer.from(await response.arrayBuffer());
            const fileName = `${Date.now()}-${fixedUrl.split('/').pop()}`;
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            
            // Créer un objet avec les propriétés minimales nécessaires
            const file = {
                fieldname: fileName,
                mimetype: contentType,
                file: {
                    bytesRead: fileBuffer.length
                },
                toBuffer: async () => fileBuffer
            } as any; // Cast en any pour contourner les erreurs de type
            
            const uploadedFileName = await this.uploadFile(file);
            return { fileName: uploadedFileName, contentType };
        } catch (err) {
            this.logger.error('Error downloading file:', err);
            throw err;
        }
    }

    /**
     * Supprime un fichier
     * @param fileName - Le nom du fichier à supprimer
     */
    public async deleteFile(fileName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(this.bucketName, fileName);
        } catch (err) {
            this.logger.error('Error deleting file:', err);
            throw err;
        }
    }
}

export const minioService = new MinioService(); 
