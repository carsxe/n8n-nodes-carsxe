# n8n-nodes-carsxe

[![npm version](https://img.shields.io/npm/v/n8n-nodes-carsxe.svg)](https://www.npmjs.com/package/n8n-nodes-carsxe)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-carsxe.svg)](https://www.npmjs.com/package/n8n-nodes-carsxe)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Comprehensive vehicle data integration for [n8n](https://n8n.io)** - VIN decoding, license plate lookup, vehicle history, market values, and more using the [CarsXE API](https://www.carsxe.com).

---

## 🚗 Features

- **VIN Decoding** - Decode US & International VINs with full specifications
- **License Plate Lookup** - Multi-country plate decoder (US, CA, AU, UK, PK)
- **Vehicle History** - Ownership records and accident history
- **Market Values** - Real-time vehicle valuations
- **Safety Recalls** - Check manufacturer recalls
- **Vehicle Images** - Fetch professional vehicle photos
- **OBD Codes** - Decode diagnostic trouble codes
- **OCR Recognition** - Extract VINs and plates from images

---

## 📦 Installation

### Via Community Nodes (Recommended)

1. Go to **Settings** → **Community Nodes**
2. Click **Install a community node**
3. Enter: `n8n-nodes-carsxe`
4. Click **Install**

### Via npm

```bash
# Global installation
npm install -g n8n-nodes-carsxe

# Local installation
npm install n8n-nodes-carsxe

# Restart n8n
n8n start
```

### Via Docker

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e N8N_COMMUNITY_PACKAGES=n8n-nodes-carsxe \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

---

## 🔑 Credentials

1. Get your API key from [CarsXE.com](https://www.carsxe.com/signup)
2. In n8n: **Credentials** → **New** → **CarsXE API**
3. Paste your API key and save

---

## 🎯 Operations

### VIN Operations

- **Decode VIN** - Full vehicle specifications
- **Decode International VIN** - Worldwide VIN support
- **Get History Report** - Ownership & accident history
- **Get Market Value** - Current market valuation
- **Get Safety Recalls** - Manufacturer recalls

### License Plate Operations

- **Decode License Plate** - Vehicle info from plate
- **Recognize Plate From Image** - OCR plate extraction

### Vehicle Data Operations

- **Get Images** - Professional vehicle photos
- **Query by Year/Make/Model** - Search by attributes

### Diagnostic Operations

- **Decode OBD Code** - Interpret diagnostic codes
- **Extract VIN From Image** - OCR VIN extraction

---

## 📖 Quick Examples

### Example 1: Decode VIN

```javascript
// Configuration
Resource: VIN
Operation: Decode VIN
VIN: WBAFR7C57CC811956

// Response
{
  "success": true,
  "vin": "WBAFR7C57CC811956",
  "year": "2012",
  "make": "BMW",
  "model": "7 Series",
  "trim": "750i",
  "engine": "4.4L V8 Turbocharged"
}
```

### Example 2: License Plate Lookup

```javascript
// Configuration
Resource: License Plate
Operation: Decode License Plate
Plate: 7XER187
Country: US
State: CA (in Additional Options)

// Response
{
  "success": true,
  "plate": "7XER187",
  "state": "CA",
  "make": "BMW",
  "model": "750Li"
}
```

### Example 3: Get Vehicle Images

```javascript
// Configuration
Resource: Vehicle Data
Operation: Get Images
Make: BMW
Model: X5
Year: 2019 (in Additional Options)

// Response
{
  "success": true,
  "images": [
    {
      "angle": "front",
      "url": "https://cdn.carsxe.com/..."
    }
  ]
}
```

---

## 🔄 Common Workflows

**VIN Decoder API**

```
[Webhook] → [CarsXE: Decode VIN] → [HTTP Response]
```

**License Plate Scanner**

```
[Webhook] → [CarsXE: Recognize Plate] → [Database]
```

**Daily Recall Checker**

```
[Schedule] → [CarsXE: Get Recalls] → [Email/Slack]
```

---

## 🐛 Troubleshooting

**Error: "Request failed with status code 401"**

- Check your API key in Credentials
- Get a new key from [CarsXE Dashboard](https://www.carsxe.com/dashboard)

**Error: "Invalid VIN format"**

- VIN must be exactly 17 characters
- Example: `WBAFR7C57CC811956`

**Node not appearing after installation**

- Refresh your browser
- Clear cache: `rm -rf ~/.n8n/cache`
- Restart n8n

---

## 📊 Response Format

### Success

```json
{
	"success": true
	// ... operation data
}
```

### Error

```json
{
	"success": false,
	"statusCode": 401,
	"error": "Invalid API key",
	"error_description": "Please check your credentials"
}
```

---

## 📄 License

MIT License - Copyright (c) 2025 CarsXE

