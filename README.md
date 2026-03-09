# 🚀 Horacio Morales - Developer Portfolio

<div align="center">
  
  [![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.2.1-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
  [![AI](https://img.shields.io/badge/AI-Architect-8A2BE2?style=flat-square&logo=openai)]
  [![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
  
  **🌐 Live Demo:** [portfolio.estudioforgelab.com](https://portfolio.estudioforgelab.com)
  
</div>

---

## 💡 La Historia Detrás de Este Portfolio

> *"Empecé con un hosting de $5 y WordPress con Softaculous. Pasé 3 días tratando de cambiar el color del header. Esa frustración se convirtió en curiosidad..."*

Después de **6 años** construyendo productos digitales, decidí crear algo que reflejara verdaderamente cómo trabajo: como **Product Developer & AI Architect**.

**Mi diferencia:** No solo escribo código. Diseño la arquitectura, orquesto sistemas de IA como mi equipo de desarrollo, y curo el resultado final. Productos entregados en semanas, no meses.

**Quería demostrar que puedo:**
- 🔧 Construir sistemas completos: frontend → backend → deploy
- 🤖 Integrar IA como ventaja competitiva (no como reemplazo)
- 🎨 Crear experiencias interactivas sin frameworks pesados
- 🛡️ Implementar seguridad empresarial

---

## ✨ Lo Que Hace Especial a Este Portfolio

### 🎯 **Interactive Labs** - Demostraciones Técnicas Reales

8 módulos interactivos construidos **puros JavaScript vanilla** (sin React, sin Vue, sin librerías):

| Lab | Tecnología | Complejidad |
|-----|------------|-------------|
| 🎴 **Tarot Shuffle System** | Fisher-Yates Algorithm + CSS 3D Transforms | Algoritmo O(n) con animaciones |
| 📋 **Kanban Board** | HTML5 Drag & Drop API | Event handling nativo |
| 🔐 **Password Strength** | RegExp + Real-time Validation | Validación en tiempo real |
| 🎨 **Canvas Particles** | Canvas API + RequestAnimationFrame | Sistema de partículas |
| ⌨️ **Typewriter Effect** | Async/Await + Recursion | Animación secuencial |
| 🔄 **3D Card Flip** | CSS 3D Transforms | perspective + preserve-3d |
| 📜 **Virtual Scroll** | Performance Optimization | 10,000 items renderizados |
| ✨ **Particle Background** | Canvas + Math | Conexiones dinámicas |

> **¿Por qué vanilla JS?** Para demostrar comprensión profunda de los fundamentos web, no solo dependencia de frameworks.

---

## 🏗️ Arquitectura del Sistema

### **Frontend** (Portfolio + Quote Form + Documentation)
```
Vite 7.3.1
├── Tailwind CSS 4.2.1 (utility-first + Dark/Light mode)
├── Vanilla JavaScript (ES6+ modules)
├── Canvas API (Particle systems)
├── Lucide Icons (CDN)
└── Google Fonts (Inter, JetBrains Mono)
```

### **Backend** (Serverless APIs)
```
Vercel Serverless Functions
├── Node.js 20.x
├── @upstash/redis (Database)
├── @google/generative-ai (Gemini 2.0 Flash)
├── bcryptjs (Password hashing)
└── crypto-js (AES encryption)
```

### **Flujo de Datos Seguro**
```
Cliente → POST /api/save-quote
              ↓
        [Rate Limiting: 3/hr]
              ↓
        [Sanitización XSS]
              ↓
        [Encriptación AES]
              ↓
        Redis (Upstash)
              ↓
Admin → GET /api/quotes
              ↓
        [JWT Auth]
              ↓
        [Desencriptación]
              ↓
        Panel Admin
```

---

## 🔐 Seguridad Implementada

Este portfolio maneja datos de clientes reales, así que la seguridad es prioridad:

| Capa | Implementación |
|------|----------------|
| **Autenticación** | JWT con expiración (1 hora) |
| **Hashing** | bcrypt (12 rounds) |
| **Encriptación** | AES-256 para datos PII |
| **Rate Limiting** | Redis-based (3 cotizaciones/hora por IP) |
| **Sanitización** | XSS protection + HTML escaping |
| **Headers** | HSTS, CSP, X-Frame-Options, nosniff |
| **CORS** | Restringido a dominio específico |

### **Compliance**
- ✅ GDPR: Datos personales encriptados
- ✅ No almacenamiento de IPs
- ✅ Audit logging de acciones admin

---

## 🤖 Integración con IA (Gemini)

El **Project Estimator** usa Google Gemini 2.0 Flash para generar estimaciones inteligentes:

```javascript
// Prompt engineering para value-based pricing
const estimacion = await model.generateContent([
  SYSTEM_PROMPT,  // Criterios de pricing especializado
  datosProyecto   // Input del cliente
]);

// Output: JSON estructurado con
// - Rango de precios (USD)
// - Tiempo estimado (semanas)
// - Desglose por categorías
// - Stack sugerido
```

**Resultado:** Cotizaciones profesionales generadas en segundos, no horas.

---

## 📊 Performance & Optimización

```
Lighthouse Scores (aproximados):
├── Performance: 95+
├── Accessibility: 95+
├── Best Practices: 100
└── SEO: 90+

Bundle Size:
├── main.js: ~15KB (gzipped)
├── style.css: ~8KB (gzipped)
└── Total: <100KB (sin imágenes)

Técnicas:
├── Code splitting por rutas
├── Lazy loading de componentes
├── CSS purged (Tailwind)
├── Canvas optimizado (requestAnimationFrame)
└── Redis caching para APIs
```

---

## 🛠️ Stack Tecnológico Completo

### **Core**
![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white)

### **Database & Backend**
![Redis](https://img.shields.io/badge/-Upstash%20Redis-DC382D?logo=redis&logoColor=white)
![Vercel](https://img.shields.io/badge/-Vercel%20Functions-000000?logo=vercel&logoColor=white)

### **AI & APIs**
![Google Gemini](https://img.shields.io/badge/-Google%20Gemini-4285F4?logo=google&logoColor=white)
![Trello](https://img.shields.io/badge/-Trello%20API-0052CC?logo=trello&logoColor=white)

### **Tools**
![Git](https://img.shields.io/badge/-Git-F05032?logo=git&logoColor=white)
![VS Code](https://img.shields.io/badge/-VS%20Code-007ACC?logo=visual-studio-code&logoColor=white)

---

## 🚀 Deployment

```bash
# Local development
npm install
npm run dev

# Production build
npm run build
npm run preview

# Deploy to Vercel
vercel --prod
```

### **Variables de Entorno Requeridas**
```bash
# AI
GOOGLE_API_KEY=your_gemini_api_key

# Database
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=your_token

# Security
JWT_SECRET=your_jwt_secret_32chars
ENCRYPTION_KEY=your_encryption_key_32chars
ADMIN_PASSWORD_HASH=bcrypt_hash_here
```

---

## 📁 Estructura del Proyecto

```
portfolio/
├── 📄 index.html                 # Portfolio principal
├── 📁 api/                       # Serverless functions
│   ├── _utils/security.js       # Utils: JWT, crypto, rate limiting
│   ├── save-quote.js            # POST: Guardar cotización
│   ├── quotes.js                # GET: Listar cotizaciones (auth)
│   ├── estimate.js              # POST: Estimación con Gemini (auth)
│   ├── auth-login.js            # POST: Login admin
│   └── ...
├── 📁 src/
│   ├── main.js                  # Lógica del portfolio
│   └── style.css                # Estilos + Tailwind
├── 📁 quote/
│   └── index.html               # Formulario wizard de cotización
├── 📁 admin/
│   └── index.html               # Panel de administración
├── 📁 documentation/
│   └── index.html               # Documentación técnica API
├── 📄 vercel.json               # Configuración de rutas y headers
├── 📄 vite.config.js            # Configuración de build
└── 📄 README.md                 # Este archivo
```

---

## 🎯 Resultados & Métricas

- **50+** productos entregados
- **6 años** self-taught (no CS degree)
- **100%** AI-accelerated workflow
- **0** frameworks en los Interactive Labs (vanilla JS)
- **<100ms** respuesta promedio de APIs

---

## 📞 Contacto

¿Tienes un proyecto en mente?

- 🌐 **Portfolio:** [portfolio.estudioforgelab.com](https://portfolio.estudioforgelab.com)
- 💼 **LinkedIn:** [linkedin.com/in/horacio-morales](https://linkedin.com)
- 📧 **Email:** [contacto@estudioforgelab.com](mailto:contacto@estudioforgelab.com)
- 🐦 **Twitter:** [@horaciomorales](https://twitter.com)

---

## 📝 Licencia

Este proyecto es **open source** con fines educativos. 

Los **Interactive Labs** pueden usarse como referencia para aprender:
- Algoritmos (Fisher-Yates)
- APIs nativas del navegador
- Patrones de diseño (State Machine)
- Técnicas de animación CSS/JS

**Nota:** Los datos de clientes y la lógica de negocio específica están protegidos y no deben reproducirse sin permiso.

---

<div align="center">

**⭐ Si este proyecto te fue útil, dale una estrella!**

*Construido con 💙, ☕ y muchas horas de debugging a las 2 AM*

</div>
