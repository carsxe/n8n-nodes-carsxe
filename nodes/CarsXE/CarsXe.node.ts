import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
	IHttpRequestOptions,
} from 'n8n-workflow';

export class CarsXe implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CarsXE',
		name: 'carsXe',
		icon: 'file:carsxeLogo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with CarsXE API for vehicle data',
		defaults: {
			name: 'CarsXE',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'carsXEApi',
				required: true,
			},
		],
		properties: [
			// Operation selector
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Decode License Plate',
						value: 'plateDecoder',
						description: 'Decode license plate information',
						action: 'Decode license plate information',
					},
					{
						name: 'Decode OBD Codes',
						value: 'obdCodesDecoder',
						description: 'Decode OBD error/diagnostic codes',
						action: 'Decode OBD codes',
					},
					{
						name: 'Decode VIN & Get Specs',
						value: 'specs',
						description: 'Decode VIN and get full vehicle specifications',
						action: 'Decode VIN and get full vehicle specifications',
					},
					{
						name: 'Get Market Value',
						value: 'marketValue',
						description: 'Estimate vehicle market value based on VIN',
						action: 'Estimate vehicle market value',
					},
					{
						name: 'Get Safety Recalls',
						value: 'recalls',
						description: 'Get safety recall data for a VIN',
						action: 'Get safety recalls',
					},
					{
						name: 'Get Vehicle History',
						value: 'history',
						description: 'Retrieve vehicle history report',
						action: 'Retrieve vehicle history',
					},
					{
						name: 'Get Vehicle Images',
						value: 'images',
						description: 'Fetch vehicle images by make, model, year, trim',
						action: 'Fetch vehicle images',
					},
					{
						name: 'International VIN Decoder',
						value: 'intVinDecoder',
						description: 'Decode VIN with worldwide support',
						action: 'Decode VIN with worldwide support',
					},
					{
						name: 'Plate Image Recognition',
						value: 'plateImageRecognition',
						description: 'Read and decode plates from images',
						action: 'Read and decode plates from images',
					},
					{
						name: 'Query by Year/Make/Model',
						value: 'yearMakeModel',
						description: 'Query vehicle by year, make, model and trim',
						action: 'Query vehicle by year make model',
					},
					{
						name: 'VIN OCR',
						value: 'vinOcr',
						description: 'Extract VINs from images using OCR',
						action: 'Extract vi ns from images',
					},
				],
				default: 'specs',
			},

			// ===== SPECS PARAMETERS =====
			{
				displayName: 'VIN',
				name: 'vin',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['specs'],
					},
				},
				default: '',
				placeholder: 'WBAFR7C57CC811956',
				description: 'Vehicle Identification Number (17 characters)',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['specs'],
					},
				},
				options: [
					{
						displayName: 'Deep Data',
						name: 'deepdata',
						type: 'boolean',
						default: false,
						description: 'Whether to include detailed specifications',
					},
					{
						displayName: 'Disable International VIN Decoding',
						name: 'disableIntVINDecoding',
						type: 'boolean',
						default: false,
						description: 'Whether to disable international VIN decoding',
					},
				],
			},

			// ===== INT VIN DECODER PARAMETERS =====
			{
				displayName: 'VIN',
				name: 'vin',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['intVinDecoder'],
					},
				},
				default: '',
				placeholder: 'WF0MXXGBWM8R43240',
				description: 'Vehicle Identification Number (17 characters)',
			},

			// ===== PLATE DECODER PARAMETERS =====
			{
				displayName: 'License Plate',
				name: 'plate',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['plateDecoder'],
					},
				},
				default: '',
				placeholder: '7XER187',
				description: 'License plate number',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				placeholder: 'US',
				required: true,
				displayOptions: {
					show: {
						operation: ['plateDecoder'],
					},
				},
				description: 'Country code (e.g., US, CA, AU, UK, PK)',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['plateDecoder'],
					},
				},
				options: [
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
						placeholder: 'CA',
						description: 'State/Province code (required for US, AU, CA, etc.)',
					},
					{
						displayName: 'District',
						name: 'district',
						type: 'string',
						default: '',
						placeholder: 'Islamabad',
						description: 'District (required for Pakistan)',
					},
				],
			},

			// ===== MARKET VALUE PARAMETERS =====
			{
				displayName: 'VIN',
				name: 'vin',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['marketValue'],
					},
				},
				default: '',
				placeholder: 'WBAFR7C57CC811956',
				description: 'Vehicle Identification Number',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['marketValue'],
					},
				},
				options: [
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
						placeholder: 'CA',
						description: 'State code for more accurate market valuation',
					},
				],
			},

			// ===== HISTORY PARAMETERS =====
			{
				displayName: 'VIN',
				name: 'vin',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['history'],
					},
				},
				default: '',
				placeholder: 'WBAFR7C57CC811956',
				description: 'Vehicle Identification Number',
			},

			// ===== IMAGES PARAMETERS =====
			{
				displayName: 'Make',
				name: 'make',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['images'],
					},
				},
				default: '',
				placeholder: 'toyota',
				description: 'Vehicle make (e.g., toyota, honda, ford)',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['images'],
					},
				},
				default: '',
				placeholder: 'tacoma',
				description: 'Vehicle model',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['images'],
					},
				},
				options: [
					{
						displayName: 'Angle',
						name: 'angle',
						type: 'options',
						options: [
							{ name: 'Front', value: 'front' },
							{ name: 'Side', value: 'side' },
							{ name: 'Rear', value: 'rear' },
							{ name: '3/4 Front', value: '3quarter' },
						],
						default: 'front',
						description: 'Image angle/view',
					},
					{
						displayName: 'Color',
						name: 'color',
						type: 'color',
						default: '',
						description: 'Vehicle color',
					},
					{
						displayName: 'Format',
						name: 'format',
						type: 'options',
						options: [
							{ name: 'JSON', value: 'json' },
							{ name: 'XML', value: 'xml' },
						],
						default: 'json',
						description: 'Response format',
					},
					{
						displayName: 'License',
						name: 'license',
						type: 'boolean',
						default: false,
						description: 'Whether to include license plate in image',
					},
					{
						displayName: 'Photo Type',
						name: 'photoType',
						type: 'options',
						options: [
							{ name: 'Stock', value: 'stock' },
							{ name: 'Real', value: 'real' },
						],
						default: 'stock',
						description: 'Type of photo (stock or real)',
					},
					{
						displayName: 'Size',
						name: 'size',
						type: 'options',
						options: [
							{ name: 'Small', value: 'small' },
							{ name: 'Medium', value: 'medium' },
							{ name: 'Large', value: 'large' },
						],
						default: 'medium',
						description: 'Image size',
					},
					{
						displayName: 'Transparent',
						name: 'transparent',
						type: 'boolean',
						default: false,
						description: 'Whether to return transparent background images',
					},
					{
						displayName: 'Trim',
						name: 'trim',
						type: 'string',
						default: '',
						placeholder: 'SE',
						description: 'Vehicle trim level',
					},
					{
						displayName: 'Year',
						name: 'year',
						type: 'number',
						default: 2024,
						description: 'Vehicle year',
					},
				],
			},

			// ===== RECALLS PARAMETERS =====
			{
				displayName: 'VIN',
				name: 'vin',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['recalls'],
					},
				},
				default: '',
				placeholder: '1C4JJXR64PW696340',
				description: 'Vehicle Identification Number',
			},

			// ===== PLATE IMAGE RECOGNITION PARAMETERS =====
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['plateImageRecognition'],
					},
				},
				default: '',
				placeholder: 'https://api.carsxe.com/img/apis/plate_recognition.JPG',
				description: 'URL of the license plate image to analyze',
			},

			// ===== VIN OCR PARAMETERS =====
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['vinOcr'],
					},
				},
				default: '',
				placeholder: 'https://example.com/vin-image.png',
				description: 'URL of the VIN image to extract text from',
			},

			// ===== YEAR MAKE MODEL PARAMETERS =====
			{
				displayName: 'Year',
				name: 'year',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						operation: ['yearMakeModel'],
					},
				},
				default: 2023,
				description: 'Vehicle year',
			},
			{
				displayName: 'Make',
				name: 'make',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['yearMakeModel'],
					},
				},
				default: '',
				placeholder: 'Toyota',
				description: 'Vehicle make',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['yearMakeModel'],
					},
				},
				default: '',
				placeholder: 'Camry',
				description: 'Vehicle model',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['yearMakeModel'],
					},
				},
				options: [
					{
						displayName: 'Trim',
						name: 'trim',
						type: 'string',
						default: '',
						placeholder: 'XLE',
						description: 'Vehicle trim level',
					},
				],
			},

			// ===== OBD CODES DECODER PARAMETERS =====
			{
				displayName: 'OBD Code',
				name: 'code',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['obdCodesDecoder'],
					},
				},
				default: '',
				placeholder: 'P0115',
				description: 'OBD error/diagnostic code (e.g., P0420, P0115, P0171)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const credentials = await this.getCredentials('carsXEApi');
		const apiKey = credentials.apiKey as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				let endpoint = '';
				let method: 'GET' | 'POST' = 'GET';
				const qs: IDataObject = {
					key: apiKey,
					source: 'n8n',
				};
				let body: IDataObject | undefined;

				// Build endpoint and query parameters based on operation
				switch (operation) {
					case 'specs': {
						endpoint = '/specs';
						qs.vin = this.getNodeParameter('vin', i) as string;

						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;
						if (additionalOptions.deepdata) qs.deepdata = additionalOptions.deepdata;
						if (additionalOptions.disableIntVINDecoding)
							qs.disableIntVINDecoding = additionalOptions.disableIntVINDecoding;
						break;
					}

					case 'intVinDecoder': {
						endpoint = '/v1/international-vin-decoder';
						qs.vin = this.getNodeParameter('vin', i) as string;
						break;
					}

					case 'plateDecoder': {
						endpoint = '/v2/platedecoder';
						qs.plate = this.getNodeParameter('plate', i) as string;
						qs.country = this.getNodeParameter('country', i) as string;

						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;
						if (additionalOptions.state) qs.state = additionalOptions.state;
						if (additionalOptions.district) qs.district = additionalOptions.district;
						break;
					}

					case 'marketValue': {
						endpoint = '/v2/marketvalue';
						qs.vin = this.getNodeParameter('vin', i) as string;

						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;
						if (additionalOptions.state) qs.state = additionalOptions.state;
						break;
					}

					case 'history': {
						endpoint = '/history';
						qs.vin = this.getNodeParameter('vin', i) as string;
						break;
					}

					case 'images': {
						endpoint = '/images';
						qs.make = this.getNodeParameter('make', i) as string;
						qs.model = this.getNodeParameter('model', i) as string;

						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;
						if (additionalOptions.year) qs.year = additionalOptions.year;
						if (additionalOptions.color) qs.color = additionalOptions.color;
						if (additionalOptions.format) qs.format = additionalOptions.format;
						if (additionalOptions.trim) qs.trim = additionalOptions.trim;
						if (additionalOptions.transparent) qs.transparent = additionalOptions.transparent;
						if (additionalOptions.angle) qs.angle = additionalOptions.angle;
						if (additionalOptions.photoType) qs.photoType = additionalOptions.photoType;
						if (additionalOptions.size) qs.size = additionalOptions.size;
						if (additionalOptions.license) qs.license = additionalOptions.license;
						break;
					}

					case 'recalls': {
						endpoint = '/v1/recalls';
						qs.vin = this.getNodeParameter('vin', i) as string;
						break;
					}

					case 'plateImageRecognition': {
						method = 'POST';
						endpoint = '/platerecognition';
						const imageUrl = this.getNodeParameter('imageUrl', i) as string;
						body = { image_url: imageUrl };
						break;
					}

					case 'vinOcr': {
						method = 'POST';
						endpoint = '/v1/vinocr';
						const imageUrl = this.getNodeParameter('imageUrl', i) as string;
						body = { image_url: imageUrl };
						break;
					}

					case 'yearMakeModel': {
						endpoint = '/v1/ymm';
						qs.year = this.getNodeParameter('year', i) as number;
						qs.make = this.getNodeParameter('make', i) as string;
						qs.model = this.getNodeParameter('model', i) as string;

						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;
						if (additionalOptions.trim) qs.trim = additionalOptions.trim;
						break;
					}

					case 'obdCodesDecoder': {
						endpoint = '/obdcodesdecoder';
						qs.code = this.getNodeParameter('code', i) as string;
						break;
					}

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
				}

				// Make API request using httpRequest instead of deprecated request
				const options: IHttpRequestOptions = {
					method,
					baseURL: 'https://api.carsxe.com',
					url: endpoint,
					json: true,
				};

				if (method === 'GET') {
					options.qs = qs;
				} else {
					// For POST requests (image recognition endpoints)
					options.url = `${endpoint}?key=${apiKey}&source=n8n`;
					options.headers = {
						'Content-Type': 'application/json',
					};
					options.body = body;
				}

				const response = await this.helpers.httpRequest(options);

				// Handle response
				if (Array.isArray(response)) {
					returnData.push(...response.map((item) => item as IDataObject));
				} else {
					returnData.push(response as IDataObject);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						error: error.message,
						itemIndex: i,
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
