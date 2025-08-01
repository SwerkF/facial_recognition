import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
    it('renders correctly', () => {
        render(<Tooltip content="Test Tooltip">Test Tooltip</Tooltip>);

        expect(screen.getByText('Test Tooltip')).toBeInTheDocument();
        expect(screen.getByText('Test Tooltip')).toHaveTextContent('Test Tooltip');
    });
});
