module.exports = [
  {
    ignores: ["node_modules/**", "**/*.min.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        module: "writable"
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off"
    }
  }
]; 