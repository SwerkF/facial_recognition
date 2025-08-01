import React from 'react';

import { HTMLMotionProps, motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'gradient' | 'modern';

interface ButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<'button'>>,
        HTMLMotionProps<'button'> {
    variant?: ButtonVariant;
    isLoading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25',
    secondary: 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 border border-gray-600/50 backdrop-blur-sm',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white shadow-lg shadow-red-500/25',
    success: 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white shadow-lg shadow-emerald-500/25',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25',
    ghost: 'bg-transparent hover:bg-gray-800/20 text-gray-400 hover:text-white border border-transparent hover:border-gray-600/30',
    gradient: 'bg-gradient-to-r from-[#ac1ed6] to-[#c26e73] hover:from-[#9a1bc2] hover:to-[#b05d67] text-white shadow-lg shadow-purple-500/30',
    modern: 'bg-gradient-to-br from-[#ac1ed6] via-purple-600 to-[#c26e73] hover:scale-[1.02] text-white shadow-xl shadow-purple-500/25 border border-purple-400/20',
};

const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-12 py-5 text-xl',
};

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText = 'Chargement...',
    disabled,
    className = '',
    ...props
}) => {
    const baseStyle =
        'group relative flex justify-center items-center font-medium rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 ease-out backdrop-blur-sm';
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];
    const disabledStyle = 'opacity-50 cursor-not-allowed';

    return (
        <motion.button
            whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
            disabled={disabled || isLoading}
            className={`${baseStyle} ${variantStyle} ${sizeStyle} ${disabled || isLoading ? disabledStyle : ''} ${className}`}
            {...props}
        >
            {/* Effet de lueur subtile */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {isLoading && (
                <div className="flex items-center mr-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                </div>
            )}
            
            <span className="relative z-10 flex items-center justify-center">
                {isLoading ? loadingText : children}
            </span>
        </motion.button>
    );
};
