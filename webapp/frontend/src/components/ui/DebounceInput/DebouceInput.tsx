import { useCallback, useEffect, useState } from 'react';

import { Input } from '../Input/Input';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    error?: string;
    rightIcon?: React.ReactNode;
    required?: boolean;
}

interface DebounceInputProps extends Omit<InputProps, 'onChange'> {
    onChange: (value: string) => void;
    debounceTime?: number;
}

export const DebounceInput = ({ onChange, debounceTime = 500, ...props }: DebounceInputProps) => {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onChange(inputValue);
        }, debounceTime);

        return () => clearTimeout(timeoutId);
    }, [inputValue, debounceTime, onChange]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }, []);

    return <Input {...props} value={inputValue} onChange={handleChange} />;
};
