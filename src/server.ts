import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataFilePath = join(__dirname, 'data.json');
const rawData = readFileSync(dataFilePath, 'utf8');
// the catalogData is an object with two propertie: 'default' for non-EU users and eu for EU users. Each property contains products and orders arrays. This allows us to easily switch between datasets based on the region specified in the request headers.
const catalogData = JSON.parse(rawData) as {
  default: { products: any[]; orders: any[] };
  eu: { products: any[]; orders: any[] };
};

// Gets the appropriate dataset based on the region specified in the request headers. If the region is 'eu', it returns the EU dataset; otherwise, it returns the default dataset.
const getRegionData = (region: string) => {
  return region === 'eu' ? catalogData.eu : catalogData.default;
};

// Middleware
app.use(cors());
app.use(express.json());

// Backend routes (legacy format)

// This route simulates a backend endpoint for fetching products in non-EU regions. It retrieves the product data based on the region specified in the request headers. It returns the data after an artificial delay of 180ms.
app.get('/backend/products', (req, res) => {
  const region = req.headers['x-region'] as string || 'default';
  const items = getRegionData(region).products;
  console.log(`[backend] /backend/products called (${region})`);
  setTimeout(() => {
    res.json({ items });
  }, 180);
});

// This route simulates a backend endpoint for fetching orders in non-EU regions. It retrieves the order data based on the region specified in the request headers. It returns the data after an artificial delay of 210ms.
app.get('/backend/orders', (req, res) => {
  const region = req.headers['x-region'] as string || 'default';
  const items = getRegionData(region).orders;
  console.log(`[backend] /backend/orders called (${region})`);
  setTimeout(() => {
    res.json({ items });
  }, 210);
});

// This route simulates a backend endpoint for fetching products in the EU region. It retrieves the product data based on the region specified in the request headers. It returns the data after an artificial delay of 190ms.
// app.get('/backend-eu/products', (req, res) => {
//   const items = getRegionData('eu').products;
//   console.log('[backend] /backend-eu/products called (EU)');
//   setTimeout(() => {
//     res.json({ items });
//   }, 190);
// });

// This route simulates a backend endpoint for fetching orders in the EU region. It retrieves the order data based on the region specified in the request headers. It returns the data after an artificial delay of 220ms.
// app.get('/backend-eu/orders', (req, res) => {
//   const items = getRegionData('eu').orders;
//   console.log('[backend] /backend-eu/orders called (EU)');
//   setTimeout(() => {
//     res.json({ items });
//   }, 220);
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
