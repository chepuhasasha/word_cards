export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-html',
    'stylelint-config-prettier-scss',
  ],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss',
    },
  ],
  rules: {
    'selector-class-pattern': null,
    'no-descending-specificity': null,
  },
}
