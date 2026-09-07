import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Core ESLint no-unused-vars does not recognize JSX member expressions (<motion.div>)
      // without eslint-plugin-react. Allow 'motion' alongside standard PascalCase components.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]|motion$' }],

      // eslint-plugin-react-hooks v7 includes React Compiler rules in its flat recommended preset.
      // FrameWork uses standard React 19 without babel-plugin-react-compiler (@vitejs/plugin-react).
      // Intentional manual memoization (e.g. narrowing callback deps to [user?.id]) and effect-driven
      // synchronization (e.g. route transitions, modal resets) are standard in non-compiler React.
      // Disable compiler-specific rules while preserving 'rules-of-hooks' and 'exhaustive-deps'.
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
