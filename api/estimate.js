import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  getAuthUser, 
  setCORSHeaders, 
  setSecurityHeaders, 
  sanitizeObject,
  auditLog,
  rateLimit 
} from './_utils/security.js';

const SYSTEM_PROMPT = `Eres un "Consultor de Proyectos Digitales Senior" especializado en estimaciones de desarrollo web.

CONTEXTO DEL DESARROLLADOR:
- Tipo: Vibe Coder Senior (usa IA generativa)
- Especialidad: Next.js + WordPress Headless + WebApps
- Velocidad: Exponencialmente más rápido que desarrollo tradicional
- Metodología: Value-Based Pricing (no cobra por horas)

CRITERIOS DE CALCULO DE PRECIO:

1. CRITERIO DE COMPLEJIDAD:
   - Landing Page Estática: $800 - $1,500
   - Web con CMS/CMS Headless: $2,000 - $3,500
   - WebApp con lógica: $3,000 - $5,000
   - WebApp compleja (pagos, APIs): $5,000 - $8,000+
   - E-commerce: $4,000 - $10,000+

2. CRITERIO DE ESPECIALIDAD:
   - Aplicar 20-30% de recargo por beneficios de velocidad

3. CRITERIO DE INTEGRACIONES:
   - Cada API: +$300 - $800
   - Stripe/Pagos: +$500 - $1,200
   - CRM: +$200 - $500

4. CRITERIO DE URGENCIA:
   - Rápida (2-3 semanas): +25%
   - Urgente (<2 semanas): +50%

REGLAS DE OUTPUT:
1. SIEMPRE responder en formato JSON válido
2. Incluir rango de precio (min-max) en USD
3. Incluir tiempo estimado en semanas
4. Desglosar por categorías

ESTRUCTURA JSON:
{
  "estimacion": {
    "rango_precio": { "min": number, "max": number, "moneda": "USD" },
    "tiempo_estimado": { "semanas": number, "dias_habiles": number },
    "desglose": { "base": number, "integraciones": number, "urgencia": number }
  },
  "analisis_negocio": {
    "nivel_complejidad": "bajo|medio|alto",
    "tipo_proyecto": "string",
    "factores_valor": ["string"]
  },
  "recomendaciones": {
    "stack_sugerido": "string",
    "proximos_pasos": ["string"]
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

  // Rate limiting: 10 estimaciones por hora (cuestan dinero usar Gemini)
  const clientIP = req.headers['x-forwarded-for'] || 'unknown';
  const rateCheck = await rateLimit(`estimate:${clientIP}`, 10, 3600);
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
      objetivo_negocio: sanitize(data.objetivo_negocio),
      publico_objetivo: sanitize(data.publico_objetivo),
      dolor_actual: sanitize(data.dolor_actual),
      metricas_exito: sanitize(data.metricas_exito),
      fecha_limite: sanitize(data.fecha_limite),
      presupuesto_rango: sanitize(data.presupuesto_rango),
      user_stories: sanitize(data.user_stories),
      stack_tecnologico: sanitize(data.stack_tecnologico),
      integraciones: sanitize(data.integraciones),
      requerimientos_performance: sanitize(data.requerimientos_performance),
      nombre_cliente: sanitize(data.nombre_cliente),
      email_cliente: sanitize(data.email_cliente),
      empresa: sanitize(data.empresa)
    };

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json'
      }
    });

    const promptUsuario = `Genera estimación basada en estos datos:

=== FASE DE DESCUBRIMIENTO ===
Objetivo: ${datosLimpios.objetivo_negocio}
Público: ${datosLimpios.publico_objetivo}
Dolor actual: ${datosLimpios.dolor_actual}
Métricas: ${datosLimpios.metricas_exito}
Fecha límite: ${datosLimpios.fecha_limite}
Presupuesto: ${datosLimpios.presupuesto_rango}

=== REQUERIMIENTOS ===
User Stories: ${datosLimpios.user_stories}
Stack: ${datosLimpios.stack_tecnologico}
Integraciones: ${datosLimpios.integraciones}
Performance: ${datosLimpios.requerimientos_performance}

Cliente: ${datosLimpios.nombre_cliente}, ${datosLimpios.empresa}`;

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

    // Audit log
    await auditLog('estimacion_generada', { 
      cliente: datosLimpios.nombre_cliente,
      empresa: datosLimpios.empresa 
    }, req);

    return res.status(200).json({
      success: true,
      estimacion,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al generar estimación'
    });
  }
}
