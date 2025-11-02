module.exports = {
  // Tell ESLint what environment your code runs in
  env: {
    browser: true, // For React code (window, document)
    es2020: true,  // For modern JavaScript syntax
    node: true     // For files like vite.config.js
  },
  
  // Start with recommended rules
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime', // For the new JSX transform
    'plugin:react-hooks/recommended',
  ],
  
  // THIS IS THE FIX for "import is reserved"
  parserOptions: {
    ecmaVersion: 'latest', // Use the newest JavaScript version
    sourceType: 'module',  // Tell it to use ES modules (import/export)
    ecmaFeatures: {
      jsx: true // Tell it to understand JSX
    }
  },
  
  // Tell ESLint what version of React you are using
  settings: {
    react: {
      version: 'detect' // Auto-detect the React version
    }
  },
  
  // THIS IS THE FIX for ignoring the 'dist' folder
  ignorePatterns: [
    'dist/', 
    'node_modules/'
  ],
  
  // Add the 'react-refresh' plugin for Vite
  plugins: [
    'react-refresh'
  ],
  
  // Add/override specific rules
  rules: {
    'react-refresh/only-export-components': 'warn',
    'react/prop-types': 'off', // Turns off the prop-type errors we saw
    'no-unused-vars': 'warn'  // Makes unused variables a warning, not an error
  }
};