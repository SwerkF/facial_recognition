import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Modal } from './Modal';

describe('Modal', () => {
    it('renders correctly', () => {
        const isOpen = true;
        const onClose = jest.fn();
        render(
            <Modal isOpen={isOpen} onClose={onClose} title="Test Modal">
                <p id="test-modal-text">Texte du modal</p>
            </Modal>
        );

        expect(screen.getByText('Test Modal')).toBeInTheDocument();
        expect(screen.getByText('Texte du modal')).toBeInTheDocument();
    });
});
