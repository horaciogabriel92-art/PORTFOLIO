import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  getAuthUser, 
  setCORSHeaders, 
  setSecurityHeaders, 
  sanitizeObject,
  auditLog,
  rateLimit 
} from './_utils/security.js';
import { Redis } from '@upstash/redis';
import knowledgeBase from '../knowledge_base.json' with { type: 'json' };

// Conectar a Redis para guardar historial
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const SYSTEM_PROMPT = `Eres un "Estimador de Proyectos Digitales Expert" especializado en calcular presupuestos de desarrollo de software.

=== CONTEXTO DEL DESARROLLADOR ===
Nombre: Horacio Morales
Perfil: Product Developer & AI Architect - Freelancer potenciado por agentes de IA
Metodología: Desarrollo acelerado con IA (40% más rápido que desarrollo tradicional)
Ubicación: LATAM (Uruguay/Argentina)

=== TARIFAS HORARIAS (USD) ===
MIS TARIFAS (Freelancer con IA):
- Desarrollo: $25/hora
- Diseño UI/UX: $20/hora  
- Consultoría: $30/hora
- Factor eficiencia IA: 0.6 (40% más rápido)

TARIFAS SOFTWARE FACTORY LATAM (Referencia):
- Mid-level: $50/hora
- Senior: $80/hora
- Tech Lead: $110/hora
- Diseño: $45/hora
- Project Manager: $60/hora
- Markup agencia: 2.5x

Promedio Software Factory LATAM: $53/hora

=== PLANTILLAS DE PROYECTOS (horas base) ===
- Landing Page: 24 horas (diseño 8 + dev 12 + testing 4)
- Sitio Web Corporativo: 70 horas
- E-commerce Simple: 130 horas
- E-commerce Custom: 310 horas
- SaaS MVP: 190 horas
- SaaS Completo: 600 horas
- App Móvil Simple: 155 horas
- App Móvil Compleja: 370 horas
- Dashboard Analytics: 190 horas
- Marketplace: 510 horas

=== MULTIPLICADORES ===
Complejidad: baja(1.0), media-baja(1.2), media(1.4), media-alta(1.7), alta(2.1), muy_alta(2.8)
Deadline: normal(1.0), tight(1.15), urgent(1.35)

=== FEATURES COMUNES (horas adicionales) ===
- Auth básica: +4h | Auth social: +8h | Roles: +16h
- Dashboard simple: +16h | Dashboard avanzado: +40h
- Pagos Stripe: +16h | Pagos MP: +12h | Suscripciones: +24h
- Chat simple: +24h | Chat realtime: +40h
- Búsqueda avanzada: +24h | Búsqueda Elastic: +40h

=== REGLAS DE ESTIMACIÓN ===
1. Calcular horas base según tipo de proyecto
2. Sumar horas por features adicionales
3. Aplicar multiplicador de complejidad
4. Aplicar multiplicador de deadline
5. Separar horas en: diseño, desarrollo, testing
6. Aplicar factor IA solo a desarrollo y testing (no a diseño)
7. Testing = 20% del tiempo de desarrollo
8. Calcular precio freelancer: (horas_diseño × $20) + (horas_dev × $25 × 0.6) + (horas_testing × $25 × 0.6 × 0.7)
9. Calcular precio software factory: (horas_totales × $53 × 2.5)
10. Comparativa: mostrar % de ahorro del cliente

=== ESTRUCTURA DE OUTPUT ===
{
  "mi_estimacion": {
    "horas_totales": number,
    "desglose_horas": {
      "diseno_ui_ux": number,
      "desarrollo": number,
      "testing_qa": number
    },
    "costo_total_usd": number,
    "rango_precio": { "min": number, "max": number },
    "tiempo_entrega_semanas": number,
    "factor_urgencia_aplicado": string,
    "factor_complejidad": string
  },
  "comparativa_mercado": {
    "software_factory_latam_usd": number,
    "ahorro_vs_factory_porcentaje": number,
    "ahorro_vs_factory_usd": number,
    "precio_hora_factory_promedio": number
  },
  "analisis": {
    "nivel_complejidad": "baja|media|alta|muy_alta",
    "tipo_proyecto": string,
    "riesgos_identificados": [string],
    "factores_ajuste": [string]
  },
  "desglose_fases": [
    { "fase": string, "horas": number, "entregables": [string] }
  ],
  "recomendaciones": {
    "stack_sugerido": string,
    "proximos_pasos": [string],
    "consideraciones": [string]
  }
}`;

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

  // Rate limiting: 15 estimaciones por hora
  const clientIP = req.headers['x-forwarded-for'] || 'unknown';
  const rateCheck = await rateLimit(`estimate:${clientIP}`, 15, 3600);
  if (!rateCheck.allowed) {
    return res.status(429).json({ success: false, error: 'Demasiadas estimaciones. Intenta más tarde.' });
  }

  try {
    const data = sanitizeObject(req.body);

    // Sanitización de inputs
    const sanitize = (str) => {
      if (typeof str !== 'string') return str;
      return str.replace(/[<>{}]/g, '').substring(0, 2000);
    };

    const datosLimpios = {
      tipo_proyecto: sanitize(data.tipo_proyecto),
      objetivo_negocio: sanitize(data.objetivo_negocio),
      publico_objetivo: sanitize(data.publico_objetivo),
      user_stories: sanitize(data.user_stories),
      stack_tecnologico: sanitize(data.stack_tecnologico),
      integraciones: sanitize(data.integraciones),
      features_adicionales: sanitize(data.features_adicionales),
      deadline: sanitize(data.deadline),
      complejidad_estimada: sanitize(data.complejidad_estimada),
      requisitos_especiales: sanitize(data.requisitos_especiales),
      nombre_cliente: sanitize(data.nombre_cliente),
      empresa: sanitize(data.empresa),
      quote_id: sanitize(data.quote_id)
    };

    // Buscar proyectos similares en historial (últimos 10)
    let proyectosSimilares = [];
    try {
      const historial = await redis.lrange('estimaciones:historial', 0, 9);
      proyectosSimilares = historial.map(h => JSON.parse(h)).filter(h => 
        h.tipo_proyecto === datosLimpios.tipo_proyecto
      ).slice(0, 3);
    } catch (e) {
      console.log('No hay historial disponible');
    }

    // Construir prompt con contexto de historial
    const historialContext = proyectosSimilares.length > 0 
      ? `\n=== PROYECTOS SIMILARES EN HISTORIAL ===\n${proyectosSimilares.map(p => 
          `- ${p.tipo_proyecto}: ${p.horas_reales}h reales (estimado: ${p.horas_estimadas}h)`
        ).join('\n')}`
      : '';

    const promptUsuario = `Genera estimación precisa basada en estos datos:

=== DATOS DEL PROYECTO ===
Tipo: ${datosLimpios.tipo_proyecto}
Objetivo: ${datosLimpios.objetivo_negocio}
Público: ${datosLimpios.publico_objetivo}
User Stories: ${datosLimpios.user_stories}

=== TÉCNICO ===
Stack: ${datosLimpios.stack_tecnologico}
Integraciones: ${datosLimpios.integraciones}
Features: ${datosLimpios.features_adicionales}

=== CONDICIONES ===
Deadline: ${datosLimpios.deadline}
Complejidad percibida: ${datosLimpios.complejidad_estimada}
Requisitos especiales: ${datosLimpios.requisitos_especiales}

Cliente: ${datosLimpios.nombre_cliente}, ${datosLimpios.empresa}
${historialContext}

INSTRUCCIÓN: Devuelve SOLO el JSON válido, sin markdown, sin explicaciones previas.`;

    // Usar Gemini 3.1 Flash Lite
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.1-flash-lite-preview',
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: promptUsuario }
    ]);

    const response = result.response;
    const text = response.text();
    
    let estimacion;
    try {
      estimacion = JSON.parse(text);
    } catch (e) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        estimacion = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Respuesta no válida');
      }
    }

    // Guardar en historial para futuras estimaciones
    const registroHistorial = {
      timestamp: new Date().toISOString(),
      quote_id: datosLimpios.quote_id,
      tipo_proyecto: datosLimpios.tipo_proyecto,
      horas_estimadas: estimacion.mi_estimacion?.horas_totales || 0,
      costo_estimado: estimacion.mi_estimacion?.costo_total_usd || 0,
      cliente: datosLimpios.nombre_cliente,
      empresa: datosLimpios.empresa
    };

    try {
      await redis.lpush('estimaciones:historial', JSON.stringify(registroHistorial));
      await redis.ltrim('estimaciones:historial', 0, 99); // Mantener últimas 100
    } catch (e) {
      console.log('Error guardando historial:', e);
    }

    // Guardar estimación vinculada al quote si existe quote_id
    if (datosLimpios.quote_id) {
      try {
        await redis.set(`quote:${datosLimpios.quote_id}:estimacion`, JSON.stringify(estimacion), { ex: 2592000 }); // 30 días
      } catch (e) {
        console.log('Error guardando estimación vinculada:', e);
      }
    }

    // Audit log
    await auditLog('estimacion_generada', { 
      cliente: datosLimpios.nombre_cliente,
      empresa: datosLimpios.empresa,
      tipo: datosLimpios.tipo_proyecto,
      horas: estimacion.mi_estimacion?.horas_totales,
      costo: estimacion.mi_estimacion?.costo_total_usd
    }, req);

    return res.status(200).json({
      success: true,
      estimacion,
      historial_proyectos_similares: proyectosSimilares.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al generar estimación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
