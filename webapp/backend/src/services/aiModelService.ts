interface FaceRecognitionResult {
  is_same: boolean;
  confidence: number;
  percentage: string;
  message: string;
}

interface FaceRecognitionError {
  error: string;
}

export class AiModelService {
  private readonly flaskServerUrl = 'http://localhost:7777';

  /**
   * Envoie une image au serveur Flask pour reconnaissance faciale
   * @param imageFile - Le fichier image à analyser
   * @returns Résultat de la reconnaissance faciale
   */
  async recognizeFace(imageFile: any, filename: string): Promise<FaceRecognitionResult> {
    try {
      // Créer un multipart/form-data manuellement pour éviter les problèmes de stream
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      const contentType = this.getMimeType(filename);
      
      // Extraire le buffer selon le type d'objet reçu
      let imageBuffer: Buffer;
      if (Buffer.isBuffer(imageFile)) {
        imageBuffer = imageFile;
      } else if (imageFile._buf && Buffer.isBuffer(imageFile._buf)) {
        // Cas Fastify multipart
        imageBuffer = imageFile._buf;
      } else if (imageFile.buffer && Buffer.isBuffer(imageFile.buffer)) {
        // Cas Multer
        imageBuffer = imageFile.buffer;
      } else if (imageFile.data && Buffer.isBuffer(imageFile.data)) {
        // Autres cas
        imageBuffer = imageFile.data;
      } else {
        throw new Error('Format de fichier non supporté - impossible d\'extraire les données binaires');
      }
      
      // Construire le body multipart manuellement
      const formBody = Buffer.concat([
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from(`Content-Disposition: form-data; name="image"; filename="${filename}"\r\n`),
        Buffer.from(`Content-Type: ${contentType}\r\n\r\n`),
        imageBuffer,
        Buffer.from(`\r\n--${boundary}--\r\n`)
      ]);

      // Faire l'appel au serveur Flask
      const response = await fetch(`${this.flaskServerUrl}/api/upload`, {
        method: 'POST',
        body: formBody,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': formBody.length.toString(),
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }

      const result = await response.json() as FaceRecognitionResult | FaceRecognitionError;

      // Vérifier si c'est une erreur du serveur Flask
      if ('error' in result) {
        throw new Error(result.error);
      }

      return result as FaceRecognitionResult;
    } catch (error) {
      console.error('Erreur lors de la reconnaissance faciale:', error);
      throw new Error(`Échec de la reconnaissance faciale: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Vérifie si le serveur Flask est disponible
   * @returns true si le serveur répond, false sinon
   */
  async isFlaskServerAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.flaskServerUrl}/api/upload`, {
        method: 'OPTIONS', // Juste pour tester la connectivité
      });
      return response.status !== 404; // Si pas 404, le serveur répond
    } catch (error) {
      console.error('Serveur Flask non disponible:', error);
      return false;
    }
  }

  /**
   * Détermine le type MIME basé sur l'extension du fichier
   * @param filename - Le nom du fichier
   * @returns Le type MIME approprié
   */
  private getMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'bmp':
        return 'image/bmp';
      default:
        return 'image/jpeg'; // Par défaut
    }
  }

  /**
   * Valide si le fichier est une image supportée
   * @param filename - Le nom du fichier
   * @returns true si l'extension est supportée
   */
  isImageSupported(filename: string): boolean {
    const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return supportedExtensions.includes(extension || '');
  }
}

// Export d'une instance singleton
export const aiModelService = new AiModelService();
