import { Fragment, useId } from 'react';
import { toast } from 'react-toastify';

import { ImageDown, Upload, Scan } from 'lucide-react';

interface FileUploadProps {
    label: string;
    accept?: string;
    maxSize?: number;
    buttonOnly?: boolean;
    onFileChange: (file: File | null) => void;
    error?: string;
    value?: File | null;
    buttonText?: string;
    buttonClassName?: string;
    modernStyle?: boolean;
}

export const FileUpload = ({
    label,
    accept = 'image/*',
    maxSize = 10,
    onFileChange,
    buttonOnly = false,
    error,
    value,
    buttonText = 'Télécharger un fichier',
    buttonClassName = 'bg-gradient-to-r from-[#ac1ed6] to-[#c26e73] hover:from-[#9a1bc2] hover:to-[#b05d67] text-white px-6 py-3 rounded-2xl cursor-pointer transition-all duration-300 shadow-lg shadow-purple-500/25 backdrop-blur-sm',
    modernStyle = true,
}: FileUploadProps) => {
    const fileId = useId();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            onFileChange(null);
            return;
        }

        if (!file.type.match(accept)) {
            toast.error(`Type de fichier non supporté. Veuillez uploader un fichier ${accept}`);
            return;
        }

        // Vérification de la taille du fichier (en MB)
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > maxSize) {
            toast.error(`Fichier trop volumineux. La taille maximale est de ${maxSize} MB.`);
            return;
        }

        onFileChange(file);
    };

    if (buttonOnly) {
        return (
            <Fragment>
                <label htmlFor={fileId} className={buttonClassName}>
                    <Upload className="mr-2 h-5 w-5" />
                    {buttonText}
                </label>
                <input
                    id={fileId}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileChange}
                    data-testid="file-input"
                />
            </Fragment>
        );
    }

    if (modernStyle) {
        return (
            <Fragment>
                <label className="mb-4 block text-xl font-semibold text-white">
                    {label}
                </label>
                <div className="flex w-full items-center justify-center">
                    <label
                        htmlFor={fileId}
                        className="group flex h-72 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-purple-400/40 bg-gray-900/40 backdrop-blur-sm hover:border-purple-400/60 hover:bg-gray-800/50 transition-all duration-300 relative overflow-hidden"
                    >
                        {/* Effet de gradient subtil */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#ac1ed6]/5 via-transparent to-[#c26e73]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="flex flex-col items-center justify-center pb-6 pt-5 relative z-10">
                            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                                <ImageDown className="h-12 w-12 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                            </div>
                            
                            <p className="mb-2 text-lg text-gray-200 font-medium">
                                <span className="font-semibold text-white">Cliquez pour télécharger</span> ou
                            </p>
                            <p className="text-sm text-gray-400 mb-4">
                                glisser-déposer votre fichier
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm">
                                <span>
                                    {accept === 'image/*' ? "Image" : "Fichier"} jusqu'à {maxSize}MB
                                </span>
                            </div>
                        </div>

                        <input
                            id={fileId}
                            type="file"
                            className="hidden"
                            accept={accept}
                            onChange={handleFileChange}
                            data-testid="file-input"
                        />
                    </label>
                </div>
                {value && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-[#ac1ed6]/10 to-[#c26e73]/10 border border-purple-400/30 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                            <span className="text-purple-300 font-medium">Fichier sélectionné:</span>
                            <span className="text-white">{value.name}</span>
                        </div>
                        <div className="mt-3 w-full bg-gray-700/50 rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-[#ac1ed6] to-[#c26e73] h-1.5 rounded-full w-full animate-pulse"></div>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-2xl backdrop-blur-sm">
                        <p className="text-sm text-red-400 flex items-center">
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse"></div>
                            {error}
                        </p>
                    </div>
                )}
            </Fragment>
        );
    }

    // Style classique pour fallback
    return (
        <Fragment>
            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex w-full items-center justify-center">
                <label
                    htmlFor={fileId}
                    className="flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                >
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                        <ImageDown strokeWidth={1.25} className="mb-4 h-8 w-8 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Cliquez pour télécharger</span> ou
                            glisser-déposer
                        </p>
                        <p className="text-xs text-gray-500">
                            {accept === 'image/*' ? "Image jusqu'à" : "Fichier jusqu'à"} {maxSize}MB
                        </p>
                    </div>
                    <input
                        id={fileId}
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleFileChange}
                        data-testid="file-input"
                    />
                </label>
            </div>
            {value && (
                <div className="mt-2 text-center text-sm text-gray-500">
                    Fichier sélectionné: {value.name}
                </div>
            )}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </Fragment>
    );
};
