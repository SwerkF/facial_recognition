import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { SearchBar } from './SearchBar';

describe('Searchbar', () => {
    it('renders correctly', () => {
        const onSearch = jest.fn();
        render(<SearchBar placeholder="Rechercher..." onSearch={onSearch} />);

        expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
    });
});
