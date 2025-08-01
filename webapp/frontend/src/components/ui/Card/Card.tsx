import type React from 'react';

import { type HTMLMotionProps, motion } from 'framer-motion';

interface CardProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<'div'>>,
        HTMLMotionProps<'div'> {
    children: React.ReactNode;
    maxWidth?: string;
    padding?: string;
    variant?: 'default' | 'glass' | 'gradient' | 'modern' | 'chat';
    initialAnimation?: HTMLMotionProps<'div'>['initial'];
    animateAnimation?: HTMLMotionProps<'div'>['animate'];
    transitionDuration?: number;
}

export const Card: React.FC<CardProps> = ({
    children,
    maxWidth = 'max-w-md',
    padding = 'p-8',
    variant = 'default',
    initialAnimation = { opacity: 0, y: 20 },
    animateAnimation = { opacity: 1, y: 0 },
    transitionDuration = 0.5,
    className = '',
    ...props
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return 'bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl';
            case 'gradient':
                return 'bg-gradient-to-br from-[#ac1ed6]/10 via-purple-600/5 to-[#c26e73]/10 border border-purple-400/20 shadow-xl shadow-purple-500/10 backdrop-blur-xl';
            case 'modern':
                return 'bg-gray-900/90 border border-gray-700/50 shadow-2xl backdrop-blur-sm';
            case 'chat':
                return 'bg-gradient-to-br from-[#ac1ed6] to-[#c26e73] shadow-lg shadow-purple-500/25';
            default:
                return 'bg-gray-900/80 border border-gray-700/50 shadow-xl backdrop-blur-sm';
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#090607] via-[#221f20] to-[#090607] p-4 relative overflow-hidden">
            {/* Gradient de fond subtil */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ac1ed6]/5 via-transparent to-[#c26e73]/5"></div>
            
            {/* Particules flottantes subtiles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-pink-400 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full opacity-50 animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-pink-300 rounded-full opacity-30 animate-pulse" style={{animationDelay: '3s'}}></div>
            </div>

            <motion.div
                initial={initialAnimation}
                animate={animateAnimation}
                transition={{ duration: transitionDuration, ease: "easeOut" }}
                className={`${maxWidth} w-full space-y-6 ${padding} ${getVariantStyles()} rounded-3xl relative overflow-hidden ${className}`}
                {...props}
            >
                {/* Contenu */}
                <div className="relative z-10">
                    {children}
                </div>

                {/* Effet de lueur subtile sur les bords */}
                <div className="absolute -top-px -left-px -right-px h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
                <div className="absolute -bottom-px -left-px -right-px h-px bg-gradient-to-r from-transparent via-pink-400/50 to-transparent"></div>
            </motion.div>
        </div>
    );
};
