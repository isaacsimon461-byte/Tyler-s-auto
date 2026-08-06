export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { password } = req.body || {};
  const ok = Boolean(password) && password === process.env.ADMIN_PASSWORD;
  res.status(200).json({ ok });
}
