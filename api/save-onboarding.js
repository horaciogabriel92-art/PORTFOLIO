import { Redis } from '@upstash/redis';
import { 
  generateSecureId,
  sanitizeObject,
  encryptClientData,
  decryptClientData,
  setCORSHeaders,
  setSecurityHeaders,
  getAuthUser,
  auditLog,
  rateLimit
} from './_utils/security.js';

export default async function handler(req, res) {
  setSecurityHeaders(res);
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verificar autenticación para operaciones de escritura
  const user = getAuthUser(req);
  
  // Rate limiting: 20 requests por minuto
  const clientIP = req.headers['x-forwarded-for'] || 'unknown';
  const rateCheck = await rateLimit(`onboarding:${clientIP}`, 20, 60);
  if (!rateCheck.allowed) {
    return res.status(429).json({ success: false, error: 'Rate limit exceeded' });
  }

  try {
    const redis = new Redis({
      url: (process.env.UPSTASH_REDIS_REST_URL || '').trim(),
      token: (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim()
    });

    const data = sanitizeObject(req.body);
    
    // Usar UUID seguro
    const onboardingId = data.id || generateSecureId('onb');
    const timestamp = new Date().toISOString();
    const esBorrador = data.status === 'borrador';

    // Sanitizar todos los campos de texto
    const onboarding = {
      id: onboardingId,
      tipo: 'onboarding',
      status: data.status || 'activo',
      created_at: timestamp,
      updated_at: timestamp,
      quote_source: data.quote_source || null,
      
      // Cliente encriptado
      cliente: encryptClientData({
        nombre: data.cliente_nombre || '',
        email: data.cliente_email || '',
        empresa: data.cliente_empresa || '',
        telefono: data.cliente_telefono || ''
      }),
      
      // Proyecto
      proyecto: {
        nombre: sanitizeObject({ n: data.proyecto_nombre || '' }).n,
        tipo: data.proyecto_tipo || '',
        presupuesto_acordado: data.presupuesto_acordado || ''
      },
      
      // Descubrimiento sanitizado
      descubrimiento: {
        objetivo_negocio: sanitizeObject({ n: data.objetivo_negocio || '' }).n,
        publico_objetivo: sanitizeObject({ n: data.publico_objetivo || '' }).n,
        dolor_actual: sanitizeObject({ n: data.dolor_actual || '' }).n,
        metricas_exito: sanitizeObject({ n: data.metricas_exito || '' }).n,
        fecha_limite: data.fecha_limite || '',
        canal_comunicacion: data.canal_comunicacion || 'email'
      },
      
      // Requerimientos
      requerimientos: {
        user_stories: sanitizeObject({ n: data.user_stories || '' }).n,
        stack: Array.isArray(data.stack) ? data.stack : [],
        integraciones: Array.isArray(data.integraciones) ? data.integraciones : [],
        performance: data.performance || '90',
        notas_tecnicas: sanitizeObject({ n: data.notas_tecnicas || '' }).n
      },
      
      // Tech Access
      tech_access: {
        acceso_dominio: data.acceso_dominio === true || data.acceso_dominio === 'on',
        acceso_hosting: data.acceso_hosting === true || data.acceso_hosting === 'on',
        acceso_wp: data.acceso_wp === true || data.acceso_wp === 'on',
        acceso_repositorio: data.acceso_repositorio === true || data.acceso_repositorio === 'on',
        activo_logo: data.activo_logo === true || data.activo_logo === 'on',
        activo_colores: data.activo_colores === true || data.activo_colores === 'on',
        activo_tipografias: data.activo_tipografias === true || data.activo_tipografias === 'on',
        activo_imagenes: data.activo_imagenes === true || data.activo_imagenes === 'on',
        activo_manual: data.activo_manual === true || data.activo_manual === 'on',
        deposito_50: data.deposito_50 === true || data.deposito_50 === 'on',
        contrato_firmado: data.contrato_firmado === true || data.contrato_firmado === 'on'
      },
      
      trello_board_url: data.trello_board_url || null
    };

    await redis.set(onboardingId, onboarding);
    
    // Actualizar índice (sin datos sensibles)
    const onboardingsIndex = await redis.get('onboardings_index') || [];
    const index = Array.isArray(onboardingsIndex) ? onboardingsIndex : [];
    
    const existingIdx = index.findIndex(o => o.id === onboardingId);
    const indexEntry = {
      id: onboardingId,
      proyecto: onboarding.proyecto.nombre,
      status: onboarding.status,
      presupuesto: onboarding.proyecto.presupuesto_acordado,
      created_at: timestamp
      // NO incluimos cliente, empresa en el índice
    };
    
    if (existingIdx >= 0) {
      index[existingIdx] = indexEntry;
    } else {
      index.push(indexEntry);
    }
    
    await redis.set('onboardings_index', index);
    
    // Si viene de cotización, actualizar estado
    if (data.quote_source && data.status === 'completado') {
      const quote = await redis.get(data.quote_source);
      if (quote) {
        quote.status = 'onboarding';
        quote.onboarding_id = onboardingId;
        await redis.set(data.quote_source, quote);
      }
    }

    // Audit log
    if (user) {
      await auditLog(esBorrador ? 'onboarding_borrador' : 'onboarding_guardado', 
        { id: onboardingId }, req);
    }

    return res.status(200).json({ 
      success: true, 
      id: onboardingId,
      message: esBorrador ? 'Borrador guardado' : 'Onboarding guardado'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
