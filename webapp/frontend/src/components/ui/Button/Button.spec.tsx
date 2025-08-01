import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Button } from './Button';

describe('Button', () => {
    it('renders correctly', () => {
        render(<Button>Test Button</Button>);

        expect(screen.getByText('Test Button')).toBeInTheDocument();
    });
});
