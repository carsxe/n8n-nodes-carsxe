import { config } from '@n8n/node-cli/eslint';

export default [
	...config,
	{
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