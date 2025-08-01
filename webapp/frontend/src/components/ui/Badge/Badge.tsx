import type React from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    rounded?: boolean;
    withDot?: boolean;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-indigo-100 text-indigo-800',
};

const sizeClasses: Record<BadgeSize, string> = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
};

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    rounded = false,
    withDot = false,
    className = '',
}) => {
    const baseClasses = 'inline-flex items-center font-medium';
    const variantClass = variantClasses[variant];
    const sizeClass = sizeClasses[size];
    const roundedClass = rounded ? 'rounded-full' : 'rounded';

    return (
        <span
            className={`${baseClasses} ${variantClass} ${sizeClass} ${roundedClass} ${className}`}
        >
            {withDot && (
                <span
                    className={`mr-1 inline-block h-2 w-2 rounded-full ${
                        variant === 'primary'
                            ? 'bg-blue-400'
                            : variant === 'secondary'
                              ? 'bg-gray-400'
                              : variant === 'success'
                                ? 'bg-green-400'
                                : variant === 'danger'
                                  ? 'bg-red-400'
                                  : variant === 'warning'
                                    ? 'bg-yellow-400'
                                    : 'bg-indigo-400'
                    }`}
                />
            )}
            {children}
        </span>
    );
};
