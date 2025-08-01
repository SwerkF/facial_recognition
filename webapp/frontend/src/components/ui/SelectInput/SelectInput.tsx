import React, { forwardRef, useState } from 'react';

import { Check, ChevronDown } from 'lucide-react';

interface SelectOption {
    label: string;
    value: string;
}

interface SelectInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label: string;
    name: string;
    error?: string;
    options: SelectOption[];
    value?: string;
    required?: boolean;
    onChange?: (value: string) => void;
}

/**
 * Composant SelectInput avec dropdown personnalisé
 * @param props - Propriétés du composant
 * @returns {JSX.Element} Le composant SelectInput
 */
export const SelectInput = forwardRef<HTMLInputElement, SelectInputProps>(
    (
        {
            label,
            name,
            error,
            options,
            value = '',
            onChange,
            className = '',
            required = false,
            ...props
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = useState(false);

        const selectedOption = options.find((opt) => opt.value === value);

        /**
         * Gère la sélection d'une option
         * @param {string} optionValue - La valeur de l'option sélectionnée
         */
        const handleOptionSelect = (optionValue: string) => {
            if (onChange) {
                onChange(optionValue);
            }
            setIsOpen(false);
        };

        return (
            <div className="relative">
                {label && (
                    <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
                        {label}
                        {required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                )}

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`focus:border-secondary focus:ring-secondary flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500' : ''} ${className} `}
                >
                    <span className={`${!value ? 'text-gray-500' : 'text-gray-900'}`}>
                        {selectedOption?.label || 'Choisir'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
                        <div className="absolute z-10 mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="py-1">
                                {options.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${value === option.value ? 'text-secondary bg-blue-50' : 'text-gray-700 hover:bg-gray-50'} `}
                                        onClick={() => handleOptionSelect(option.value)}
                                    >
                                        {option.label}
                                        {value === option.value && <Check className="h-4 w-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

                {/* Input caché pour react-hook-form */}
                <input type="hidden" name={name} ref={ref} value={value} {...props} />
            </div>
        );
    }
);

SelectInput.displayName = 'SelectInput';
