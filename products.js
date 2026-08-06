import { kv } from '@vercel/kv';

function isAdmin(req) {
  const supplied = req.headers['x-admin-password'];
  return Boolean(supplied) && supplied === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const products = (await kv.get('products')) || [];
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Admin password required.' });
      const { name, category, price, condition, description, email } = req.body || {};
      if (!name || !price) {
        return res.status(400).json({ error: 'Name and price are required.' });
      }
      const product = {
        id: Date.now().toString(),
        name,
        category: category || 'Other',
        price: String(price),
        condition: condition || 'Used',
        description: description || '',
        email: email || '',
      };
      const products = (await kv.get('products')) || [];
      products.unshift(product);
      await kv.set('products', products);
      return res.status(200).json(product);
    }

    if (req.method === 'DELETE') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Admin password required.' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      let products = (await kv.get('products')) || [];
      products = products.filter((p) => p.id !== id);
      await kv.set('products', products);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end('Method not allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
