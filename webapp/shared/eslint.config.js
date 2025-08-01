import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Configuration ESLint pour Shared - Types, DTOs et Utilitaires
 *
 * Ce dossier contient principalement :
 * - Types TypeScript utilitaires
 * - DTOs avec validation Zod
 * - Enums partagés
 * - Fonctions utilitaires
 *
 * Configuration adaptée pour :
 * - Types stricts pour les DTOs
 * - Validation des schémas Zod
 * - Cohérence des exports
 * - Règles adaptées aux utilitaires
 */
export default tseslint.config(
    {
        ignores: ['dist', 'node_modules', '*.config.js', '*.config.ts', 'coverage', 'build'],
    },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,js}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.es2022,
            },
        },
        rules: {
            // Règles TypeScript strictes pour les types partagés
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'warn', // Warning pour flexibilité dans les utilitaires
            '@typescript-eslint/no-var-requires': 'error',

            // Règles de style et formatage
            'prefer-const': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-template': 'error',
            'no-useless-concat': 'error',

            // Règles pour les exports (important pour un package partagé)
            'no-duplicate-imports': 'error',

            // Règles de qualité du code
            'no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTernary: true,
                    allowTaggedTemplates: true,
                },
            ],
            'no-return-assign': 'error',
            'no-sequences': 'error',

            // Règles de complexité (adaptées pour les utilitaires)
            complexity: ['warn', 15], // Plus permissif pour les fonctions utilitaires
            'max-depth': ['warn', 4],
            'max-lines-per-function': [
                'warn',
                {
                    max: 80,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            'max-params': ['warn', 4],

            // Règles spécifiques aux erreurs
            'no-ex-assign': 'error',
            'no-inner-declarations': 'error',
            'no-irregular-whitespace': 'error',

            // Règles pour la cohérence des types
            'consistent-return': 'error',
            'no-implicit-coercion': 'error',
        },
    },
    // Configuration spécifique pour les fichiers de types
    {
        files: ['types/**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off', // Types utilitaires peuvent utiliser any
            'max-lines-per-function': 'off',
            complexity: 'off',
        },
    },
    // Configuration spécifique pour les DTOs
    {
        files: ['dto/**/*.ts'],
        rules: {
            'max-lines-per-function': ['warn', { max: 120 }], // DTOs peuvent être plus longs
        },
    },
    // Configuration spécifique pour les enums
    {
        files: ['enums/**/*.ts'],
        rules: {
            'prefer-const': 'off', // Les enums utilisent const enum parfois
        },
    },
    // Configuration spécifique pour les utilitaires
    {
        files: ['utils/**/*.ts'],
        rules: {
            complexity: ['warn', 20], // Utilitaires peuvent être plus complexes
            'max-lines-per-function': ['warn', { max: 100 }],
        },
    },
    // Configuration pour les fichiers d'index (exports)
    {
        files: ['**/index.ts'],
        rules: {
            'max-lines-per-function': 'off',
        },
    }
);
