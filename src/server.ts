import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;

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
  const items = getRegionData('default').products;
  console.log('[backend] /backend/products called (default)');
  setTimeout(() => {
    res.json({ items });
  }, 180);
});

// This route simulates a backend endpoint for fetching orders in non-EU regions. It retrieves the order data based on the region specified in the request headers. It returns the data after an artificial delay of 210ms.
app.get('/backend/orders', (req, res) => {
  const items = getRegionData('default').orders;
  console.log('[backend] /backend/orders called (default)');
  setTimeout(() => {
    res.json({ items });
  }, 210);
});

// This route simulates a backend endpoint for fetching products in the EU region. It retrieves the product data based on the region specified in the request headers. It returns the data after an artificial delay of 190ms.
app.get('/backend-eu/products', (req, res) => {
  const items = getRegionData('eu').products;
  console.log('[backend] /backend-eu/products called (EU)');
  setTimeout(() => {
    res.json({ items });
  }, 190);
});

// This route simulates a backend endpoint for fetching orders in the EU region. It retrieves the order data based on the region specified in the request headers. It returns the data after an artificial delay of 220ms.
app.get('/backend-eu/orders', (req, res) => {
  const items = getRegionData('eu').orders;
  console.log('[backend] /backend-eu/orders called (EU)');
  setTimeout(() => {
    res.json({ items });
  }, 220);
});

// API routes with duplicated logic

// This route handles API requests for fetching products from the frontend. It checks the 'x-region' header to determine which backend endpoint to call (EU or default). It then fetches the data from the appropriate backend endpoint, transforms it into a consistent format, and returns it to the client. If there are any errors during the fetch process, it logs the error and returns an appropriate error response. 
// The transformation step maps the backend data structure to a more standardized format that the frontend can easily consume, ensuring that the API response is consistent regardless of the backend data structure.
app.get('/api/products', async (req, res) => {
  const regionHeader = req.headers['x-region'] as string;
  const isEu = regionHeader === 'eu';
  let backendUrl = 'http://localhost:3000/backend/products';

  if (isEu) {
    backendUrl = 'http://localhost:3000/backend-eu/products';
  }

  console.log(`[api][products] calling backend: ${backendUrl}`);

  try {
    const response = await fetch(backendUrl);

    if (!response.ok) {
      console.error('[api] /api/products backend non-OK', response.status);
      return res.status(502).json({ error: 'Product backend service failure' });
    }

    const backendData = await response.json();
    const transformedProducts = backendData.items.map((item: any) => {
      return {
        id: item.id,
        sku: item.sku,
        name: item.product_name,
        brand: item.brand,
        category: item.category,
        description: item.description,
        price: item.price_cents / 100,
        currency: item.currency,
        inventory_count: item.inventory_count,
        rating: item.rating,
        dimensions_mm: item.dimensions_mm,
        weight_grams: item.weight_grams,
        image_url: item.image_url,
        tags: item.tags,
      };
    });

    res.json({ products: transformedProducts });
  } catch (error) {
    console.error('[api] /api/products fetch error', error);
    res.status(500).json({ error: 'Unable to retrieve products from backend' });
  }
});

// This route handles API requests for fetching orders from the frontend. Similar to the products route, it checks the 'x-region' header to determine which backend endpoint to call (EU or default). It then fetches the data from the appropriate backend endpoint, transforms it into a consistent format, and returns it to the client. If there are any errors during the fetch process, it logs the error and returns an appropriate error response.
app.get('/api/orders', async (req, res) => {
  const regionHeader = req.headers['x-region'] as string;

  if (!regionHeader) {
    return res.status(400).json({ error: 'Missing x-region header' });
  }

  const isEu = regionHeader === 'eu';
  let backendUrl = 'http://localhost:3000/backend/orders';

  if (isEu) {
    backendUrl = 'http://localhost:3000/backend-eu/orders';
  }

  console.log(`Orders API hit -> backend: ${backendUrl}`);

  try {
    const response = await fetch(backendUrl);

    if (!response.ok) {
      console.error('[api] /api/orders backend non-OK', response.status);
      return res.status(502).json({ message: 'Orders service unavailable', code: 'ORDERS_DOWN' });
    }

    const backendData = await response.json();
    const transformedOrders = backendData.items.map((item: any) => {
      return {
        id: item.id,
        order_number: item.order_number,
        status: item.status,
        currency: item.currency,
        total: (item.total_cents / 100).toFixed(2),
        placed_at: item.placed_at,
        customer: item.customer,
        shipping_address: item.shipping_address,
        payment_method: item.payment_method,
        shipping_method: item.shipping_method,
        items: item.items,
      };
    });

    res.json({ orders: transformedOrders });
  } catch (error) {
    console.error('[api] /api/orders fetch error', error);
    res.status(500).json({ error: 'Unable to retrieve orders from backend' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
