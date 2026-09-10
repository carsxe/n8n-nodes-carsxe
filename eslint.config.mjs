import { config } from '@n8n/node-cli/eslint';

export default [
	...config,
	{
		// Credential name is carsXEApi (package-specific); reuse rule does not apply.
		rules: {
			'@n8n/community-nodes/no-credential-reuse': 'off',
		},
		settings: {
			'import/resolver': {
				typescript: {},
				node: {
					extensions: ['.js', '.ts'],
				},
			},
		},
	},
];