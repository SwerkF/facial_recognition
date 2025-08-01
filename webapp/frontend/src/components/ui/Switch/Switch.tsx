interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export const Switch = ({ checked, onChange, label, disabled }: SwitchProps) => {
    const handleToggle = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={handleToggle}
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    checked ? 'bg-blue-600' : 'bg-gray-200'
                } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
            {label && <span className="text-sm text-gray-700">{label}</span>}
        </div>
    );
};
