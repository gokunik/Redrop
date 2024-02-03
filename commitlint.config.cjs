module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 150],
    "footer-max-line-length": [2, "always", 100],
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [2, "always"],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [2, "never", ["start-case", "pascal-case", "upper-case"]],
    "subject-full-stop": [2, "never", "."],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
    "type-case": [2, "always", "lower-case"],
    "type-enum": [
      2,
      "always",
      [
        "build", // Changes that affect the build system or external dependencies
        "chore", // Changes that don't modify src or test files,
        "config", // Changes to the configuration files,
        "ci", // Changes to our CI configuration files and scripts
        "docs", // Documentation only changes
        "feat", // A new feature
        "fix", // A bug fix or patch
        "perf", // A code change that improves performance
        "refactor", // A code change that neither fixes a bug nor adds a feature
        "revert", // Reverts a previous commit
        "style", // Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
        "test", // Adding missing tests or correcting existing tests
        "translation", // Translation updates
        "security", // Security updates
        "changeset", // Changeset updates
        "release", // Release updates
      ],
    ],
  },
};
