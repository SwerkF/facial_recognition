import React, { forwardRef, useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    error?: string;
    rightIcon?: React.ReactNode;
    required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, name, type = 'text', error, rightIcon, className = '', ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
        };

        return (
            <div className="relative w-full">
                {label && (
                    <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
                        {label}
                        {props.required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                )}
                <div className="relative">
                    <input
                        id={name}
                        name={name}
                        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
                        ref={ref}
                        className={`focus:border-secondary focus:ring-secondary relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition duration-150 ease-in-out focus:z-10 focus:outline-none focus:ring-2 sm:text-sm ${error ? 'border-red-500' : ''} ${rightIcon ? 'pr-10' : ''} ${className} `}
                        {...props}
                    />
                    {type === 'password' && (
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 z-20 -translate-y-1/2"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? (
                                <Eye className="h-4 w-4" />
                            ) : (
                                <EyeOff className="h-4 w-4" />
                            )}
                        </button>
                    )}
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</div>
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
