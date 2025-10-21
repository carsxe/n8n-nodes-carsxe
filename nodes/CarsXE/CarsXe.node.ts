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
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
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
			// ===== RESOURCE SELECTOR =====
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Diagnostic',
						value: 'diagnostic',
					},
					{
						name: 'License Plate',
						value: 'plate',
					},
					{
						name: 'Vehicle Data',
						value: 'vehicle',
					},
					{
						name: 'VIN',
						value: 'vin',
					},
				],
				default: 'vin',
			},

			// ===== VIN OPERATIONS (Alphabetically sorted) =====
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['vin'],
					},
				},
				options: [
					{
						name: 'Decode International VIN',
						value: 'intVinDecoder',
						action: 'Decode an international VIN',
						description: 'Decode VIN with worldwide support',
					},
					{
						name: 'Get History Report',
						value: 'history',
						action: 'Get a vehicle history report',
						description: 'Retrieve vehicle history',
					},
					{
						name: 'Get Market Value',
						value: 'marketValue',
						action: 'Get a market value estimate',
						description: 'Estimate vehicle market value based on VIN',
					},
					{
						name: 'Get Safety Recalls',
						value: 'recalls',
						action: 'Get safety recall information',
						description: 'Get safety recall data for a VIN',
					},
					{
						name: 'Get Specs',
						value: 'specs',
						action: 'Get vehicle specifications',
						description: 'Retrieve full vehicle specifications',
					},
				],
				default: 'specs',
			},

			// ===== LICENSE PLATE OPERATIONS (Alphabetically sorted) =====
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['plate'],
					},
				},
				options: [
					{
						name: 'Decode License Plate',
						value: 'plateDecoder',
						action: 'Decode a license plate',
						description: 'Decode license plate info (plate, country)',
					},
					{
						name: 'Recognize Plate From Image',
						value: 'plateImageRecognition',
						action: 'Recognize a license plate from image',
						description: 'Read and decode plates from images',
					},
				],
				default: 'plateDecoder',
			},

			// ===== VEHICLE DATA OPERATIONS (Alphabetically sorted) =====
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['vehicle'],
					},
				},
				options: [
					{
						name: 'Get Images',
						value: 'images',
						action: 'Get vehicle images',
						description: 'Fetch images by make, model, year, trim',
					},
					{
						name: 'Query by Year/Make/Model',
						value: 'yearMakeModel',
						action: 'Query a vehicle by year make and model',
						description: 'Query vehicle by year, make, model and trim (optional)',
					},
				],
				default: 'images',
			},

			// ===== DIAGNOSTIC OPERATIONS (Alphabetically sorted) =====
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['diagnostic'],
					},
				},
				options: [
					{
						name: 'Decode OBD Code',
						value: 'obdCodesDecoder',
						action: 'Decode an OBD diagnostic code',
						description: 'Decode OBD error/diagnostic codes',
					},
					{
						name: 'Extract VIN From Image',
						value: 'vinOcr',
						action: 'Extract a VIN from image using OCR',
						description: 'Extract VINs from images using OCR',
					},
				],
				default: 'obdCodesDecoder',
			},

			// ===== VIN PARAMETERS =====
			{
				displayName: 'VIN',
				name: 'vin',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['vin'],
						operation: ['specs', 'intVinDecoder', 'history', 'marketValue', 'recalls'],
					},
				},
				default: '',
				placeholder: 'e.g. WBAFR7C57CC811956',
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
						resource: ['vin'],
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
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['vin'],
						operation: ['marketValue'],
					},
				},
				options: [
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
						placeholder: 'e.g. CA',
						description: 'State code for more accurate market valuation (optional)',
					},
				],
			},

			// ===== LICENSE PLATE PARAMETERS =====
			{
				displayName: 'License Plate',
				name: 'plate',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['plate'],
						operation: ['plateDecoder'],
					},
				},
				default: '',
				placeholder: 'e.g. 7XER187',
				description: 'License plate number',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: 'US',
				displayOptions: {
					show: {
						resource: ['plate'],
						operation: ['plateDecoder'],
					},
				},
				placeholder: 'e.g. US',
				description: 'Country code (always required except for US where it defaults to US)',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['plate'],
						operation: ['plateDecoder'],
					},
				},
				options: [
					{
						displayName: 'District',
						name: 'district',
						type: 'string',
						default: '',
						placeholder: 'e.g. Islamabad',
						description: 'District (required for Pakistan)',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
						placeholder: 'e.g. CA',
						description: 'State/Province code (required for US, AU, CA, etc.)',
					},
				],
			},
			{
				displayName: 'Upload URL',
				name: 'uploadUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['plate'],
						operation: ['plateImageRecognition'],
					},
				},
				default: '',
				placeholder: 'e.g. https://api.carsxe.com/img/apis/plate_recognition.JPG',
				description: 'URL of the license plate image to analyze',
			},

			// ===== VEHICLE DATA PARAMETERS =====
			{
				displayName: 'Make',
				name: 'make',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['vehicle'],
						operation: ['images', 'yearMakeModel'],
					},
				},
				default: '',
				placeholder: 'e.g. BMW',
				description: 'Vehicle make',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['vehicle'],
						operation: ['images', 'yearMakeModel'],
					},
				},
				default: '',
				placeholder: 'e.g. X5',
				description: 'Vehicle model',
			},
			{
				displayName: 'Year',
				name: 'year',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['vehicle'],
						operation: ['yearMakeModel'],
					},
				},
				default: '',
				placeholder: 'e.g. 2012',
				description: 'Vehicle year',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['vehicle'],
						operation: ['images'],
					},
				},
				options: [
					{
						displayName: 'Angle',
						name: 'angle',
						type: 'options',
						options: [
							{ name: '3/4 Front', value: '3quarter' },
							{ name: 'Front', value: 'front' },
							{ name: 'Rear', value: 'rear' },
							{ name: 'Side', value: 'side' },
						],
						default: 'front',
						description: 'Image angle/view (optional)',
					},
					{
						displayName: 'Color',
						name: 'color',
						type: 'color',
						default: '',
						placeholder: 'e.g. red',
						description: 'Vehicle color (optional)',
					},
					{
						displayName: 'License',
						name: 'license',
						type: 'boolean',
						default: false,
						description: 'Whether to include license plate in image (optional)',
					},
					{
						displayName: 'Photo Type',
						name: 'photoType',
						type: 'options',
						options: [
							{ name: 'Real', value: 'real' },
							{ name: 'Stock', value: 'stock' },
						],
						default: 'stock',
						description: 'Type of photo - stock or real (optional)',
					},
					{
						displayName: 'Size',
						name: 'size',
						type: 'options',
						options: [
							{ name: 'Large', value: 'large' },
							{ name: 'Medium', value: 'medium' },
							{ name: 'Small', value: 'small' },
						],
						default: 'medium',
						description: 'Image size (optional)',
					},
					{
						displayName: 'Transparent',
						name: 'transparent',
						type: 'boolean',
						default: false,
						description: 'Whether to return transparent background images (optional)',
					},
					{
						displayName: 'Trim',
						name: 'trim',
						type: 'string',
						default: '',
						placeholder: 'e.g. SE',
						description: 'Vehicle trim level (optional)',
					},
					{
						displayName: 'Year',
						name: 'year',
						type: 'string',
						default: '',
						placeholder: 'e.g. 2019',
						description: 'Vehicle year (optional)',
					},
				],
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['vehicle'],
						operation: ['yearMakeModel'],
					},
				},
				options: [
					{
						displayName: 'Trim',
						name: 'trim',
						type: 'string',
						default: '',
						placeholder: 'e.g. Gran Turismo',
						description: 'Vehicle trim level (optional)',
					},
				],
			},

			// ===== DIAGNOSTIC PARAMETERS =====
			{
				displayName: 'OBD Code',
				name: 'code',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['diagnostic'],
						operation: ['obdCodesDecoder'],
					},
				},
				default: '',
				placeholder: 'e.g. P0115',
				description: 'OBD error/diagnostic code',
			},
			{
				displayName: 'Upload URL',
				name: 'uploadUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['diagnostic'],
						operation: ['vinOcr'],
					},
				},
				default: '',
				placeholder: 'e.g. https://api.carsxe.com/img/apis/plate_recognition.JPG',
				description: 'URL of the VIN image to extract text from',
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
				const resource = this.getNodeParameter('resource', i) as string;
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
						const country = this.getNodeParameter('country', i) as string;
						if (country) qs.country = country;

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
						const uploadUrl = this.getNodeParameter('uploadUrl', i) as string;
						body = { upload_url: uploadUrl };
						break;
					}

					case 'vinOcr': {
						method = 'POST';
						endpoint = '/v1/vinocr';
						const uploadUrl = this.getNodeParameter('uploadUrl', i) as string;
						body = { upload_url: uploadUrl };
						break;
					}

					case 'yearMakeModel': {
						endpoint = '/v1/ymm';
						qs.year = this.getNodeParameter('year', i) as string;
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
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation} for resource: ${resource}`,
							{ itemIndex: i },
						);
				}

				// Make API request
				const options: IHttpRequestOptions = {
					method,
					baseURL: 'https://api.carsxe.com',
					url: endpoint,
					json: true,
					ignoreHttpStatusErrors: true,
					returnFullResponse: true,
				};

				if (method === 'GET') {
					options.qs = qs;
				} else {
					options.url = `${endpoint}?key=${apiKey}&source=n8n`;
					options.headers = {
						'Content-Type': 'application/json',
					};
					options.body = body;
				}

				const fullResponse = await this.helpers.httpRequest(options);
				const response = fullResponse.body;
				const statusCode = fullResponse.statusCode;

				// Handle HTTP error status codes (401, 403, 404, 500, etc.)
				if (statusCode >= 400) {
					const errorResponse = {
						success: false,
						statusCode,
						error: response.error || response.message || `HTTP ${statusCode} Error`,
						error_description:
							response.error_description || response.details || response.message || '',
						fullResponse: response,
						_metadata: {
							resource,
							operation,
							timestamp: new Date().toISOString(),
							itemIndex: i,
						},
					};

					if (this.continueOnFail()) {
						returnData.push(errorResponse);
						continue;
					}

					// Build detailed error message
					const errorMessage = response.error || response.message || `HTTP ${statusCode} Error`;
					const errorDetails = response.error_description || response.details || '';

					throw new NodeOperationError(
						this.getNode(),
						`CarsXE API Error (${statusCode}): ${errorMessage}${errorDetails ? ' - ' + errorDetails : ''}`,
						{
							itemIndex: i,
							description: `Full API Response:\n${JSON.stringify(response, null, 2)}`,
						},
					);
				}

				// Check if API returned success: false in response body
				if (response && response.success === false) {
					const errorResponse = {
						...response,
						_metadata: {
							resource,
							operation,
							timestamp: new Date().toISOString(),
							itemIndex: i,
						},
					};

					if (this.continueOnFail()) {
						returnData.push(errorResponse);
						continue;
					}

					const errorMessage = response.error || response.message || 'API request failed';
					const errorDetails = response.error_description || response.details || '';

					throw new NodeOperationError(
						this.getNode(),
						`CarsXE API Error: ${errorMessage}${errorDetails ? ' - ' + errorDetails : ''}`,
						{
							itemIndex: i,
							description: `Full API Response:\n${JSON.stringify(response, null, 2)}`,
						},
					);
				}

				// Success - return the whole response
				returnData.push(response as IDataObject);
			} catch (error) {
				// Network errors or other exceptions
				if (this.continueOnFail()) {
					returnData.push({
						success: false,
						error: true,
						errorType: error.constructor.name,
						errorMessage: error.message,
						statusCode: error.response?.status || error.statusCode || 'unknown',
						responseData: error.response?.data || null,
						resource: this.getNodeParameter('resource', i, 'unknown') as string,
						operation: this.getNodeParameter('operation', i, 'unknown') as string,
						timestamp: new Date().toISOString(),
						itemIndex: i,
					});
					continue;
				}

				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
