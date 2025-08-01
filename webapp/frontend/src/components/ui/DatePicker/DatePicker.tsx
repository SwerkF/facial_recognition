import { forwardRef, useEffect, useRef, useState } from 'react';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
    label: string;
    value?: Date;
    onChange: (date: Date) => void;
    error?: string;
    required?: boolean;
    className?: string;
}

const MONTHS = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
];

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
    ({ label, value, onChange, error, required = false, className = '' }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
        const calendarRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        const formatDate = (date?: Date): string => {
            if (!date) {
                return '';
            }
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        };

        const getDaysInMonth = (year: number, month: number): number => {
            return new Date(year, month + 1, 0).getDate();
        };

        const getStartDayOfMonth = (year: number, month: number): number => {
            const day = new Date(year, month, 1).getDay();
            return day === 0 ? 6 : day - 1; // Ajustement pour commencer par lundi (0)
        };

        const handlePrevMonth = () => {
            setCurrentMonth((prev) => {
                const prevMonth = new Date(prev);
                prevMonth.setMonth(prev.getMonth() - 1);
                return prevMonth;
            });
        };

        const handleNextMonth = () => {
            setCurrentMonth((prev) => {
                const nextMonth = new Date(prev);
                nextMonth.setMonth(prev.getMonth() + 1);
                return nextMonth;
            });
        };

        const handleSelectDate = (day: number) => {
            const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            onChange(selectedDate);
            setIsOpen(false);
        };

        const renderCalendar = () => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const daysInMonth = getDaysInMonth(year, month);
            const startDay = getStartDayOfMonth(year, month);

            const days = [];
            // Jours vides au début
            for (let i = 0; i < startDay; i++) {
                days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
            }

            // Jours du mois
            for (let i = 1; i <= daysInMonth; i++) {
                const isSelected =
                    value &&
                    value.getDate() === i &&
                    value.getMonth() === month &&
                    value.getFullYear() === year;

                days.push(
                    <button
                        key={i}
                        type="button"
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${isSelected ? 'bg-secondary text-white' : 'hover:bg-gray-100'}`}
                        onClick={() => handleSelectDate(i)}
                    >
                        {i}
                    </button>
                );
            }

            return days;
        };

        return (
            <div className="relative">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </label>

                <div className="relative">
                    <input
                        ref={ref}
                        type="text"
                        readOnly
                        value={formatDate(value)}
                        onClick={() => setIsOpen(!isOpen)}
                        className={`focus:border-secondary focus:ring-secondary relative block w-full cursor-pointer appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition duration-150 ease-in-out focus:z-10 focus:outline-none focus:ring-2 sm:text-sm ${error ? 'border-red-500' : ''} ${className} `}
                        placeholder="JJ/MM/AAAA"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Calendar size={20} className="text-gray-400" />
                    </div>
                </div>

                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

                {isOpen && (
                    <div
                        ref={calendarRef}
                        className="absolute z-10 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg"
                    >
                        <div className="p-2">
                            {/* En-tête du calendrier avec mois/année et navigation */}
                            <div className="mb-2 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="rounded-full p-1 hover:bg-gray-100"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="font-medium">
                                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="rounded-full p-1 hover:bg-gray-100"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Jours de la semaine */}
                            <div className="mb-1 grid grid-cols-7 gap-1">
                                {DAYS.map((day) => (
                                    <div
                                        key={day}
                                        className="flex h-8 items-center justify-center text-xs font-medium text-gray-500"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Grille des jours */}
                            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

                            {/* Actions en bas */}
                            <div className="mt-2 flex justify-between">
                                <button
                                    type="button"
                                    className="text-secondary text-xs hover:underline"
                                    onClick={() => {
                                        onChange(new Date());
                                        setIsOpen(false);
                                    }}
                                >
                                    Aujourd'hui
                                </button>
                                <button
                                    type="button"
                                    className="text-xs text-gray-500 hover:underline"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

DatePicker.displayName = 'DatePicker';
