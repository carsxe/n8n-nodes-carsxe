import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CarsXEApi implements ICredentialType {
	name = 'carsXEApi';
	displayName = 'CarsXE API';
	documentationUrl = 'https://api.carsxe.com/docs';
	icon = 'file:carsxeLogo.svg' as const;
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your CarsXE API key',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				key: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.carsxe.com',
			url: '/specs',
			method: 'GET',
			qs: {
				key: '={{$credentials.apiKey}}',
				vin: 'WBAFR7C57CC811956',
			},
		},
	};
}
