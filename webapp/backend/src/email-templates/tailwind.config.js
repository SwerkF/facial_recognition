/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './emails/**/*.{js,ts,jsx,tsx}',
        './emails/components/**/*.{js,ts,jsx,tsx}',
        './utils/**/*.css',
        './.react-email/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#2B00FF',
                    secondary: '#2200cc',
                    dark: '#02153A',
                },
                card: {
                    bg: '#02153A',
                },
            },
            fontFamily: {
                sans: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'Roboto',
                    'Helvetica',
                    'Arial',
                    'sans-serif',
                ],
                mono: ['Menlo', 'Monaco', '"Courier New"', 'monospace'],
            },
            boxShadow: {
                card: '0 4px 8px rgba(2, 21, 58, 0.3)',
                subtle: '0 0 10px rgba(0, 0, 0, 0.05)',
            },
            borderRadius: {
                email: '15px',
            },
        },
    },
    plugins: [],
};
