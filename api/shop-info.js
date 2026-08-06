import { kv } from '@vercel/kv';

function isAdmin(req) {
  const supplied = req.headers['x-admin-password'];
  return Boolean(supplied) && supplied === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const info = (await kv.get('shop-info')) || { email: '', phone: '', location: '', hours: '' };
      return res.status(200).json(info);
    }

    if (req.method === 'POST') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Admin password required.' });
      const { email, phone, location, hours } = req.body || {};
      const info = { email: email || '', phone: phone || '', location: location || '', hours: hours || '' };
      await kv.set('shop-info', info);
      return res.status(200).json(info);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end('Method not allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
