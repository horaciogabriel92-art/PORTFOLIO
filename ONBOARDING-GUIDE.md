# 🚀 Onboarding & Estimador de Proyectos con IA

Sistema completo de onboarding para clientes con estimación automática de precios y tiempos usando Gemini AI.

## 📋 Características

- **Formulario Wizard** de 4 pasos con todas las preguntas exploratorias
- **Estimación con IA** usando Gemini 2.0 Flash
- **Almacenamiento seguro** en Vercel KV con sanitización contra inyecciones
- **Pricing basado en valor** (Value-Based Pricing) para Vibe Coders
- **Checklist de onboarding** visible para el cliente
- **Protección XSS** y validación de datos

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Frontend | HTML + Tailwind CSS + Vanilla JS |
| Backend | Vercel Serverless Functions (Node.js) |
| IA | Google Generative AI (Gemini 2.0 Flash) |
| Base de Datos | Upstash Redis |
| Hosting | Vercel |

## 📁 Estructura

```
portfolio/
├── api/
│   ├── estimate.js       # API: Genera estimación con Gemini
│   ├── save-project.js   # API: Guarda proyecto en KV (protegido)
│   └── projects.js       # API: Lista proyectos (admin)
├── onboarding/
│   └── index.html        # Página del formulario wizard
├── vercel.json           # Configuración de rutas
└── package.json          # Dependencias
```

## 🚀 Despliegue en Vercel

### Paso 1: Instalar dependencias
```bash
npm install
```

### Paso 2: Configurar variables de entorno
1. Copia `.env.example` a `.env.local` (desarrollo local)
2. En Vercel Dashboard → Settings → Environment Variables, agrega:

| Variable | Descripción | Obtener en |
|----------|-------------|------------|
| `GOOGLE_API_KEY` | API Key de Gemini | https://aistudio.google.com/app/apikey |
| `UPSTASH_REDIS_REST_URL` | URL de Upstash | Upstash Console o Vercel Integrations |
| `UPSTASH_REDIS_REST_TOKEN` | Token de Upstash | Upstash Console o Vercel Integrations |
| `ADMIN_TOKEN` | Token para admin | Genera uno aleatorio seguro |

### Paso 3: Configurar Upstash Redis
1. Ve a Vercel Dashboard → Marketplace → Redis
2. Selecciona "Upstash Redis"
3. Crea nuevo database (gratis incluye 10,000 requests/día)
4. Conecta a tu proyecto
5. Las variables se agregan automáticamente como `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`

### Paso 4: Deploy
```bash
vercel --prod
```

O conecta tu repo GitHub en Vercel Dashboard.

## 🔐 Seguridad

### Protecciones implementadas:

1. **Sanitización HTML**: Todos los inputs se escapan (`<`, `>`, `&`, etc.)
2. **Detección de inyección**: Patrones de XSS/JavaScript bloqueados
3. **Validación de email**: Formato correcto requerido
4. **Limitación de longitud**: Máximo 3000 caracteres por campo
5. **Rate limiting**: Por IP (implementación simple)
6. **Security headers**: X-Frame-Options, X-XSS-Protection, etc.

### Patrones bloqueados:
- `<script>` tags
- `javascript:` protocolos
- Event handlers (`onclick=`, etc.)
- `eval()`, `document.cookie`, `document.location`
- Template literal injection `${}`

## 📊 Criterios de Estimación (Gemini Prompt)

La IA utiliza estos criterios para calcular:

### Precio (Value-Based Pricing)

| Factor | Base | Recargo |
|--------|------|---------|
| Landing Page | $800-1,500 | - |
| Web + CMS | $2,000-3,500 | +20-30% headless |
| WebApp simple | $3,000-5,000 | - |
| WebApp compleja | $5,000-8,000+ | - |
| E-commerce | $4,000-10,000+ | - |
| Integraciones | - | +$300-800 c/u |
| Urgencia (<2 sem) | - | +50% |

### Tiempo (Efecto Vibe Coder)
- IA genera código en 1 día → Cliente ve: 5 días
- Multiplicador: x2 medianos, x3 complejos
- Desglose: Arquitectura (2d) + Refactor (1d) + Testing (1d) + Entrega (1d)

## 🔌 APIs

### POST /api/estimate
Genera estimación con Gemini.

**Request:**
```json
{
  "objetivo_negocio": "...",
  "publico_objetivo": "...",
  "user_stories": "...",
  "stack_tecnologico": "...",
  ...
}
```

**Response:**
```json
{
  "success": true,
  "estimacion": {
    "rango_precio": { "min": 3000, "max": 5000 },
    "tiempo_estimado": { "semanas": 4 },
    "desglose": { ... },
    "analisis_negocio": { ... },
    "recomendaciones": { ... }
  }
}
```

### POST /api/save-project
Guarda proyecto en KV.

**Características:**
- Sanitiza todos los inputs
- Genera ID único (`proj_timestamp_random`)
- Crea estructura completa de onboarding
- Indexa para búsqueda

### GET /api/projects
Lista proyectos (requiere `Authorization: Bearer ADMIN_TOKEN`).

## 🎨 Personalización

### Modificar criterios de precio
Edita `SYSTEM_PROMPT` en `api/estimate.js`:

```javascript
const SYSTEM_PROMPT = `Eres un "Consultor de Proyectos Digitales Senior"...
  // Modifica rangos de precio aquí
`;
```

### Agregar campos al formulario
1. Edita `onboarding/index.html`
2. Agrega validación en `api/save-project.js` → `VALIDACIONES`
3. Actualiza el prompt de Gemini en `api/estimate.js`

### Cambiar modelo de Gemini
```javascript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash', // Cambia aquí
  // ...
});
```

## 📱 Flujo del Cliente

1. **Llega a `/onboarding`** → Ve formulario profesional
2. **Completar 3 pasos** → Descubrimiento, Requerimientos, Contacto
3. **Paso 4** → IA procesa y muestra estimación
4. **Resultado** → Rango de precio, tiempo, desglose, recomendaciones
5. **CTA** → Agendar call o descargar estimación

## 🔧 Troubleshooting

### "Error al generar estimación"
- Verifica `GOOGLE_API_KEY` en Vercel Dashboard
- Revisa logs: `vercel logs --tail`

### "Error guardando proyecto"
- Verifica variables Redis (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
- Asegúrate de tener Upstash Redis integrado al proyecto

### CORS errors
Las APIs tienen CORS configurado para `*`. En producción, restringe a tu dominio:

```javascript
res.setHeader('Access-Control-Allow-Origin', 'https://tudominio.com');
```

## 📝 TODO / Mejoras futuras

- [ ] Integración con Calendly API para agendar
- [ ] Envío de email con estimación (Resend)
- [ ] Panel admin visual para ver proyectos
- [ ] Exportar estimación como PDF
- [ ] Webhook a Slack cuando llega nuevo proyecto
- [ ] Autenticación OAuth para panel admin

---

**Creado para:** Horacio Morales - Vibe Coder Senior
**Stack:** Next.js + WordPress Headless + Vercel + Gemini
