import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Configuration ESLint améliorée pour React + TypeScript
 *
 * Améliorations apportées :
 * - Règles TypeScript strictes
 * - Règles de formatage et style de code
 * - Règles de performance et bonnes pratiques
 * - Règles spécifiques à React
 * - Configuration spécifique pour les tests et fichiers de config
 */
export default tseslint.config(
    {
        ignores: [
            'dist',
            'node_modules',
            '*.config.js',
            '*.config.ts',
            'coverage',
            'build',
            'src/api/interceptor.ts',
        ],
    },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2022,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            react: react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            // Règles des hooks React
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

            // Règles React essentielles
            'react/react-in-jsx-scope': 'off', // Pas nécessaire avec React 17+
            'react/prop-types': 'off', // On utilise TypeScript
            'react/jsx-uses-react': 'off', // Pas nécessaire avec React 17+
            'react/jsx-uses-vars': 'error',
            'react/jsx-no-undef': 'error',
            'react/jsx-key': ['error', { checkFragmentShorthand: true }],
            'react/jsx-boolean-value': ['error', 'never'],
            'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
            'react/self-closing-comp': 'error',
            'react/jsx-pascal-case': 'error',
            'react/no-array-index-key': 'warn',

            // Règles TypeScript strictes
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-var-requires': 'error',

            // Règles de style et formatage
            'prefer-const': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-template': 'error',
            'no-useless-concat': 'error',

            // Règles de performance et bonnes pratiques
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
            'no-alert': 'error',
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-return-assign': 'error',
            'no-sequences': 'error',
            'no-throw-literal': 'error',
            'no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTernary: true,
                    allowTaggedTemplates: true,
                },
            ],

            // Règles pour les imports/exports (simplifiées)
            'no-duplicate-imports': 'error',

            // Règles de complexité (permissives)
            complexity: ['warn', 25],
            'max-depth': ['warn', 6],
            'max-lines-per-function': [
                'warn',
                {
                    max: 250,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],

            // Règles spécifiques à React
            'react-hooks/exhaustive-deps': 'warn',
            'react-hooks/rules-of-hooks': 'error',

            // Règles de sécurité de base
            'no-script-url': 'error',
            'no-new-func': 'error',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    // Configuration spécifique pour les fichiers de test
    {
        files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
        rules: {
            'max-lines-per-function': 'off',
            'no-console': 'off',
            complexity: 'off',
            'max-depth': 'off',
        },
    },
    // Configuration pour les fichiers de configuration
    {
        files: ['*.config.{js,ts}', 'vite.config.{js,ts}', '**/*.config.{js,ts}'],
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
            'no-console': 'off',
        },
    }
);
