import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Pagination } from './Pagination';

describe('Pagination', () => {
    it('renders correctly', () => {
        render(<Pagination currentPage={1} totalPages={10} onPageChange={() => {}} />);

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
    });
});
