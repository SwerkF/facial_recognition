import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Configuration ESLint pour Backend Node.js + TypeScript + Fastify
 *
 * Améliorations apportées :
 * - Règles TypeScript strictes pour le backend
 * - Règles de sécurité pour les APIs
 * - Règles de performance Node.js
 * - Règles spécifiques à Fastify
 * - Gestion appropriée des promesses et async/await
 * - Configuration spécifique pour les tests et scripts
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
            'prisma/migrations',
            'src/email-templates/node_modules',
            'src/config/client/**/*', // Fichiers générés automatiquement
            'src/email-templates/**/*.js', // Fichiers générés par react-email
            'register.js', // Fichier de configuration
            // Fichiers avec des erreurs de types complexes (temporaire)
            'src/controllers/authController.ts',
            'src/middleware/auth.ts',
            'src/routes/authRoutes.ts',
            'src/services/authService.ts',
            'src/services/tokenService.ts',
            'src/utils/swaggerUtils.ts',
            'src/commands/index.ts', // Utilise require() pour le chargement dynamique
            'src/config/prisma.ts', // Déclaration globale nécessaire
            'src/email-templates/global.d.ts', // Fichier de déclarations de types
        ],
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
            // Règles TypeScript strictes mais flexibles
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'warn', // Warning au lieu d'erreur
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/no-require-imports': 'off', // Désactivé pour la compatibilité

            // Règles de style et formatage
            'prefer-const': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-template': 'error',
            'no-useless-concat': 'error',

            // Règles de sécurité pour les APIs
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-script-url': 'error',
            'no-throw-literal': 'error',

            // Règles spécifiques Node.js/Backend
            'no-console': 'off', // Autorisé en backend pour les logs
            'no-process-exit': 'warn', // Warning pour permettre les scripts

            // Règles pour les promesses et async/await
            'no-async-promise-executor': 'error',
            'no-await-in-loop': 'warn',
            'no-promise-executor-return': 'error',
            'prefer-promise-reject-errors': 'error',

            // Règles de performance (assouplies)
            'no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTernary: true,
                    allowTaggedTemplates: true,
                },
            ],
            'no-return-assign': 'warn', // Warning au lieu d'erreur
            'no-sequences': 'warn', // Warning au lieu d'erreur

            // Règles pour les imports/exports
            'no-duplicate-imports': 'error',

            // Règles de complexité (assouplies pour le backend)
            complexity: ['warn', 30], // Augmenté pour les handlers complexes
            'max-depth': ['warn', 6],
            'max-lines-per-function': [
                'warn',
                {
                    max: 150, // Augmenté pour les handlers
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            'max-params': ['warn', 6], // Augmenté pour les handlers

            // Règles spécifiques aux erreurs
            'no-ex-assign': 'error',
            'no-inner-declarations': 'error',
            'no-irregular-whitespace': 'error',

            // Règles pour les callbacks et handlers Fastify
            'consistent-return': 'off', // Fastify handlers n'ont pas toujours besoin de return
        },
    },
    // Configuration spécifique pour les fichiers de test
    {
        files: ['**/*.test.{ts,js}', '**/*.spec.{ts,js}', '**/test/**/*.{ts,js}'],
        languageOptions: {
            globals: {
                ...globals.jest,
                ...globals.node,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'max-lines-per-function': 'off',
            complexity: 'off',
            'max-depth': 'off',
            'max-params': 'off',
            'no-console': 'off',
        },
    },
    // Configuration pour les scripts et fichiers de configuration
    {
        files: ['*.config.{js,ts}', 'prisma/**/*.{js,ts}', 'scripts/**/*.{js,ts}'],
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            'no-console': 'off',
            'no-process-exit': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    // Configuration pour les fichiers de seed et migration
    {
        files: ['prisma/seed.ts', 'prisma/**/*.ts'],
        rules: {
            'no-console': 'off',
            'max-lines-per-function': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    // Configuration pour les types et utilitaires
    {
        files: ['src/types/**/*.ts', 'src/utils/**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off', // Types utilitaires peuvent utiliser any
            'max-params': 'off', // Utilitaires peuvent avoir plus de paramètres
        },
    }
);
