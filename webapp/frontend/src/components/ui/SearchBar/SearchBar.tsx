import { Search } from 'lucide-react';

interface FilterOption {
    value: string;
    label: string;
}

interface SearchBarProps {
    onSearch: (query: string) => void;
    filterOptions?: FilterOption[];
    onFilterChange?: (value: string) => void;
    placeholder?: string;
    selectedFilter?: string;
    className?: string;
}

export function SearchBar({
    onSearch,
    filterOptions,
    onFilterChange,
    placeholder = 'Rechercher',
    selectedFilter,
    className = '',
}: SearchBarProps) {
    return (
        <div className={`relative ${className}`}>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="focus:border-secondary focus:ring-secondary block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm"
                placeholder={placeholder}
                onChange={(e) => onSearch(e.target.value)}
            />
            {filterOptions && (
                <select
                    value={selectedFilter}
                    onChange={(e) => onFilterChange?.(e.target.value)}
                    className="focus:ring-secondary rounded-lg border border-gray-200 bg-white px-4 py-2 focus:outline-none focus:ring-2"
                >
                    {filterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}
