import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	JsonObject,
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
	IHttpRequestOptions,
	GenericValue,
} from 'n8n-workflow';

export class CarsXe implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CarsXE',
		name: 'carsXe',
		icon: {
			light: 'file:carsxeLogo.svg',
			dark: 'file:carsxeLogo.dark.svg',
		},
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with CarsXE API for vehicle data',
		defaults: {
			name: 'CarsXE',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
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
						name: 'Ownership',
						value: 'ownership',
					},
					{
						name: 'Recalls Batch',
						value: 'recallsBatch',
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
						name: 'Check Liens and Theft Records',
						value: 'lienTheft',
						action: 'Check liens and theft records',
						description: 'Check for active liens and theft records on a vehicle',
					},
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
						name: 'Get Safety Recalls by Year/Make/Model',
						value: 'recallsYmm',
						action: 'Get safety recalls by year make and model',
						description: 'Get safety recall data by year, make, and model (no VIN required)',
					},
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
					{
						name: 'Get YMM Options',
						value: 'ymmOptions',
						action: 'Get year make model options',
						description:
							'List years, makes, models, trims, or variants for cascading dropdowns',
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

			// ===== RECALLS BATCH OPERATIONS (Alphabetically sorted) =====
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['recallsBatch'],
					},
				},
				options: [
					{
						name: 'Download Results',
						value: 'recallsBatchDownload',
						action: 'Download recalls batch results',
						description: 'Download completed batch recall results as CSV',
					},
					{
						name: 'Get Results',
						value: 'recallsBatchResults',
						action: 'Get recalls batch results',
						description: 'Retrieve completed batch recall results as JSON',
					},
					{
						name: 'Get Status',
						value: 'recallsBatchStatus',
						action: 'Get recalls batch status',
						description: 'Check processing status for a recall batch',
					},
					{
						name: 'Submit Batch',
						value: 'recallsBatchSubmit',
						action: 'Submit a recalls batch',
						description: 'Submit up to 10,000 VINs for asynchronous recall checking',
					},
				],
				default: 'recallsBatchSubmit',
			},

			// ===== OWNERSHIP OPERATIONS (Alphabetically sorted) =====
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['ownership'],
					},
				},
				options: [
					{
						name: 'Get by Address',
						value: 'ownershipAddress',
						action: 'Get ownership by address',
						description: 'Find residents and vehicles linked to a street address (Enterprise)',
					},
					{
						name: 'Get by Person',
						value: 'ownershipPerson',
						action: 'Get ownership by person',
						description: 'Look up contact details and vehicles for a name and address (Enterprise)',
					},
					{
						name: 'Get by VIN',
						value: 'ownershipVin',
						action: 'Get ownership by VIN',
						description: 'Look up registered owner(s) for a VIN (Enterprise)',
					},
					{
						name: 'Get by ZIP',
						value: 'ownershipZip',
						action: 'Get ownership by ZIP',
						description: 'Search people in a ZIP code with optional filters (Enterprise)',
					},
				],
				default: 'ownershipVin',
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
						operation: ['specs', 'intVinDecoder', 'history', 'lienTheft', 'marketValue', 'recalls'],
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
						description: 'US state code for regional pricing adjustments (optional)',
					},
					{
						displayName: 'Mileage',
						name: 'mileage',
						type: 'number',
						default: '',
						placeholder: 'e.g. 45000',
						description: 'Current mileage of the vehicle used to adjust the market value (optional)',
					},
					{
						displayName: 'Condition',
						name: 'condition',
						type: 'options',
						options: [
							{ name: 'Excellent', value: 'excellent' },
							{ name: 'Clean', value: 'clean' },
							{ name: 'Average', value: 'average' },
							{ name: 'Rough', value: 'rough' },
						],
						default: 'average',
						description: 'Overall condition of the vehicle (optional)',
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
						operation: ['images', 'yearMakeModel', 'recallsYmm'],
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
						operation: ['images', 'yearMakeModel', 'recallsYmm'],
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
						operation: ['yearMakeModel', 'recallsYmm'],
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
						type: 'color',
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
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['vehicle'],
						operation: ['ymmOptions'],
					},
				},
				options: [
					{
						displayName: 'Dimension',
						name: 'dimension',
						type: 'options',
						options: [
							{ name: 'Makes', value: 'makes' },
							{ name: 'Models', value: 'models' },
							{ name: 'Trims', value: 'trims' },
							{ name: 'Variants', value: 'variants' },
							{ name: 'Years', value: 'years' },
						],
						default: 'years',
						description:
							'Which list to return. Omit all filters to list years; add year/make/model for the next layer.',
					},
					{
						displayName: 'Make',
						name: 'make',
						type: 'string',
						default: '',
						placeholder: 'e.g. Toyota',
						description: 'Filter by manufacturer (required for models)',
					},
					{
						displayName: 'Model',
						name: 'model',
						type: 'string',
						default: '',
						placeholder: 'e.g. Camry',
						description: 'Filter by model (required for trims; usually required for variants)',
					},
					{
						displayName: 'Trim',
						name: 'trim',
						type: 'string',
						default: '',
						placeholder: 'e.g. XLE',
						description: 'Optional substring filter on trim/variant names',
					},
					{
						displayName: 'Year',
						name: 'year',
						type: 'string',
						default: '',
						placeholder: 'e.g. 2026',
						description: 'Filter by model year',
					},
				],
			},

			// ===== RECALLS BATCH PARAMETERS =====
			{
				displayName: 'VINs',
				name: 'vins',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				displayOptions: {
					show: {
						resource: ['recallsBatch'],
						operation: ['recallsBatchSubmit'],
					},
				},
				default: '',
				placeholder: 'e.g. 1HGBH41JXMN109186\n5YJSA1E26HF000001',
				description:
					'VINs to check (one per line or comma-separated). Provide VINs, CSV, or CSV URL — at least one is required.',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['recallsBatch'],
						operation: ['recallsBatchSubmit'],
					},
				},
				options: [
					{
						displayName: 'CSV',
						name: 'csv',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'Inline CSV text containing VINs (one per line, or a single vin column)',
					},
					{
						displayName: 'CSV URL',
						name: 'csvUrl',
						type: 'string',
						default: '',
						placeholder: 'e.g. https://docs.google.com/spreadsheets/d/SHEET_ID/edit',
						description:
							'HTTPS URL to a CSV of VINs (Google Sheets, S3, Dropbox, and other allowed hosts)',
					},
					{
						displayName: 'Webhook URL',
						name: 'webhookUrl',
						type: 'string',
						default: '',
						placeholder: 'e.g. https://your-server.com/webhook',
						description: 'HTTPS URL to notify when the batch finishes',
					},
				],
			},
			{
				displayName: 'Batch ID',
				name: 'batchId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['recallsBatch'],
						operation: ['recallsBatchStatus', 'recallsBatchResults', 'recallsBatchDownload'],
					},
				},
				default: '',
				placeholder: 'e.g. brb_mnablbn7_wvbaqv',
				description: 'Batch ID returned by Submit Batch',
			},

			// ===== OWNERSHIP PARAMETERS =====
			{
				displayName: 'VIN',
				name: 'vin',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['ownership'],
						operation: ['ownershipVin'],
					},
				},
				default: '',
				placeholder: 'e.g. 1FT8X3BT0BEA61538',
				description: 'Vehicle Identification Number (17 characters)',
			},
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['ownership'],
						operation: ['ownershipPerson'],
					},
				},
				default: '',
				placeholder: 'e.g. John',
				description: 'First name (max 50 characters)',
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['ownership'],
						operation: ['ownershipPerson'],
					},
				},
				default: '',
				placeholder: 'e.g. Sample',
				description: 'Last name (max 50 characters)',
			},
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['ownership'],
						operation: ['ownershipPerson', 'ownershipAddress'],
					},
				},
				default: '',
				placeholder: 'e.g. 123 Example St',
				description: 'Street address only, no city/state (max 100 characters)',
			},
			{
				displayName: 'ZIP',
				name: 'zip',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['ownership'],
						operation: ['ownershipPerson', 'ownershipAddress', 'ownershipZip'],
					},
				},
				default: '',
				placeholder: 'e.g. 90210',
				description: 'US ZIP code (ZIP+4 allowed except for ZIP search, which requires 5 digits)',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['ownership'],
						operation: ['ownershipVin', 'ownershipPerson'],
					},
				},
				options: [
					{
						displayName: 'Include',
						name: 'include',
						type: 'string',
						default: '',
						placeholder: 'e.g. demographics,emails,phones,vehicle_history',
						description:
							'Comma-separated subset of demographics, emails, phones, vehicle_history. Omit to get everything.',
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
						resource: ['ownership'],
						operation: ['ownershipAddress'],
					},
				},
				options: [
					{
						displayName: 'Include',
						name: 'include',
						type: 'string',
						default: '',
						placeholder: 'e.g. demographics,emails,phones,vehicle_history',
						description:
							'Comma-separated subset of demographics, emails, phones, vehicle_history. Omit to get everything.',
					},
					{
						displayName: 'Variant',
						name: 'variant',
						type: 'string',
						default: '',
						placeholder: 'e.g. vehicle_history',
						description:
							'Legacy alias still accepted by the API. Prefer Include; variant no longer changes the response.',
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
						resource: ['ownership'],
						operation: ['ownershipZip'],
					},
				},
				options: [
					{
						displayName: 'Gender',
						name: 'gender',
						type: 'options',
						options: [
							{ name: 'Female', value: 'F' },
							{ name: 'Male', value: 'M' },
						],
						default: 'F',
						description: 'Filter by gender (M or F)',
					},
					{
						displayName: 'Include',
						name: 'include',
						type: 'string',
						default: '',
						placeholder: 'e.g. demographics,emails,phones,vehicle_history',
						description:
							'Comma-separated subset of demographics, emails, phones, vehicle_history. Omit to get everything.',
					},
					{
						displayName: 'Income',
						name: 'income',
						type: 'options',
						options: [
							{ name: 'A — Under $10,000', value: 'A' },
							{ name: 'B — $10,000–$19,999', value: 'B' },
							{ name: 'C — $20,000–$29,999', value: 'C' },
							{ name: 'D — $30,000–$39,999', value: 'D' },
							{ name: 'E — $40,000–$49,999', value: 'E' },
							{ name: 'F — $50,000–$59,999', value: 'F' },
							{ name: 'G — $60,000–$74,999', value: 'G' },
							{ name: 'H — $75,000–$99,999', value: 'H' },
							{ name: 'K — $100,000–$149,999', value: 'K' },
							{ name: 'L — $150,000–$174,999', value: 'L' },
							{ name: 'M — $175,000–$199,999', value: 'M' },
							{ name: 'N — $200,000–$249,999', value: 'N' },
							{ name: 'O — $250K+', value: 'O' },
							{ name: 'Unknown', value: 'Unknown' },
						],
						default: 'A',
						description: 'Income bucket code or label',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 100,
						},
						default: 50,
						description: 'Max number of results to return',
					},
					{
						displayName: 'Max Age',
						name: 'max_age',
						type: 'number',
						default: '',
						description: 'Maximum age filter (whole number)',
					},
					{
						displayName: 'Min Age',
						name: 'min_age',
						type: 'number',
						default: '',
						description: 'Minimum age filter (whole number)',
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 1,
						description: 'Results page (default 1)',
					},
					{
						displayName: 'Variant',
						name: 'variant',
						type: 'string',
						default: '',
						placeholder: 'e.g. vehicle_history',
						description:
							'Legacy alias still accepted by the API. Prefer Include; variant no longer changes the response.',
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

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let endpoint = '';
				let method: 'GET' | 'POST' = 'GET';
				let parseJson = true;
				const qs: IDataObject = {
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
						if (additionalOptions.mileage) qs.mileage = additionalOptions.mileage;
						if (additionalOptions.condition) qs.condition = additionalOptions.condition;
						break;
					}

					case 'history': {
						endpoint = '/history';
						qs.vin = this.getNodeParameter('vin', i) as string;
						break;
					}

					case 'lienTheft': {
						endpoint = '/v1/lien-theft';
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

					case 'recallsYmm': {
						endpoint = '/v1/recalls-ymm';
						qs.year = this.getNodeParameter('year', i) as string;
						qs.make = this.getNodeParameter('make', i) as string;
						qs.model = this.getNodeParameter('model', i) as string;
						break;
					}

					case 'ymmOptions': {
						endpoint = '/v1/ymm-options';
						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;
						if (additionalOptions.dimension) qs.dimension = additionalOptions.dimension;
						if (additionalOptions.year) qs.year = additionalOptions.year;
						if (additionalOptions.make) qs.make = additionalOptions.make;
						if (additionalOptions.model) qs.model = additionalOptions.model;
						if (additionalOptions.trim) qs.trim = additionalOptions.trim;
						break;
					}

					case 'recallsBatchSubmit': {
						method = 'POST';
						endpoint = '/v1/recalls-batch/submit';
						const vinsRaw = this.getNodeParameter('vins', i, '') as string;
						const vins = vinsRaw
							.split(/[\n,]+/)
							.map((vin) => vin.trim())
							.filter((vin) => vin.length > 0);
						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;
						body = {};
						if (vins.length) body.vins = vins;
						if (additionalOptions.csv) body.csv = additionalOptions.csv;
						if (additionalOptions.csvUrl) body.csvUrl = additionalOptions.csvUrl;
						if (additionalOptions.webhookUrl) body.webhookUrl = additionalOptions.webhookUrl;
						if (!body.vins && !body.csv && !body.csvUrl) {
							throw new NodeOperationError(
								this.getNode(),
								'Provide at least one of VINs, CSV, or CSV URL',
								{ itemIndex: i },
							);
						}
						break;
					}

					case 'recallsBatchStatus': {
						endpoint = '/v1/recalls-batch/status';
						qs.batchId = this.getNodeParameter('batchId', i) as string;
						break;
					}

					case 'recallsBatchResults': {
						endpoint = '/v1/recalls-batch/results';
						qs.batchId = this.getNodeParameter('batchId', i) as string;
						break;
					}

					case 'recallsBatchDownload': {
						endpoint = '/v1/recalls-batch/download';
						qs.batchId = this.getNodeParameter('batchId', i) as string;
						parseJson = false;
						break;
					}

					case 'ownershipVin': {
						endpoint = '/v1/ownership/vin';
						qs.vin = this.getNodeParameter('vin', i) as string;
						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;
						if (additionalOptions.include) qs.include = additionalOptions.include;
						break;
					}

					case 'ownershipPerson': {
						endpoint = '/v1/ownership/person';
						qs.first_name = this.getNodeParameter('first_name', i) as string;
						qs.last_name = this.getNodeParameter('last_name', i) as string;
						qs.address = this.getNodeParameter('address', i) as string;
						qs.zip = this.getNodeParameter('zip', i) as string;
						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;
						if (additionalOptions.include) qs.include = additionalOptions.include;
						break;
					}

					case 'ownershipAddress': {
						endpoint = '/v1/ownership/address';
						qs.address = this.getNodeParameter('address', i) as string;
						qs.zip = this.getNodeParameter('zip', i) as string;
						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;
						if (additionalOptions.include) qs.include = additionalOptions.include;
						if (additionalOptions.variant) qs.variant = additionalOptions.variant;
						break;
					}

					case 'ownershipZip': {
						endpoint = '/v1/ownership/zip';
						qs.zip = this.getNodeParameter('zip', i) as string;
						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;
						if (additionalOptions.gender) qs.gender = additionalOptions.gender;
						if (additionalOptions.min_age !== undefined && additionalOptions.min_age !== '') {
							qs.min_age = additionalOptions.min_age;
						}
						if (additionalOptions.max_age !== undefined && additionalOptions.max_age !== '') {
							qs.max_age = additionalOptions.max_age;
						}
						if (additionalOptions.income) qs.income = additionalOptions.income;
						if (additionalOptions.page) qs.page = additionalOptions.page;
						if (additionalOptions.limit) qs.limit = additionalOptions.limit;
						if (additionalOptions.include) qs.include = additionalOptions.include;
						if (additionalOptions.variant) qs.variant = additionalOptions.variant;
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
					qs,
					json: parseJson,
					ignoreHttpStatusErrors: true,
					returnFullResponse: true,
				};

				if (method !== 'GET') {
					options.headers = {
						'Content-Type': 'application/json',
					};
					options.body = body;
				}

				const fullResponse = await this.helpers.httpRequestWithAuthentication(
					'carsXEApi',
					options,
				);
				const statusCode = fullResponse.statusCode;
				let response = fullResponse.body;

				if (typeof response === 'string') {
					const trimmed = response.trim();
					if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
						try {
							response = JSON.parse(trimmed);
						} catch {
							// Keep the raw string (e.g. CSV download)
						}
					}
				}

				if (typeof response === 'string') {
					if (statusCode >= 400) {
						throw new NodeOperationError(
							this.getNode(),
							`CarsXE API Error (${statusCode}): ${response}`,
							{ itemIndex: i },
						);
					}

					returnData.push({
						json: {
							success: true,
							batchId: qs.batchId,
							csv: response,
						},
						pairedItem: { item: i },
					});
					continue;
				}

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
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}
		return [returnData];
	}
}
