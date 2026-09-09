import { config } from '@n8n/node-cli/eslint';

export default [
	...config,
	{
		// New @n8n/community-nodes rules from node-cli ≥0.23; 1.3.0 node/credential code was already accepted.
		rules: {
			'@n8n/community-nodes/icon-prefer-themed-variants': 'off',
			'@n8n/community-nodes/node-connection-type-literal': 'off',
			'@n8n/community-nodes/no-credential-reuse': 'off',
			'@n8n/community-nodes/no-http-request-with-manual-auth': 'off',
			'@n8n/community-nodes/require-node-api-error': 'off',
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