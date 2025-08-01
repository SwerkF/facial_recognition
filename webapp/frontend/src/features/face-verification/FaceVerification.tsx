import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle, XCircle, RotateCcw, User, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { useCreateFaceVerification } from '../../api/queries/faceVerificationQueries';
import { cameraService } from '@/services/cameraService';

// Types
interface VerificationResult {
  success: boolean;
  message: string;
  processingTime?: number;
  confidence?: number;
  percentage?: string;
}

type AnalysisMode = 'camera' | 'upload';

const FaceVerification: React.FC = () => {
  // États
  const [mode, setMode] = useState<AnalysisMode>('camera');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasTriggeredCaptureRef = useRef(false);

  // React Query hook
  const { mutateAsync: createFaceVerification } = useCreateFaceVerification();

  // Démarrer la caméra
  const startCamera = useCallback(async () => {
    console.log('🔍 Vérification de la référence vidéo...', { 
      videoRef: !!videoRef.current
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
  }, []);

  // Arrêter la caméra
  const stopCamera = useCallback(() => {
    cameraService.stopCamera();
  }, []);

  // Commencer l'analyse
  const handleStartAnalysis = useCallback(() => {
    console.log('🎯 Début de l\'identification de Damien');
    setIsStarted(true);
    hasTriggeredCaptureRef.current = false;
    
    if (mode === 'upload') {
      // En mode upload, ouvrir directement le sélecteur de fichier
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
    }
    // En mode caméra, la caméra sera démarrée par l'useEffect ci-dessous
  }, [mode]);

  // Gérer la sélection de fichier
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setVerificationResult({
          success: false,
          message: 'Format de fichier non supporté. Utilisez JPG, PNG ou WebP.',
          processingTime: 0
        });
        return;
      }

      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setVerificationResult({
          success: false,
          message: 'Fichier trop volumineux. Maximum 10MB.',
          processingTime: 0
        });
        return;
      }

      setUploadedImage(file);
      setIsAnalyzing(true);
      setAnalysisProgress(10);
      
      // Démarrer l'analyse avec un petit délai pour l'effet visuel
      setTimeout(() => {
        performAnalysis(file);
      }, 500);
    }
  }, []);

  // Gérer le déclenchement de l'upload
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Helper pour créer un résultat d'erreur
  const createErrorResult = useCallback((message: string): VerificationResult => ({
    success: false,
    message,
    processingTime: 0
  }), []);

  // Démarrer le compte à rebours et capturer l'image
  const startCountdown = useCallback(async () => {
    console.log('⏰ Début countdown');
    
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
  }, [createErrorResult]);

  // Analyse après la photo
  const performAnalysis = useCallback(async (capturedImageFile: File) => {
    console.log('🔍 Analyse pour identifier Damien');

    try {
      // Préparer la requête avec seulement l'image capturée
      const request = {
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
        message: result.result === 'success' ? 'C\'est bien Damien ! 🎉' : 'Ce n\'est pas Damien 🚫',
        processingTime: Number(result.duration.toFixed(2)),
        confidence: result.confidence,
        percentage: `${(result.confidence * 100).toFixed(1)}%`
      };

      // Afficher le résultat
      setVerificationResult(uiResult);

    } catch (error) {
      console.error('Erreur lors de l\'identification:', error);
      setVerificationResult(createErrorResult('Erreur lors de l\'identification'));
    } finally {
      // Nettoyer l'état d'analyse
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [createFaceVerification, createErrorResult]);

  // Retour à l'accueil
  const handleReset = useCallback(() => {
    stopCamera();
    setIsStarted(false);
    setVerificationResult(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setCapturedImage(null);
    setUploadedImage(null);
    setCountdown(null);
    setIsCountdownActive(false);
    setIsCameraReady(false);
    setCameraError(null);
    hasTriggeredCaptureRef.current = false;
    // Reset du file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [stopCamera]);

  // Démarrage de la caméra quand on commence (seulement en mode caméra)
  useEffect(() => {
    if (isStarted && mode === 'camera' && !isCameraReady && !cameraError) {
      console.log('🎯 Démarrage de l\'identification, attente de l\'élément vidéo...');
      
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
  }, [isStarted, mode, isCameraReady, cameraError, startCamera]);

  // Auto-démarrage du compte à rebours (une seule fois)
  useEffect(() => {
    if (isStarted && isCameraReady && !isAnalyzing && !verificationResult && !isCountdownActive && !hasTriggeredCaptureRef.current) {
      console.log('🚀 Prêt à démarrer countdown');
      
      const timer = setTimeout(() => {
        hasTriggeredCaptureRef.current = true;
        startCountdown();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isStarted, isCameraReady, isAnalyzing, verificationResult, isCountdownActive, startCountdown]);

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
        {!isStarted && (
          <motion.div
            key="welcome"
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
                  Identification Damien
                </h1>
                
                {/* Sous-titre */}
                <p className="text-xl text-gray-400 max-w-lg mx-auto font-light">
                  {mode === 'camera' 
                    ? 'Prenez une photo pour vérifier si vous êtes Damien'
                    : 'Uploadez une photo pour vérifier si c\'est Damien'
                  }
                </p>
              </motion.div>

              {/* Sélecteur de mode */}
              <motion.div
                className="flex justify-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-2 backdrop-blur-xl">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setMode('camera')}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                        mode === 'camera'
                          ? 'bg-gradient-to-br from-[#ac1ed6] to-[#c26e73] text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <Camera className="h-5 w-5" />
                      <span className="font-medium">Caméra</span>
                    </button>
                    <button
                      onClick={() => setMode('upload')}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                        mode === 'upload'
                          ? 'bg-gradient-to-br from-[#ac1ed6] to-[#c26e73] text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <Upload className="h-5 w-5" />
                      <span className="font-medium">Upload</span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Section principale */}
              <motion.div
                className="bg-gray-900/60 border border-gray-700/50 rounded-3xl shadow-2xl p-10 mb-10 backdrop-blur-xl relative overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                {/* Effet de lueur subtile */}
                <div className="absolute -top-px -left-px -right-px h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
                
                <div className="text-center space-y-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-semibold mb-4">Comment ça marche ?</h3>
                    <div className="space-y-3 text-gray-300 text-lg">
                      {mode === 'camera' ? (
                        <>
                          <p>1. Cliquez sur "Commencer l'identification"</p>
                          <p>2. Positionnez-vous devant la caméra</p>
                          <p>3. L'IA analysera votre visage</p>
                          <p>4. Découvrez si vous êtes Damien ! 🤖</p>
                        </>
                      ) : (
                        <>
                          <p>1. Cliquez sur "Commencer l'identification"</p>
                          <p>2. Sélectionnez une photo depuis votre appareil</p>
                          <p>3. L'IA analysera le visage sur la photo</p>
                          <p>4. Découvrez si c'est Damien ! 🤖</p>
                        </>
                      )}
                    </div>
                  </div>
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
                  variant="modern"
                  size="xl"
                  className="px-16"
                >
                  {mode === 'camera' ? (
                    <>
                      <Camera className="mr-3 h-6 w-6" />
                      Commencer l'identification
                    </>
                  ) : (
                    <>
                      <Upload className="mr-3 h-6 w-6" />
                      Sélectionner une photo
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {isStarted && (
          <motion.div
            key="identification"
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
                  <RotateCcw className="h-5 w-5" />
                  <span>Recommencer</span>
                </button>
                
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white">
                    {verificationResult ? 'Résultat' : 'Identification en cours'}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {verificationResult ? 'Identification terminée' : 'Analyse de votre visage...'}
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
                        {mode === 'upload' ? (
                          uploadedImage && isAnalyzing ? 'Photo uploadée - Identification en cours...' :
                          uploadedImage ? 'Photo uploadée' :
                          isAnalyzing ? 'Identification en cours...' : 'Sélectionnez une photo'
                        ) : (
                          cameraError ? 'Erreur de caméra' :
                          !isCameraReady ? 'Démarrage de la caméra...' :
                          isCountdownActive ? 'Préparez-vous !' : 
                          capturedImage && isAnalyzing ? 'Photo capturée - Identification en cours...' :
                          isAnalyzing ? 'Identification en cours...' : 'Caméra en direct'
                        )}
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
                        {mode === 'camera' ? (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-80 object-cover"
                          />
                        ) : (
                          <div className="w-full h-80 flex items-center justify-center bg-gray-800">
                            {uploadedImage ? (
                              <img
                                src={URL.createObjectURL(uploadedImage)}
                                alt="Image uploadée"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-400 mb-4">Aucune image sélectionnée</p>
                                <Button
                                  onClick={handleUploadClick}
                                  variant="secondary"
                                  size="sm"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Choisir une photo
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Overlay de chargement de la caméra */}
                        {mode === 'camera' && !isCameraReady && !cameraError && (
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
                        
                        {/* Overlay de compte à rebours - coin supérieur droit */}
                        {mode === 'camera' && isCountdownActive && countdown && (
                          <motion.div
                            key={countdown}
                            initial={{ scale: 0.5, opacity: 0, x: 20, y: -20 }}
                            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/50"
                          >
                            <div className="flex flex-col items-center">
                              <div className="text-4xl font-bold text-white mb-2 drop-shadow-2xl">
                                {countdown}
                              </div>
                              <div className="text-sm text-gray-300 font-medium text-center">
                                Prêt !
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Flash de capture */}
                        {mode === 'camera' && capturedImage && !isAnalyzing && !verificationResult && isCountdownActive === false && countdown === null && (
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
                                {mode === 'camera' 
                                  ? (capturedImage ? 'Photo capturée ✓' : 'Identification en cours...') 
                                  : (uploadedImage ? 'Photo uploadée ✓' : 'Identification en cours...')
                                }
                              </div>
                              <div className="text-gray-300 text-sm">
                                {mode === 'camera' 
                                  ? 'Vérification si vous êtes Damien...' 
                                  : 'Vérification si c\'est Damien...'
                                }
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
                        
                        {/* Métriques de temps et confiance */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto mb-10">
                          <div className="bg-gray-800/50 p-6 rounded-2xl">
                            <div className="text-gray-400 text-sm mb-2">Temps d'identification</div>
                            <div className="text-white text-2xl font-bold">
                              {verificationResult.processingTime}s
                            </div>
                          </div>
                          
                          {verificationResult.percentage && (
                            <div className="bg-gray-800/50 p-6 rounded-2xl">
                              <div className="text-gray-400 text-sm mb-2">
                                {verificationResult.success ? 'Certitude Damien' : 'Certitude Non-Damien'}
                              </div>
                              <div className={`text-2xl font-bold ${
                                verificationResult.success ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {verificationResult.percentage}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <Button
                          onClick={handleReset}
                          variant="modern"
                          size="lg"
                          className="px-10"
                        >
                          <RotateCcw className="mr-3 h-5 w-5" />
                          Nouvelle identification
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Canvas caché */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Input de fichier caché */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FaceVerification;
