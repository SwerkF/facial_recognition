import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, CheckCircle, XCircle, RotateCcw, ArrowLeft, User, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { FileUpload } from '../../components/ui/FileUpload/FileUpload';
import { useCreateFaceVerification } from '../../api/queries/faceVerificationQueries';
import { cameraService } from '@/services/cameraService';

// Types
interface VerificationResult {
  success: boolean;
  message: string;
  processingTime?: number;
}

// État de l'application
type Step = 'upload' | 'verification';

const FaceVerification: React.FC = () => {
  // États
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasTriggeredCaptureRef = useRef(false);

  // React Query hook
  const { mutateAsync: createFaceVerification } = useCreateFaceVerification();

  // Gestion de l'upload d'image
  const handleImageUpload = useCallback((file: File | null) => {
    setUploadedImage(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, []);

  // Démarrer la caméra
  const startCamera = useCallback(async () => {
    console.log('🔍 Vérification de la référence vidéo...', { 
      videoRef: !!videoRef.current, 
      currentStep 
    });
    
    if (!videoRef.current) {
      console.error('❌ Référence vidéo non disponible');
      setCameraError('Élément vidéo non disponible');
      return;
    }

    try {
      setCameraError(null);
      setIsCameraReady(false);
      
      console.log('🚀 Début de démarrage caméra');
      const stream = await cameraService.startCamera(videoRef.current);
      
      setIsCameraReady(true);
      console.log('✅ Caméra prête !');
      
    } catch (error) {
      console.error('❌ Erreur caméra:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setCameraError(errorMessage);
      setIsCameraReady(false);
    }
  }, [currentStep]);

  // Arrêter la caméra
  const stopCamera = useCallback(() => {
    cameraService.stopCamera();
  }, []);

  // Commencer l'analyse
  const handleStartAnalysis = useCallback(() => {
    console.log('🎯 Début analyse avec image:', { 
      hasImage: !!uploadedImage, 
      name: uploadedImage?.name 
    });
    
    if (!uploadedImage) {
      console.error('❌ Pas d\'image uploadée');
      return;
    }
    
    setCurrentStep('verification');
    hasTriggeredCaptureRef.current = false;
    // La caméra sera démarrée par l'useEffect ci-dessous
  }, [uploadedImage]);

  // Helper pour créer un résultat d'erreur
  const createErrorResult = useCallback((message: string): VerificationResult => ({
    success: false,
    message,
    processingTime: 0
  }), []);

  // Démarrer le compte à rebours et capturer l'image
  const startCountdown = useCallback(async () => {
    console.log('⏰ Début countdown avec image uploadée:', {
      hasUploadedImage: !!uploadedImage,
      hasVideo: !!videoRef.current,
      hasCanvas: !!canvasRef.current
    });
    
    // Vérifier les références nécessaires
    if (!videoRef.current || !canvasRef.current) {
      setVerificationResult(createErrorResult('Caméra non disponible'));
      return;
    }

    setIsCountdownActive(true);

    try {
      const result = await cameraService.countdownAndCapture(
        videoRef.current,
        canvasRef.current,
        {
          duration: 3,
          onTick: setCountdown,
          onComplete: () => {
            setCountdown(null);
            setIsCountdownActive(false);
          }
        }
      );

      if (!result.file) {
        setVerificationResult(createErrorResult(result.error || 'Impossible de capturer l\'image de la caméra'));
        return;
      }

      // Configurer l'analyse
      setCapturedImage(result.file);
      setIsAnalyzing(true);
      setAnalysisProgress(10);
      
      // Effet visuel avant l'analyse
      await new Promise(resolve => setTimeout(resolve, 300));
      performAnalysis(result.file);

    } catch (error) {
      setVerificationResult(createErrorResult('Erreur lors de la capture'));
    }
  }, [createErrorResult, uploadedImage]);

  // Analyse après la photo
  const performAnalysis = useCallback(async (capturedImageFile: File) => {
    console.log('🔍 État uploadedImage:', { 
      uploadedImage: !!uploadedImage, 
      name: uploadedImage?.name, 
      size: uploadedImage?.size 
    });
    
    if (!uploadedImage) {
      console.error('❌ Aucune image de référence disponible');
      setVerificationResult(createErrorResult('Aucune image de référence disponible'));
      return;
    }

    try {
      // Préparer la requête avec les deux images
      const request = {
        referenceImage: uploadedImage,
        uploadedImage: capturedImageFile
      };
      
      setAnalysisProgress(30);

      // Vérifier que la fonction createFaceVerification existe
      if (!createFaceVerification) {
        throw new Error('La fonction createFaceVerification n\'est pas disponible');
      }
      
      const result = await createFaceVerification(request);

      setAnalysisProgress(100);

      // Convertir le résultat de l'API au format attendu par l'UI
      const uiResult: VerificationResult = {
        success: result.result === 'success',
        message: result.result === 'success' ? 'Identité vérifiée' : 'Échec de la vérification',
        processingTime: Number(result.duration.toFixed(2))
      };

      // Afficher le résultat
      setVerificationResult(uiResult);

    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setVerificationResult(createErrorResult('Erreur lors de la vérification'));
    } finally {
      // Nettoyer l'état d'analyse
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [uploadedImage, createFaceVerification, createErrorResult]);

  // Retour à l'accueil
  const handleReset = useCallback(() => {
    stopCamera();
    setCurrentStep('upload');
    setUploadedImage(null);
    setImagePreview(null);
    setVerificationResult(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setCapturedImage(null);
    setCountdown(null);
    setIsCountdownActive(false);
    setIsCameraReady(false);
    setCameraError(null);
    hasTriggeredCaptureRef.current = false;
  }, [stopCamera]);

  // Démarrage de la caméra quand on arrive sur l'étape verification
  useEffect(() => {
    if (currentStep === 'verification' && !isCameraReady && !cameraError) {
      console.log('🎯 Étape verification atteinte, attente de l\'élément vidéo...');
      
      // Vérifier plusieurs fois que l'élément vidéo est disponible
      let attempts = 0;
      const maxAttempts = 10;
      
      const checkAndStartCamera = () => {
        attempts++;
        console.log(`🔄 Tentative ${attempts}/${maxAttempts} - Élément vidéo:`, !!videoRef.current);
        
        if (videoRef.current) {
          console.log('✅ Élément vidéo trouvé, démarrage caméra...');
          startCamera();
        } else if (attempts < maxAttempts) {
          console.log('⏳ Élément vidéo pas encore prêt, nouvelle tentative dans 200ms...');
          setTimeout(checkAndStartCamera, 200);
        } else {
          console.error('❌ Impossible de trouver l\'élément vidéo après 10 tentatives');
          setCameraError('Élément vidéo non trouvé');
        }
      };
      
      // Première vérification après 100ms
      const timer = setTimeout(checkAndStartCamera, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, isCameraReady, cameraError, startCamera]);

  // Auto-démarrage du compte à rebours (une seule fois)
  useEffect(() => {
    if (currentStep === 'verification' && isCameraReady && !isAnalyzing && !verificationResult && !isCountdownActive && !hasTriggeredCaptureRef.current) {
      console.log('🚀 Prêt à démarrer countdown - Image uploadée:', {
        hasImage: !!uploadedImage,
        name: uploadedImage?.name
      });
      
      const timer = setTimeout(() => {
        hasTriggeredCaptureRef.current = true;
        startCountdown();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, isCameraReady, isAnalyzing, verificationResult, isCountdownActive, startCountdown, uploadedImage]);

  // Nettoyage
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090607] via-[#221f20] to-[#090607] relative overflow-hidden">
      {/* Gradient de fond subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ac1ed6]/10 via-transparent to-[#c26e73]/10"></div>
      
      {/* Particules flottantes subtiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="w-full max-w-2xl">
              {/* Header moderne */}
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                {/* Logo principal */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-[#ac1ed6] to-[#c26e73] rounded-3xl p-6 shadow-2xl shadow-purple-500/25">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>

                {/* Titre principal */}
                <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                  Face Recognition
                </h1>
                
                {/* Sous-titre */}
                <p className="text-xl text-gray-400 max-w-lg mx-auto font-light">
                  Téléchargez votre photo pour commencer l'analyse
                </p>
              </motion.div>

              {/* Section d'upload principale */}
              <motion.div
                className="bg-gray-900/60 border border-gray-700/50 rounded-3xl shadow-2xl p-10 mb-10 backdrop-blur-xl relative overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                {/* Effet de lueur subtile */}
                <div className="absolute -top-px -left-px -right-px h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
                
                <div className="space-y-8">
                  {!imagePreview ? (
                    <FileUpload
                      label="Sélectionnez votre photo"
                      accept="image/*"
                      maxSize={10}
                      onFileChange={handleImageUpload}
                      value={uploadedImage}
                      modernStyle={true}
                    />
                  ) : (
                    <div>
                      <label className="mb-4 block text-xl font-semibold text-white text-center">
                        Votre photo
                      </label>
                      <div className="relative max-w-md mx-auto">
                        <div className="relative rounded-3xl overflow-hidden border border-purple-400/30 shadow-2xl bg-gray-900/50 backdrop-blur-sm">
                          <img
                            src={imagePreview}
                            alt="Photo sélectionnée"
                            className="w-full h-80 object-cover"
                          />
                          
                          {/* Overlay subtil */}
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-purple-900/20"></div>
                          
                          {/* Indicateur de succès */}
                          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-green-900/80 px-3 py-2 rounded-full border border-green-400/50 backdrop-blur-sm">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-400 text-xs font-medium">Photo prête</span>
                          </div>

                          {/* Bouton pour changer la photo */}
                          <div className="absolute bottom-4 left-4">
                            <button
                              onClick={() => handleImageUpload(null)}
                              className="flex items-center space-x-2 bg-gray-900/80 px-3 py-2 rounded-full border border-gray-600/50 backdrop-blur-sm hover:bg-gray-800/80 transition-colors text-gray-300 hover:text-white"
                            >
                              <Upload className="h-4 w-4" />
                              <span className="text-xs font-medium">Changer</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Bouton d'action moderne - centré */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Button
                  onClick={handleStartAnalysis}
                  disabled={!uploadedImage}
                  variant="modern"
                  size="xl"
                  className={`px-16 ${!uploadedImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Camera className="mr-3 h-6 w-6" />
                  Commencer l'analyse
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {currentStep === 'verification' && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="w-full max-w-4xl">
              {/* Header de contrôle */}
              <motion.div 
                className="flex items-center justify-between mb-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors bg-gray-900/50 px-4 py-2 rounded-2xl border border-gray-600/30 backdrop-blur-sm hover:bg-gray-800/60"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Retour</span>
                </button>
                
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white">
                    {verificationResult ? 'Résultat' : 'Vérification faciale'}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {verificationResult ? 'Vérification terminée' : 'Comparaison des images en cours...'}
                  </p>
                </div>
                
                <div className="w-24"></div>
              </motion.div>

              {/* Caméra ou Résultat - centré */}
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <AnimatePresence mode="wait">
                  {!verificationResult ? (
                    /* Caméra en direct */
                    <motion.div
                      key="camera"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-900/60 border border-gray-700/50 rounded-3xl shadow-2xl p-8 backdrop-blur-xl"
                    >
                      <h3 className="text-xl font-semibold text-white mb-6 text-center">
                        {cameraError ? 'Erreur de caméra' :
                         !isCameraReady ? 'Démarrage de la caméra...' :
                         isCountdownActive ? 'Préparez-vous !' : 
                         capturedImage && isAnalyzing ? 'Photo capturée - Analyse en cours...' :
                         isAnalyzing ? 'Analyse en cours...' : 'Caméra en direct'}
                      </h3>
                      
                      {cameraError && (
                        <div className="mb-4 p-4 bg-red-900/50 border border-red-500/50 rounded-2xl text-center">
                          <div className="flex items-center justify-center mb-2">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                            <span className="text-red-400 font-medium">Problème de caméra</span>
                          </div>
                          <p className="text-red-300 text-sm mb-3">{cameraError}</p>
                          <Button
                            onClick={startCamera}
                            variant="secondary"
                            size="sm"
                            className="mx-auto"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Réessayer
                          </Button>
                        </div>
                      )}
                      <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-600/50">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-80 object-cover"
                        />
                        
                        {/* Overlay de chargement de la caméra */}
                        {!isCameraReady && !cameraError && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
                            <div className="text-center">
                              <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                              <div className="text-white text-lg font-medium">
                                Démarrage de la caméra...
                              </div>
                              <div className="text-gray-300 text-sm mt-2">
                                Autorisation en cours
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Overlay de compte à rebours */}
                        {isCountdownActive && countdown && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                            <motion.div
                              key={countdown}
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 1.5, opacity: 0 }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="flex flex-col items-center"
                            >
                              <div className="text-8xl font-bold text-white mb-4 drop-shadow-2xl">
                                {countdown}
                              </div>
                              <div className="text-xl text-gray-300 font-medium">
                                Regardez la caméra
                              </div>
                            </motion.div>
                          </div>
                        )}
                        
                        {/* Flash de capture */}
                        {capturedImage && !isAnalyzing && !verificationResult && isCountdownActive === false && countdown === null && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-white/30"
                          />
                        )}
                        
                        {/* Overlay d'analyse */}
                        {isAnalyzing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-sm">
                            <div className="text-center">
                              <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                              <div className="text-white text-lg font-medium mb-2">
                                {capturedImage ? 'Photo capturée ✓' : 'Analyse en cours...'}
                              </div>
                              <div className="text-gray-300 text-sm">
                                Vérification de l'identité en cours...
                              </div>
                              {analysisProgress > 0 && (
                                <div className="mt-4 w-48 mx-auto">
                                  <div className="text-xs text-gray-400 mb-1">Progression: {analysisProgress}%</div>
                                  <div className="w-full bg-gray-700 rounded-full h-1">
                                    <div 
                                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-1 rounded-full transition-all duration-500"
                                      style={{ width: `${analysisProgress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Barre de progression sous la caméra */}
                      {isAnalyzing && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-[#ac1ed6] to-[#c26e73] h-1 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${analysisProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    /* Résultat final */
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`bg-gray-900/80 border-2 rounded-3xl shadow-2xl p-12 backdrop-blur-xl ${
                        verificationResult.success 
                          ? 'border-green-400/50' 
                          : 'border-red-400/50'
                      }`}
                    >
                      <div className="text-center">
                        {/* Icône de résultat */}
                        <div className="flex items-center justify-center mb-8">
                          <div className={`rounded-full p-6 ${
                            verificationResult.success 
                              ? 'bg-green-500/20 border-2 border-green-400/50' 
                              : 'bg-red-500/20 border-2 border-red-400/50'
                          }`}>
                            {verificationResult.success ? (
                              <CheckCircle className="h-16 w-16 text-green-400" />
                            ) : (
                              <XCircle className="h-16 w-16 text-red-400" />
                            )}
                          </div>
                        </div>
                        
                        {/* Message principal */}
                        <h3 className={`text-4xl font-bold mb-6 ${
                          verificationResult.success ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {verificationResult.message}
                        </h3>
                        
                        {/* Métrique de temps uniquement */}
                        <div className="max-w-sm mx-auto mb-10">
                          <div className="bg-gray-800/50 p-6 rounded-2xl">
                            <div className="text-gray-400 text-sm mb-2">Temps de traitement</div>
                            <div className="text-white text-3xl font-bold">
                              {verificationResult.processingTime}s
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <Button
                          onClick={handleReset}
                          variant="modern"
                          size="lg"
                          className="px-10"
                        >
                          <RotateCcw className="mr-3 h-5 w-5" />
                          Nouvelle analyse
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Canvas caché */}
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FaceVerification;
