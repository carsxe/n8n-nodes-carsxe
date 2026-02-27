import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
	IHttpRequestOptions,
	GenericValue,
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
						name: 'Get a Vehicle History Report',
						value: 'history',
						action: 'Get a vehicle history report',
						description: 'Retrieve vehicle history',
					},
					{
						name: 'Get a Vehicle Market Value',
						value: 'marketValue',
						action: 'Get a vehicle market value',
						description: 'Estimate vehicle market value based on VIN',
					},
					{
						name: 'Get International VIN Specs',
						value: 'intVinDecoder',
						action: 'Get international VIN specs',
						description: 'Decode VIN with worldwide support',
					},
					{
						name: 'Get Vehicle Safety Recalls',
						value: 'recalls',
						action: 'Get vehicle safety recalls',
						description: 'Get safety recall data for a VIN',
					},
					{
						name: 'Get VIN Specs',
						value: 'specs',
						action: 'Get VIN specs',
						description: 'Decode VIN and get full vehicle specifications',
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
						name: 'Get a License Plate From Image',
						value: 'plateImageRecognition',
						action: 'Get a license plate from image',
						description: 'Read and decode plates from images',
					},
					{
						name: 'Get License Plate Specs',
						value: 'plateDecoder',
						action: 'Get license plate specs',
						description: 'Decode license plate info (plate, country)',
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
						name: 'Get Vehicle Images',
						value: 'images',
						action: 'Get vehicle images',
						description: 'Fetch images by make, model, year, trim',
					},
					{
						name: 'Get Vehicle Specs by Year/Make/Model',
						value: 'yearMakeModel',
						action: 'Get vehicle specs by year make and model',
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
						name: 'Get a VIN From Image',
						value: 'vinOcr',
						action: 'Get a VIN from image',
						description: 'Extract VINs from images using OCR',
					},
					{
						name: 'Get OBD Code Specs',
						value: 'obdCodesDecoder',
						action: 'Get OBD code specs',
						description: 'Decode OBD error/diagnostic codes',
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
				displayName: 'State',
				name: 'state',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['plate'],
						operation: ['plateDecoder'],
					},
				},
				default: '',
				placeholder: 'e.g. CA',
				description: 'State/Province code (required for US, AU, CA)',
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
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: 'US',
						placeholder: 'e.g. US',
						description: 'Country code (US, CA, AU, UK, PK) - defaults to US',
					},
					{
						displayName: 'District',
						name: 'district',
						type: 'string',
						default: '',
						placeholder: 'e.g. Islamabad',
						description: 'District (required for Pakistan)',
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
							{ name: 'Front', value: 'front' },
							{ name: 'Side', value: 'side' },
							{ name: 'Back', value: 'back' },
						],
						default: 'front',
						description: 'The angle to show the car in',
					},
					{
						displayName: 'Color',
						name: 'color',
						// eslint-disable-next-line n8n-nodes-base/node-param-color-type-unused
						type: 'string',
						default: '',
						placeholder: 'e.g. red',
						description: 'The vehicle color',
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
						description: 'The format of the response',
					},
					{
						displayName: 'License',
						name: 'license',
						type: 'options',
						options: [
							{ name: 'All', value: '' },
							{ name: 'Modify', value: 'Modify' },
							{ name: 'Modify Commercially', value: 'ModifyCommercially' },
							{ name: 'Public', value: 'Public' },
							{ name: 'Share', value: 'Share' },
							{ name: 'Share Commercially', value: 'ShareCommercially' },
						],
						default: '',
						description: 'Filter images by license type. Leave blank to return all images.',
					},
					{
						displayName: 'Photo Type',
						name: 'photoType',
						type: 'options',
						options: [
							{ name: 'Exterior', value: 'exterior' },
							{ name: 'Interior', value: 'interior' },
							{ name: 'Engine', value: 'engine' },
						],
						default: 'exterior',
						description:
							'Request images of either interior, exterior or engine. Can only be used with year, make, model and trim.',
					},
					{
						displayName: 'Size',
						name: 'size',
						type: 'options',
						options: [
							{ name: 'All', value: 'All' },
							{ name: 'Large', value: 'Large' },
							{ name: 'Medium', value: 'Medium' },
							{ name: 'Small', value: 'Small' },
							{ name: 'Wallpaper', value: 'Wallpaper' },
						],
						default: 'All',
						description: 'The image size. Defaults to all sizes.',
					},
					{
						displayName: 'Transparent',
						name: 'transparent',
						type: 'boolean',
						default: true,
						description:
							'Whether to prioritize images with transparent background. Defaults to true.',
					},
					{
						displayName: 'Trim',
						name: 'trim',
						type: 'string',
						default: '',
						placeholder: 'e.g. xDrive35i',
						description: 'The vehicle trim level',
					},
					{
						displayName: 'Year',
						name: 'year',
						type: 'string',
						default: '',
						placeholder: 'e.g. 2019',
						description: 'The vehicle year',
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
		const returnData: INodeExecutionData[] = [];
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
						qs.state = this.getNodeParameter('state', i) as string;

						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;

						// Country defaults to US if not provided
						qs.country = (additionalOptions.country as string) || 'US';

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
						returnData.push({
							json: errorResponse as IDataObject,
							pairedItem: { item: i },
						});
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
						returnData.push({
							json: errorResponse as IDataObject,
							pairedItem: { item: i },
						});
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
				returnData.push({
					json: response as IDataObject,
					pairedItem: { item: i },
				});
			} catch (error: unknown) {
				if (this.continueOnFail()) {
					let errorType = 'Error';
					let errorMessage = 'Unknown error';
					let statusCode: number | string = 'unknown';
					let responseData: unknown = null;

					if (error instanceof Error) {
						errorType = error.constructor.name;
						errorMessage = error.message;
					}

					// Narrow axios-style error shape safely
					if (typeof error === 'object' && error !== null && 'response' in error) {
						const errObj = error as {
							response?: {
								status?: number;
								data?: unknown;
							};
							statusCode?: number;
						};

						statusCode = errObj.response?.status ?? errObj.statusCode ?? 'unknown';

						responseData = errObj.response?.data ?? null;
					}

					let safeResponseData: IDataObject | IDataObject[] | GenericValue | GenericValue[] | null =
						null;

					if (responseData && typeof responseData === 'object') {
						safeResponseData = responseData as IDataObject;
					} else {
						safeResponseData = { value: responseData } as IDataObject;
					}

					const errorJson: IDataObject = {
						success: false,
						error: true,
						errorType,
						errorMessage,
						statusCode,
						responseData: safeResponseData,
						resource: this.getNodeParameter('resource', i, 'unknown') as string,
						operation: this.getNodeParameter('operation', i, 'unknown') as string,
						timestamp: new Date().toISOString(),
						itemIndex: i,
					};

					returnData.push({
						json: errorJson,
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}
