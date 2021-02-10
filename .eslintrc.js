module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		'comma-dangle': 'off',
		'@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
		'no-undef': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'no-trailing-spaces': 'error',
		'quotes': ['error', 'single'],
		'object-shorthand': ['error', 'always'],
		'block-spacing': ['error', 'always'],
		'space-in-parens': ['error', 'never'],
		'space-before-function-paren': ['error', {
			'anonymous': 'always',
			'named': 'never',
			'asyncArrow': 'always',
		}],
		'space-infix-ops': 'error',
		'semi': 'off',
		'@typescript-eslint/semi': ['error', 'always'],
		'object-curly-spacing': ['error', 'always'],
		'comma-style': ['error', 'last'],
		'indent': ['error', 'tab'],
	},
};
