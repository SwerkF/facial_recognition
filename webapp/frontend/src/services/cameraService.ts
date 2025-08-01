/**
 * Service de gestion de caméra pour la vérification faciale
 */

export interface CameraConfig {
  width: number;
  height: number;
  facingMode: 'user' | 'environment';
}

export interface CountdownConfig {
  duration: number; // en secondes
  onTick?: (remaining: number) => void;
  onComplete?: () => void;
}

export interface CaptureResult {
  file: File | null;
  error?: string;
}

class CameraService {
  private stream: MediaStream | null = null;
  private defaultConfig: CameraConfig = {
    width: 640,
    height: 480,
    facingMode: 'user'
  };

  /**
   * Démarre la caméra avec la configuration spécifiée
   * @param videoElement - L'élément vidéo pour afficher le stream
   * @param config - Configuration de la caméra (optionnel)
   * @returns Promise<MediaStream | null>
   */
  public async startCamera(
    videoElement: HTMLVideoElement, 
    config: Partial<CameraConfig> = {}
  ): Promise<MediaStream | null> {
    try {
      console.log('🎥 Tentative de démarrage de la caméra...');
      
      // Arrêter la caméra existante si elle existe
      this.stopCamera();
      
      // Essayer d'abord avec une configuration simple
      let constraints: MediaStreamConstraints = {
        video: true
      };
      
      // Si une configuration spécifique est demandée, l'utiliser
      if (Object.keys(config).length > 0) {
        const cameraConfig = { ...this.defaultConfig, ...config };
        constraints = {
          video: {
            width: { ideal: cameraConfig.width },
            height: { ideal: cameraConfig.height },
            facingMode: cameraConfig.facingMode
          }
        };
      }
      
      console.log('📋 Contraintes caméra:', constraints);
      
      // Obtenir le stream de la caméra
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Stream obtenu:', this.stream);
      
      // Configurer l'élément vidéo
      videoElement.srcObject = this.stream;
      videoElement.muted = true;
      videoElement.playsInline = true;
      videoElement.autoplay = true;
      
      console.log('🔧 Élément vidéo configuré');
      
      // Attendre que la vidéo soit prête
      return new Promise<MediaStream>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          console.error('⏰ Timeout: la vidéo ne démarre pas en 8 secondes');
          reject(new Error('Timeout: la vidéo ne démarre pas'));
        }, 8000);

        const cleanup = () => {
          clearTimeout(timeoutId);
          videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
          videoElement.removeEventListener('canplay', onCanPlay);
          videoElement.removeEventListener('error', onError);
        };

        const onLoadedMetadata = () => {
          console.log('📊 Métadonnées vidéo chargées');
        };

        const onCanPlay = () => {
          console.log('▶️ Vidéo prête à jouer');
          cleanup();
          resolve(this.stream!);
        };

        const onError = (error: Event) => {
          console.error('❌ Erreur vidéo:', error);
          cleanup();
          reject(new Error('Erreur de lecture vidéo'));
        };

        videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
        videoElement.addEventListener('canplay', onCanPlay);
        videoElement.addEventListener('error', onError);
        
        // Forcer le démarrage
        videoElement.play()
          .then(() => {
            console.log('🎬 Lecture démarrée');
          })
          .catch((error) => {
            console.error('❌ Erreur play():', error);
            cleanup();
            reject(error);
          });
      });
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage de la caméra:', error);
      
      // Si c'est un problème de permissions, donner un message explicite
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          throw new Error('Accès à la caméra refusé. Veuillez autoriser l\'accès dans votre navigateur.');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          throw new Error('Aucune caméra trouvée sur cet appareil.');
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          throw new Error('Caméra déjà utilisée par une autre application.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Arrête la caméra et libère les ressources
   */
  public stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  /**
   * Capture une image à partir de la vidéo
   * @param videoElement - L'élément vidéo source
   * @param canvasElement - L'élément canvas pour le rendu
   * @param quality - Qualité de l'image (0.0 à 1.0)
   * @returns Promise<CaptureResult>
   */
  public async captureImage(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    quality: number = 0.8
  ): Promise<CaptureResult> {
    return new Promise((resolve) => {
      try {
        const context = canvasElement.getContext('2d');
        
        if (!context) {
          resolve({ file: null, error: 'Contexte 2D non disponible' });
          return;
        }

        // Vérifier que la vidéo a des dimensions valides
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
          resolve({ file: null, error: 'Vidéo pas encore prête' });
          return;
        }

        // Définir les dimensions du canvas
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;

        // Dessiner l'image de la vidéo sur le canvas
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

        // Convertir le canvas en Blob puis en File
        canvasElement.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
            resolve({ file, error: undefined });
          } else {
            resolve({ file: null, error: 'Impossible de créer le fichier image' });
          }
        }, 'image/jpeg', quality);
        
      } catch (error) {
        resolve({ 
          file: null, 
          error: error instanceof Error ? error.message : 'Erreur inconnue lors de la capture' 
        });
      }
    });
  }

  /**
   * Effectue un compte à rebours avant la capture
   * @param config - Configuration du compte à rebours
   * @returns Promise<void>
   */
  public async countdown(config: CountdownConfig): Promise<void> {
    const { duration, onTick, onComplete } = config;
    
    for (let i = duration; i > 0; i--) {
      onTick?.(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    onComplete?.();
  }

  /**
   * Séquence complète : compte à rebours + capture
   * @param videoElement - L'élément vidéo source
   * @param canvasElement - L'élément canvas pour le rendu
   * @param countdownConfig - Configuration du compte à rebours
   * @param captureQuality - Qualité de capture (optionnel)
   * @returns Promise<CaptureResult>
   */
  public async countdownAndCapture(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    countdownConfig: CountdownConfig,
    captureQuality: number = 0.8
  ): Promise<CaptureResult> {
    // Effectuer le compte à rebours
    await this.countdown(countdownConfig);
    
    // Petite pause pour l'effet visuel
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Capturer l'image
    return this.captureImage(videoElement, canvasElement, captureQuality);
  }

  /**
   * Vérifie si la caméra est disponible sur l'appareil
   * @returns Promise<boolean>
   */
  public async isCameraAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch {
      return false;
    }
  }

  /**
   * Obtient la liste des caméras disponibles
   * @returns Promise<MediaDeviceInfo[]>
   */
  public async getAvailableCameras(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch {
      return [];
    }
  }

  /**
   * Obtient le stream actuel de la caméra
   * @returns MediaStream | null
   */
  public getCurrentStream(): MediaStream | null {
    return this.stream;
  }

  /**
   * Vérifie si la caméra est actuellement active
   * @returns boolean
   */
  public isActive(): boolean {
    return this.stream !== null && this.stream.active;
  }
}

// Export d'une instance singleton
export const cameraService = new CameraService();
