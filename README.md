# n8n-nodes-carsxe

n8n community node package for CarsXE APIs — VIN decoder, vehicle specs, market value, image and plate endpoints.

This repository contains the node and credential definitions to use CarsXE inside n8n workflows.

## Quick links

- API docs: https://api.carsxe.com/docs
- Example workflow (importable): example-workflow.json

## Installation (local development)

1. Install dev dependencies:
   npm install

2. Build the package (compiles TypeScript and copies icons):
   npm run build

3. Start the TypeScript watch (optional):
   npm run dev

4. For fast local testing, link into a local n8n installation:
   # in this repo
   npm run build
   npm link

   # in your local n8n project
   npm link n8n-nodes-carsxe

   Restart n8n after linking.

## Using the node in n8n

1. Create credentials:
   - In n8n UI go to Credentials > New Credential > "CarsXE API"
   - Enter your CarsXE API Key

2. Create a new workflow and add the "CarsXE" node.
   - Choose an Operation (e.g., "Decode VIN & Get Specs").
   - Provide the VIN or other required parameters.
   - Execute the node to see the response.

## Example (VIN specs)
- Operation: Decode VIN & Get Specs
- VIN: WBAFR7C57CC811956

This will call the CarsXE /specs endpoint using the API key configured in credentials.

## Preparing to publish

Before publishing to npm and submitting to the n8n Creator Portal:

1. Ensure there are no runtime dependencies (see scripts/check-runtime-deps.js).
2. Ensure package.json name starts with `n8n-nodes-`.
3. Include the keyword `n8n-community-node-package` in package.json keywords.
4. Ensure `n8n` section in package.json points to compiled `dist/...` files (this package uses `dist/nodes/...` and `dist/credentials/...`).
5. Provide a clear README and at least one example workflow (this repo includes example-workflow.json).
6. Bump version and run:
   npm run build
   npm pack
   npm publish --access public

## Example workflow (import)
See `example-workflow.json` included in the repo for a simple VIN decode example you can import into n8n.

## Linting & CI
- Run lint:
  npm run lint
- Auto fix:
  npm run lintfix
- A runtime dependency check is available:
  node scripts/check-runtime-deps.js

## Support / Contributing
If you have issues or want to propose changes, open an issue in the repository and include sample VIN and expected behavior.
