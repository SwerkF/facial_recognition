import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  Image, 
  Camera,
  Users,
  Activity,
} from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { useGetAllFaceVerifications } from '../../api/queries/faceVerificationQueries';
import { ImageType, VerificationResult } from '@shared/enums/verificationEnums';
import type { FaceVerificationDto, FaceVerificationQueryDto } from '@shared/dto/faceVerificationDto';

// Types pour l'interface admin
interface FilterState {
  result?: VerificationResult;
  imageType?: ImageType;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

const AdminFaceVerification: React.FC = () => {// États
  const [filters, setFilters] = useState<FilterState>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [selectedVerification, setSelectedVerification] = useState<FaceVerificationDto | null>(null);

  // Préparer les paramètres de requête
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
    };
    
    if (filters.searchTerm) {
      params.search = filters.searchTerm;
    }
    
    if (filters.imageType) {
      params.imageType = filters.imageType;
    }
    
    return params;
  }, [currentPage, pageSize, filters]);

  // Récupérer les données
  const { data: verifications = [], isLoading, error } = useGetAllFaceVerifications(queryParams);

  // Statistiques rapides
  const stats = useMemo(() => {
    const total = verifications.length;
    const successful = verifications.filter(v => v.result === VerificationResult.success).length;
    const failed = verifications.filter(v => v.result === VerificationResult.failure).length;
    const pending = verifications.filter(v => v.result === VerificationResult.pending).length;
    const avgDuration = total > 0 ? (verifications.reduce((sum, v) => sum + v.duration, 0) / total).toFixed(2) : '0';

    return { total, successful, failed, pending, avgDuration };
  }, [verifications]);



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultIcon = (result: VerificationResult) => {
    switch (result) {
      case VerificationResult.success:
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case VerificationResult.failure:
        return <XCircle className="h-5 w-5 text-red-400" />;
      case VerificationResult.pending:
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getResultColor = (result: VerificationResult) => {
    switch (result) {
      case VerificationResult.success:
        return 'border-green-400/50 bg-green-500/10';
      case VerificationResult.failure:
        return 'border-red-400/50 bg-red-500/10';
      case VerificationResult.pending:
        return 'border-yellow-400/50 bg-yellow-500/10';
      default:
        return 'border-gray-400/50 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090607] via-[#221f20] to-[#090607] relative overflow-hidden">
      {/* Gradient de fond subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ac1ed6]/10 via-transparent to-[#c26e73]/10"></div>
      
      {/* Particules flottantes subtiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
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

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-[#ac1ed6] to-[#c26e73] rounded-2xl p-3 shadow-2xl shadow-purple-500/25">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Administration des Vérifications
                </h1>
                <p className="text-gray-400 text-lg">
                  Suivi et analyse des vérifications faciales
                </p>
              </div>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-4 backdrop-blur-xl"
            >
              <div className="flex items-center space-x-3">
                <Activity className="h-6 w-6 text-purple-400" />
                <div>
                  <div className="text-gray-400 text-sm">Total</div>
                  <div className="text-white text-2xl font-bold">{stats.total}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-gray-900/60 border border-green-400/30 rounded-2xl p-4 backdrop-blur-xl"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <div>
                  <div className="text-gray-400 text-sm">Succès</div>
                  <div className="text-green-400 text-2xl font-bold">{stats.successful}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-gray-900/60 border border-red-400/30 rounded-2xl p-4 backdrop-blur-xl"
            >
              <div className="flex items-center space-x-3">
                <XCircle className="h-6 w-6 text-red-400" />
                <div>
                  <div className="text-gray-400 text-sm">Échecs</div>
                  <div className="text-red-400 text-2xl font-bold">{stats.failed}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-gray-900/60 border border-yellow-400/30 rounded-2xl p-4 backdrop-blur-xl"
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
                <div>
                  <div className="text-gray-400 text-sm">En attente</div>
                  <div className="text-yellow-400 text-2xl font-bold">{stats.pending}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-gray-900/60 border border-blue-400/30 rounded-2xl p-4 backdrop-blur-xl"
            >
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-blue-400" />
                <div>
                  <div className="text-gray-400 text-sm">Temps moyen</div>
                  <div className="text-blue-400 text-2xl font-bold">{stats.avgDuration}s</div>
                </div>
              </div>
            </motion.div>
          </div>


        </motion.div>

        {/* Contenu principal */}
        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-white text-lg font-medium">
                  Chargement des vérifications...
                </div>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="text-red-400 text-lg">
                Erreur lors du chargement des données
              </div>
            </motion.div>
          ) : verifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="text-gray-400 text-lg">
                Aucune vérification trouvée
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {verifications.map((verification, index) => (
                <motion.div
                  key={`${verification.createdAt}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`bg-gray-900/60 border rounded-2xl shadow-xl p-4 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 ${getResultColor(verification.result)}`}
                  onClick={() => setSelectedVerification(verification)}
                >
                  {/* Header de la carte */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getResultIcon(verification.result)}
                      <span className="text-sm font-medium text-gray-300 capitalize">
                        {verification.result}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      {verification.imageType === ImageType.captured ? (
                        <Camera className="h-4 w-4" />
                      ) : (
                        <Image className="h-4 w-4" />
                      )}
                      <span className="capitalize">{verification.imageType}</span>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="relative">
                      <img
                        src={verification.referenceImageUrl}
                        alt="Image de référence"
                        className="w-full h-24 object-cover rounded-xl border border-gray-600/30"
                      />
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                        Référence
                      </div>
                    </div>
                    <div className="relative">
                      <img
                        src={verification.uploadedImageUrl}
                        alt="Image capturée"
                        className="w-full h-24 object-cover rounded-xl border border-gray-600/30"
                      />
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                        Capturée
                      </div>
                    </div>
                  </div>

                  {/* Métadonnées */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>Durée</span>
                      </div>
                      <span className="text-white font-medium">{verification.duration.toFixed(2)}s</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Date</span>
                      </div>
                      <span className="text-white font-medium text-xs">
                        {formatDate(verification.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de détail */}
        <AnimatePresence>
          {selectedVerification && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setSelectedVerification(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`bg-gray-900/90 border-2 rounded-3xl shadow-2xl p-8 backdrop-blur-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${getResultColor(selectedVerification.result)}`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header du modal */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    {getResultIcon(selectedVerification.result)}
                    <div>
                      <h3 className="text-2xl font-bold text-white capitalize">
                        Vérification {selectedVerification.result}
                      </h3>
                      <p className="text-gray-400">
                        {formatDate(selectedVerification.createdAt)}
                      </p>
                    </div>
                  </div>
                                     <Button
                     onClick={() => setSelectedVerification(null)}
                     variant="ghost"
                     size="sm"
                     className="text-gray-300"
                   >
                     Fermer
                   </Button>
                </div>

                {/* Images en grand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-white mb-4">Image de référence</h4>
                    <div className="relative rounded-2xl overflow-hidden border border-gray-600/50">
                      <img
                        src={selectedVerification.referenceImageUrl}
                        alt="Image de référence"
                        className="w-full h-80 object-cover"
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Image {selectedVerification.imageType === ImageType.captured ? 'capturée' : 'téléchargée'}
                    </h4>
                    <div className="relative rounded-2xl overflow-hidden border border-gray-600/50">
                      <img
                        src={selectedVerification.uploadedImageUrl}
                        alt="Image capturée"
                        className="w-full h-80 object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Détails de la vérification */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-800/50 p-6 rounded-2xl">
                    <div className="text-gray-400 text-sm mb-2">Résultat</div>
                    <div className={`text-2xl font-bold capitalize ${
                      selectedVerification.result === VerificationResult.success ? 'text-green-400' :
                      selectedVerification.result === VerificationResult.failure ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {selectedVerification.result}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-6 rounded-2xl">
                    <div className="text-gray-400 text-sm mb-2">Durée de traitement</div>
                    <div className="text-white text-2xl font-bold">
                      {selectedVerification.duration.toFixed(2)}s
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-6 rounded-2xl">
                    <div className="text-gray-400 text-sm mb-2">Type d'image</div>
                    <div className="text-white text-2xl font-bold capitalize">
                      {selectedVerification.imageType === ImageType.captured ? 'Capturée' : 'Téléchargée'}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminFaceVerification;
