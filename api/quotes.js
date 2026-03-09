import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const redis = new Redis({
      url: (process.env.UPSTASH_REDIS_REST_URL || '').trim(),
      token: (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim()
    });

    const { id } = req.query;

    if (id) {
      const quote = await redis.get(id);
      if (!quote) return res.status(404).json({ error: 'Cotización no encontrada' });
      return res.status(200).json({ success: true, quote });
    }

    const quotesIndex = await redis.get('quotes_index') || [];
    const quotes = Array.isArray(quotesIndex) ? quotesIndex : [];
    
    quotes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({ success: true, count: quotes.length, quotes });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
