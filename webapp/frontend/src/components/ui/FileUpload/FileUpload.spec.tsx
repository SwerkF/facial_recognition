import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { FileUpload } from './FileUpload';

describe('FileUpload', () => {
    it('renders correctly', () => {
        render(<FileUpload label="Test Label" onFileChange={() => {}} />);
        expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
});
