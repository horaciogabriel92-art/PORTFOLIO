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

  // Rate limiting
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
    if (!id) return res.status(400).json({ error: 'ID requerido' });

    const onboarding = await redis.get(id);
    
    if (!onboarding) {
      return res.status(404).json({ success: false, error: 'Onboarding no encontrado' });
    }

    // Desencriptar datos del cliente
    if (onboarding.cliente) {
      onboarding.cliente = decryptClientData(onboarding.cliente);
    }

    return res.status(200).json({ success: true, onboarding });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
