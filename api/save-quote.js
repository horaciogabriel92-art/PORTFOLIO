import { Redis } from '@upstash/redis';
import { 
  generateSecureId, 
  sanitizeObject, 
  validateEmail, 
  detectInjection,
  encryptClientData,
  setCORSHeaders,
  setSecurityHeaders,
  rateLimit 
} from './_utils/security.js';

/**
 * API Route: /api/save-quote
 * Method: POST
 * Guarda una nueva cotización desde el formulario simplificado
 */

const VALIDACIONES = {
  project_type: { type: 'string', maxLength: 50, required: true },
  project_goal: { type: 'string', maxLength: 2000, required: true },
  features: { type: 'string', maxLength: 500, required: false },
  timeline: { type: 'string', maxLength: 50, required: true },
  budget_range: { type: 'string', maxLength: 50, required: true },
  nombre_cliente: { type: 'string', maxLength: 100, required: true },
  email_cliente: { type: 'email', maxLength: 100, required: true },
  empresa: { type: 'string', maxLength: 100, required: false },
  telefono: { type: 'string', maxLength: 50, required: false },
  notas_adicionales: { type: 'string', maxLength: 2000, required: false },
  idioma: { type: 'string', maxLength: 10, required: false }
};

function validarDatos(body) {
  const errores = [];
  const datosSanitizados = {};
  
  for (const [campo, config] of Object.entries(VALIDACIONES)) {
    const valor = body[campo];
    
    if (config.required && (!valor || valor.trim() === '')) {
      errores.push(`El campo '${campo}' es requerido`);
      continue;
    }
    
    if (!valor) continue;
    
    // Detectar inyección
    if (detectInjection(valor)) {
      errores.push(`Contenido no permitido en '${campo}'`);
      continue;
    }
    
    // Validar email
    if (config.type === 'email' && !validateEmail(valor)) {
      errores.push(`El email no es válido`);
      continue;
    }
    
    // Sanitizar y truncar
    let valorLimpio = sanitizeObject({ temp: valor }).temp;
    if (config.maxLength && valorLimpio.length > config.maxLength) {
      valorLimpio = valorLimpio.substring(0, config.maxLength);
    }
    
    datosSanitizados[campo] = valorLimpio;
  }
  
  return { errores, datosSanitizados };
}

export default async function handler(req, res) {
  setSecurityHeaders(res);
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  // Rate limiting: 3 cotizaciones por hora por IP
  const clientIP = req.headers['x-forwarded-for'] || 'unknown';
  const rateCheck = await rateLimit(`quote:${clientIP}`, 3, 3600);
  if (!rateCheck.allowed) {
    return res.status(429).json({ 
      success: false, 
      error: 'Demasiadas cotizaciones. Intenta más tarde.' 
    });
  }

  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ success: false, error: 'Body inválido' });
    }

    const { errores, datosSanitizados } = validarDatos(req.body);
    if (errores.length > 0) {
      return res.status(400).json({ success: false, error: 'Validación fallida', detalles: errores });
    }

    const redis = new Redis({
      url: (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').trim(),
      token: (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '').trim()
    });

    // Generar ID seguro con UUID
    const quoteId = generateSecureId('quote');
    const timestamp = new Date().toISOString();

    // Calcular prioridad
    let prioridad = 'media';
    if (datosSanitizados.timeline === 'asap') prioridad = 'alta';
    if (datosSanitizados.budget_range === '10k+' || datosSanitizados.project_type === 'ecommerce') prioridad = 'alta';

    // Preparar datos del cliente encriptados
    const clienteRaw = {
      nombre: datosSanitizados.nombre_cliente,
      email: datosSanitizados.email_cliente,
      empresa: datosSanitizados.empresa || null,
      telefono: datosSanitizados.telefono || null,
      idioma: datosSanitizados.idioma || 'es'
    };
    
    // Encriptar datos sensibles del cliente
    const clienteEncriptado = encryptClientData(clienteRaw);

    const cotizacion = {
      id: quoteId,
      tipo: 'cotizacion',
      status: 'nueva',
      prioridad,
      created_at: timestamp,
      updated_at: timestamp,
      // No guardamos IP por privacidad (GDPR)
      
      // Datos del cliente ENCRIPTADOS
      cliente: clienteEncriptado,
      
      // Datos del proyecto
      proyecto: {
        tipo: datosSanitizados.project_type,
        objetivo: datosSanitizados.project_goal,
        features: datosSanitizados.features,
        timeline: datosSanitizados.timeline,
        budget_range: datosSanitizados.budget_range,
        notas: datosSanitizados.notas_adicionales
      },
      
      // Estimación preliminar
      estimacion_preliminar: {
        rango_precio: calcularRangoPrecio(datosSanitizados.project_type, datosSanitizados.features),
        tiempo_estimado: calcularTiempo(datosSanitizados.project_type, datosSanitizados.timeline),
        complejidad: calcularComplejidad(datosSanitizados.project_type, datosSanitizados.features)
      },
      
      // Campos para completar después
      descubrimiento_completo: null,
      requerimientos_tecnicos: null,
      propuesta_final: null,
      trello_board_url: null,
      
      // Historial
      historial: [{
        fecha: timestamp,
        accion: 'cotizacion_creada',
        notas: 'Cotización recibida desde formulario web'
      }]
    };

    await redis.set(quoteId, cotizacion);
    
    // Agregar a índice (sin datos sensibles)
    const quotesIndex = await redis.get('quotes_index') || [];
    const index = Array.isArray(quotesIndex) ? quotesIndex : [];
    index.push({
      id: quoteId,
      tipo: datosSanitizados.project_type,
      status: 'nueva',
      prioridad,
      created_at: timestamp
      // NO incluimos nombre, email, empresa en el índice por privacidad
    });
    await redis.set('quotes_index', index);

    console.log(`Cotización guardada: ${quoteId}`);

    return res.status(201).json({
      success: true,
      message: 'Cotización guardada',
      quote_id: quoteId
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: 'Error interno' });
  }
}

function calcularRangoPrecio(tipo, features) {
  const base = {
    'landing': { min: 800, max: 1500 },
    'website': { min: 2000, max: 3500 },
    'webapp': { min: 3000, max: 8000 },
    'ecommerce': { min: 4000, max: 10000 },
    'notsure': { min: 1000, max: 5000 }
  };
  
  let rango = base[tipo] || base.notsure;
  
  if (features && features.includes('payments')) {
    rango.min += 500; rango.max += 1200;
  }
  if (features && features.includes('users')) {
    rango.min += 400; rango.max += 800;
  }
  
  return { moneda: 'USD', ...rango };
}

function calcularTiempo(tipo, timeline) {
  const baseSemanas = {
    'landing': 1,
    'website': 3,
    'webapp': 6,
    'ecommerce': 5,
    'notsure': 4
  };
  
  let semanas = baseSemanas[tipo] || 4;
  
  if (timeline === 'asap') semanas = Math.max(1, semanas - 1);
  if (timeline === 'flexible') semanas += 1;
  
  return { semanas, descripcion: `${semanas} semanas` };
}

function calcularComplejidad(tipo, features) {
  if (tipo === 'webapp' || tipo === 'ecommerce') return 'alta';
  if (features && (features.includes('payments') || features.includes('users'))) return 'media-alta';
  if (tipo === 'website') return 'media';
  return 'baja';
}
