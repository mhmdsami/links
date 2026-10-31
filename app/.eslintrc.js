module.exports = {
  extends: ["expo"],
  rules: {
    // Path aliases (`@/*`) are resolved by TypeScript, which runs before lint
    // in `npm run gate`. The default node resolver does not read tsconfig paths.
    "import/no-unresolved": "off",
  },
};
