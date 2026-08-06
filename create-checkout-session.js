import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method not allowed');
  }

  const { productId, name, price } = req.body || {};
  const amount = Math.round(parseFloat(price) * 100);

  if (!name || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid product name or price.' });
  }

  const origin = req.headers.origin || `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: { productId: productId || '' },
      success_url: `${origin}/?success=true&item=${encodeURIComponent(name)}`,
      cancel_url: `${origin}/?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
