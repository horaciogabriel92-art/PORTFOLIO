import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const redis = new Redis({
      url: (process.env.UPSTASH_REDIS_REST_URL || '').trim(),
      token: (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim()
    });

    const data = req.body;
    const onboardingId = data.id || `onb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const onboarding = {
      id: onboardingId,
      tipo: 'onboarding',
      status: data.status || 'activo',
      created_at: timestamp,
      updated_at: timestamp,
      quote_source: data.quote_source || null,
      
      // Cliente
      cliente: {
        nombre: data.cliente_nombre,
        email: data.cliente_email,
        empresa: data.cliente_empresa,
        telefono: data.cliente_telefono
      },
      
      // Proyecto
      proyecto: {
        nombre: data.proyecto_nombre,
        tipo: data.proyecto_tipo,
        presupuesto_acordado: data.presupuesto_acordado
      },
      
      // Fase de Descubrimiento
      descubrimiento: {
        objetivo_negocio: data.objetivo_negocio,
        publico_objetivo: data.publico_objetivo,
        dolor_actual: data.dolor_actual,
        metricas_exito: data.metricas_exito,
        fecha_limite: data.fecha_limite,
        canal_comunicacion: data.canal_comunicacion
      },
      
      // Requerimientos Técnicos
      requerimientos: {
        user_stories: data.user_stories,
        stack: data.stack || [],
        integraciones: data.integraciones || [],
        performance: data.performance,
        notas_tecnicas: data.notas_tecnicas
      },
      
      // Tech Access
      tech_access: {
        acceso_dominio: data.acceso_dominio === 'on',
        acceso_hosting: data.acceso_hosting === 'on',
        acceso_wp: data.acceso_wp === 'on',
        acceso_repositorio: data.acceso_repositorio === 'on',
        activo_logo: data.activo_logo === 'on',
        activo_colores: data.activo_colores === 'on',
        activo_tipografias: data.activo_tipografias === 'on',
        activo_imagenes: data.activo_imagenes === 'on',
        activo_manual: data.activo_manual === 'on',
        deposito_50: data.deposito_50 === 'on',
        contrato_firmado: data.contrato_firmado === 'on'
      },
      
      // Milestones (se generarán automáticamente)
      milestones: [],
      
      // Trello
      trello_board_url: null
    };

    await redis.set(onboardingId, onboarding);
    
    // Si viene de una cotización, actualizar el estado
    if (data.quote_source) {
      const quote = await redis.get(data.quote_source);
      if (quote) {
        quote.status = 'onboarding';
        quote.onboarding_id = onboardingId;
        await redis.set(data.quote_source, quote);
      }
    }

    return res.status(200).json({ success: true, id: onboardingId });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
