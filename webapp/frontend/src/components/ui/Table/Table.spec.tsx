import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Table, TableHead, TableHeader, TableRow } from './Table';

describe('Table', () => {
    it('renders correctly', () => {
        render(
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Header 1</TableHead>
                    </TableRow>
                </TableHeader>
            </Table>
        );

        expect(screen.getByText('Header 1')).toBeInTheDocument();
    });
});
