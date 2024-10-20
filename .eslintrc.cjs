module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import", "prettier"],
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "standard-with-typescript",
    "airbnb-base",
    "airbnb-typescript/base",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  overrides: [],
  ignorePatterns: [
    "node_modules",
    "dist",
    ".eslintrc.cjs",
    "vite.config.ts",
    "commitlint.config.cjs",
    "src/css/*.css",
    "testingUtility.ts",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },
  rules: {
    "strict-boolean-expressions": "off",
    "import/extensions": "off",
    "prettier/prettier": [
      "error",
      {
        printWidth: 100,
      },
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "no-console": "off",
    "import/prefer-default-export": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/lines-between-class-members": "off",
    "no-underscore-dangle": "off",
    "array-element-newline": [
      "error",
      {
        ArrayExpression: "consistent",
        ArrayPattern: { multiline: true, minItems: 3 },
      },
    ],
    "import/order": [
      "error",
      {
        groups: [
          ["builtin", "external"],
          ["internal", "parent", "sibling", "index"],
        ],
      },
    ],
  },
};
