// module.exports = {
//   parser: '@typescript-eslint/parser',
//   extends: [
//     'standard-with-typescript',
//     'eslint:recommended',
//     'plugin:@typescript-eslint/recommended',
//   ],
//   plugins: ['prettier', '@typescript-eslint'],
//   rules: {
//     'prettier/prettier': ['error', { singleQuote: true, semi: false }],
//     'comma-dangle': 0,
//     '@typescript-eslint/space-before-function-paren': 0,
//     'multiline-ternary': 0,
//     '@typescript-eslint/strict-boolean-expressions': 0,
//   },
// }

module.exports = {
  // parser: '@typescript-eslint/parser',
  extends: [
    'standard-with-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error', { singleQuote: true, semi: false }],
    'comma-dangle': 0,
    '@typescript-eslint/space-before-function-paren': 0,
    'multiline-ternary': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/indent':0,
  },
}
