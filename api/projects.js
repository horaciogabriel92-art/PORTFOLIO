import { Redis } from '@upstash/redis';
import { getAuthUser, setCORSHeaders, setSecurityHeaders, rateLimit } from './_utils/security.js';

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

    if (id) {
      const proyecto = await redis.get(id);
      if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
      return res.status(200).json({ success: true, project: proyecto });
    }

    const projectsIndex = await redis.get('projects_index') || [];
    const projects = Array.isArray(projectsIndex) ? projectsIndex : [];

    projects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor'
    });
  }
}
