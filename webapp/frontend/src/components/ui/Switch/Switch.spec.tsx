import { fireEvent, render, screen } from '@testing-library/react';

import { Switch } from './Switch';

describe('Switch Component', () => {
    it('renders correctly', () => {
        const mockOnChange = jest.fn();
        render(<Switch checked={false} onChange={mockOnChange} />);

        const switchElement = screen.getByRole('switch');
        expect(switchElement).toBeInTheDocument();
        expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('toggles when clicked', () => {
        const mockOnChange = jest.fn();
        render(<Switch checked={false} onChange={mockOnChange} />);

        const switchElement = screen.getByRole('switch');
        fireEvent.click(switchElement);

        expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it('displays label when provided', () => {
        const mockOnChange = jest.fn();
        render(<Switch checked={false} onChange={mockOnChange} label="Test Label" />);

        expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
        const mockOnChange = jest.fn();
        render(<Switch checked={false} onChange={mockOnChange} disabled />);

        const switchElement = screen.getByRole('switch');
        expect(switchElement).toBeDisabled();
        expect(switchElement).toHaveClass('opacity-50 cursor-not-allowed');
    });

    it('does not call onChange when disabled', () => {
        const mockOnChange = jest.fn();
        render(<Switch checked={false} onChange={mockOnChange} disabled />);

        const switchElement = screen.getByRole('switch');
        fireEvent.click(switchElement);

        expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('displays correct state when checked', () => {
        const mockOnChange = jest.fn();
        render(<Switch checked onChange={mockOnChange} />);

        const switchElement = screen.getByRole('switch');
        expect(switchElement).toHaveAttribute('aria-checked', 'true');
        expect(switchElement).toHaveClass('bg-blue-600');
    });
});
