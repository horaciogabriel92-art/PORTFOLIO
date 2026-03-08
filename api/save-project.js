import { Redis } from '@upstash/redis';
import { 
  generateSecureId,
  sanitizeObject,
  getAuthUser,
  setCORSHeaders,
  setSecurityHeaders,
  auditLog,
  rateLimit
} from './_utils/security.js';

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
    const redis = new Redis({
      url: (process.env.UPSTASH_REDIS_REST_URL || '').trim(),
      token: (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim()
    });

    const data = sanitizeObject(req.body);
    const projectId = generateSecureId('proj');
    const timestamp = new Date().toISOString();

    const proyecto = {
      id: projectId,
      tipo: 'proyecto',
      ...data,
      created_at: timestamp,
      updated_at: timestamp
    };

    await redis.set(projectId, proyecto);

    // Actualizar índice
    const projectsIndex = await redis.get('projects_index') || [];
    const index = Array.isArray(projectsIndex) ? projectsIndex : [];
    index.push({
      id: projectId,
      nombre: data.nombre,
      status: data.status || 'activo',
      created_at: timestamp
    });
    await redis.set('projects_index', index);

    // Audit log
    await auditLog('proyecto_creado', { id: projectId, nombre: data.nombre }, req);

    return res.status(201).json({
      success: true,
      id: projectId,
      message: 'Proyecto guardado'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
