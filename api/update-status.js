import { Redis } from '@upstash/redis';
import { getAuthUser, setCORSHeaders, setSecurityHeaders, auditLog, rateLimit } from './_utils/security.js';

export default async function handler(req, res) {
  setSecurityHeaders(res);
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verificar autenticación
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }

  // Rate limiting
  const clientIP = req.headers['x-forwarded-for'] || 'unknown';
  const rateCheck = await rateLimit(`api:${clientIP}`, 50, 3600);
  if (!rateCheck.allowed) {
    return res.status(429).json({ success: false, error: 'Rate limit exceeded' });
  }

  try {
    const { id, status } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({ success: false, error: 'Faltan datos' });
    }

    const redis = new Redis({
      url: (process.env.UPSTASH_REDIS_REST_URL || '').trim(),
      token: (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim()
    });

    const quote = await redis.get(id);
    if (!quote) {
      return res.status(404).json({ success: false, error: 'Cotización no encontrada' });
    }

    const oldStatus = quote.status;
    quote.status = status;
    quote.updated_at = new Date().toISOString();
    
    if (!quote.historial) quote.historial = [];
    quote.historial.push({
      fecha: new Date().toISOString(),
      accion: 'cambio_estado',
      notas: `Estado cambiado de "${oldStatus}" a "${status}"`
    });

    await redis.set(id, quote);
    
    // Actualizar índice
    const quotesIndex = await redis.get('quotes_index') || [];
    const index = Array.isArray(quotesIndex) ? quotesIndex : [];
    const idx = index.findIndex(q => q.id === id);
    if (idx !== -1) {
      index[idx].status = status;
      await redis.set('quotes_index', index);
    }

    // Audit log
    await auditLog('cambio_estado', { id, oldStatus, newStatus: status }, req);

    return res.status(200).json({ success: true, message: 'Estado actualizado' });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
