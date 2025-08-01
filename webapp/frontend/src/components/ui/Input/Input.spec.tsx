import { render, screen } from '@testing-library/react';

import { Input } from './Input';

describe('Input Component', () => {
    test('renders input element correctly', () => {
        render(<Input label="Test Label" name="testInput" placeholder="Test Placeholder" />);

        expect(screen.getByPlaceholderText('Test Placeholder')).toBeInTheDocument();
    });
});
