import { Redis } from '@upstash/redis';
import { getAuthUser, setCORSHeaders, setSecurityHeaders, decryptClientData, rateLimit } from './_utils/security.js';

export default async function handler(req, res) {
  setSecurityHeaders(res);
  setCORSHeaders(res);
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Verificar autenticación
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }

  // Rate limiting: 100 requests por hora
  const clientIP = req.headers['x-forwarded-for'] || 'unknown';
  const rateCheck = await rateLimit(`api:${clientIP}`, 100, 3600);
  if (!rateCheck.allowed) {
    return res.status(429).json({ success: false, error: 'Rate limit exceeded' });
  }

  try {
    const redis = new Redis({
      url: (process.env.UPSTASH_REDIS_REST_URL || '').trim(),
      token: (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim()
    });

    const { id } = req.query;

    if (id) {
      const quote = await redis.get(id);
      if (!quote) return res.status(404).json({ error: 'Cotización no encontrada' });
      
      // Desencriptar datos del cliente
      if (quote.cliente) {
        quote.cliente = decryptClientData(quote.cliente);
      }
      
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
