import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { FilterButton } from './FilterButton';

describe('FilterButton', () => {
    it('renders correctly', () => {
        const filterOptions = [
            { label: 'Option 1', value: 'option1', type: 'type1' },
            { label: 'Option 2', value: 'option2', type: 'type2' },
        ];
        const filters = { type1: 'option1', type2: 'option2' };
        const onFilterChange = jest.fn();
        render(
            <FilterButton
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={onFilterChange}
            />
        );

        expect(screen.getByText('Filtrer')).toBeInTheDocument();
        // Vérifie que le nombre d'options sélectionnées est affiché
        expect(screen.getByText('2')).toBeInTheDocument();
    });
});
