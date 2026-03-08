# 🔒 AUDITORÍA DE SEGURIDAD - PORTFOLIO
**Fecha:** 7 de marzo de 2026  
**Proyecto:** portfolio.estudioforgelab.com  
**Tipo:** Aplicación web full-stack con panel de administración

---

## 📋 1. MAPA DE ENDPOINTS API

### Endpoints Públicos (Sin Autenticación)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| POST | `/api/save-quote` | Guarda nueva cotización | project_type, project_goal, features, timeline, budget_range, nombre_cliente, email_cliente, empresa, telefono, notas_adicionales |
| GET | `/api/quotes` | Lista todas las cotizaciones | `?id=` (opcional) |
| POST | `/api/save-onboarding` | Guarda onboarding | id, status, cliente_*, proyecto_*, descubrimiento.*, requerimientos.*, tech_access.* |
| GET | `/api/list-onboardings` | Lista onboardings | `?status=activo\|completado\|todos` |
| GET | `/api/get-onboarding` | Obtiene onboarding por ID | `?id=` |
| POST | `/api/trello-create` | Crea tablero Trello | quote_id OR onboarding_id, project_name, client_name |
| POST | `/api/update-status` | Cambia estado de cotización | id, status |
| POST | `/api/estimate` | Genera estimación con Gemini | objetivo_negocio, publico_objetivo, etc. |

### Endpoints de Debug/Testing (¡PELIGRO!)

| Método | Endpoint | Descripción | Riesgo |
|--------|----------|-------------|--------|
| GET | `/api/debug` | Muestra variables de entorno | **CRÍTICO** |
| GET | `/api/test-redis` | Test de conexión Redis | **ALTO** |

---

## 🛠️ 2. STACK TECNOLÓGICO

### Frontend
- **Framework:** Vite 7.3.1
- **CSS:** TailwindCSS 4.2.1
- **UI:** Lucide Icons (CDN)
- **Build:** Node.js build.js custom

### Backend / APIs
- **Runtime:** Node.js (serverless functions en Vercel)
- **Base de datos:** Upstash Redis (REST API)
- **AI:** Google Gemini 2.0 Flash
- **Integraciones:** Trello API

### Infraestructura
- **Hosting:** Vercel (Serverless)
- **Dominio:** portfolio.estudioforgelab.com
- **SSL:** Automático (Vercel/Cloudflare)

### Variables de Entorno Detectadas
```bash
# Base de datos
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
KV_REST_API_URL      # Fallback
KV_REST_API_TOKEN    # Fallback

# Trello
TRELLO_API_KEY
TRELLO_TOKEN

# Google AI
GOOGLE_API_KEY
```

---

## 🚨 3. VULNERABILIDADES ENCONTRADAS

### 🔴 CRÍTICO - NIVEL 10/10

#### VULN-001: Endpoint `/api/debug.js` expone SECRETOS
**Archivo:** `api/debug.js`  
**Riesgo:** Exposición total de API keys, tokens y variables de entorno  
**Impacto:** Un atacante puede acceder a TODAS las credenciales del sistema

```javascript
// CÓDIGO VULNERABLE:
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    redis_url: process.env.UPSTASH_REDIS_REST_URL,
    trello_key: process.env.TRELLO_API_KEY,  // 🔴 EXPUESTO
    google_key: process.env.GOOGLE_API_KEY,  // 🔴 EXPUESTO
    // ...
  });
}
```

**Prueba de concepto:**
```bash
curl https://portfolio.estudioforgelab.com/api/debug
```

**Mitigación INMEDIATA:**
```javascript
// Eliminar o proteger el endpoint:
export default async function handler(req, res) {
  // Solo permitir en desarrollo local
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).end();
  }
  // ... resto del código
}
```

---

### 🟠 ALTO - NIVEL 8/10

#### VULN-002: Ausencia TOTAL de Autenticación
**Endpoints afectados:** TODOS los `/api/*`  
**Riesgo:** Cualquiera puede leer/escribir en la base de datos  
**Impacto:** Robo de datos de clientes, manipulación de cotizaciones

**Prueba de concepto:**
```bash
# Leer TODAS las cotizaciones sin login
curl https://portfolio.estudioforgelab.com/api/quotes

# Modificar estado de cualquier cotización
curl -X POST https://portfolio.estudioforgelab.com/api/update-status \
  -H "Content-Type: application/json" \
  -d '{"id":"quote_xxx","status":"aprobada"}'
```

**Mitigación:** Implementar JWT o session-based auth para `/admin` y APIs sensibles.

---

#### VULN-003: CORS abierto a todos los dominios
**Archivo:** `vercel.json` y todos los endpoints  

```json
{
  "headers": [{
    "source": "/api/(.*)",
    "headers": [
      { "key": "Access-Control-Allow-Origin", "value": "*" }  // 🔴 CUALQUIER ORIGEN
    ]
  }]
}
```

**Riesgo:** Un sitio malicioso puede hacer peticiones a tu API desde el navegador de la víctima  
**Impacto:** CSRF, exfiltración de datos

**Mitigación:**
```json
{
  "headers": [{
    "source": "/api/(.*)",
    "headers": [
      { "key": "Access-Control-Allow-Origin", "value": "https://portfolio.estudioforgelab.com" }
    ]
  }]
}
```

---

### 🟡 MEDIO - NIVEL 5/10

#### VULN-004: Sanitización incompleta en `/api/save-onboarding`
**Archivo:** `api/save-onboarding.js`

No hay sanitización de los campos:
- `objetivo_negocio`
- `dolor_actual`
- `user_stories`
- `notas_tecnicas`

**Riesgo:** XSS almacenado (Stored XSS)  
**Impacto:** Ejecución de JavaScript cuando el admin ve el onboarding

**Mitigación:** Agregar sanitización HTML igual que en `save-quote.js`.

---

#### VULN-005: Rate Limiting ausente
**Endpoints afectados:** Todos los POST  
**Riesgo:** Brute force, DoS, consumo excesivo de cuota (Gemini, Trello)  
**Impacto:** Costos inesperados, negación de servicio

**Mitigación:** Implementar rate limiting en Vercel Edge Config o usar upstash rate limiting.

---

#### VULN-006: IDs predecibles
**Archivo:** `api/save-quote.js`, `api/save-onboarding.js`

```javascript
const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

**Riesgo:** `Date.now()` es predecible, permite enumeración de IDs  
**Impacto:** Un atacante puede iterar sobre IDs y leer cotizaciones ajenas

**Mitigación:**
```javascript
import { randomUUID } from 'crypto';
const quoteId = `quote_${randomUUID()}`;
```

---

#### VULN-007: Exposición de IP del cliente
**Archivo:** `api/save-quote.js` línea 83, 113

```javascript
const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
// ...
ip_cliente: clientIP,  // Se guarda en Redis
```

**Riesgo:** GDPR/privacidad - guardando PII sin consentimiento  
**Impacto:** Problemas legales, exposición de ubicación de clientes

**Mitigación:** Hashear la IP o no guardarla.

---

### 🟢 BAJO - NIVEL 2/10

#### VULN-008: Información de stack expuesta
**Archivo:** `vite.config.js`, headers de respuesta

Los errores de API pueden exponer:
- Rutas internas del servidor
- Versiones de dependencias
- Estructura del proyecto

**Mitigación:** Usar mensajes de error genéricos en producción.

---

## 🎯 4. EXPOSICIÓN DE DATOS SENSIBLES

### Datos almacenados en Redis (sin encriptación)

```javascript
// Estructura de cotización (quote:*)
{
  id: "quote_timestamp_random",
  cliente: {
    nombre: "Juan Pérez",           // PII
    email: "juan@email.com",        // PII
    telefono: "+54 11 1234-5678"    // PII
  },
  ip_cliente: "190.XXX.XXX.XXX",     // PII
  proyecto: { ... },
  historial: [ ... ]
}

// Estructura de onboarding (onb_*)
{
  id: "onb_timestamp_random",
  cliente: { nombre, email, ... },   // PII
  descubrimiento: {
    objetivo_negocio: "...",        // Información comercial sensible
    dolor_actual: "...",            // Información comercial sensible
  },
  tech_access: {
    acceso_wp: true,                // Información sobre infraestructura
    // ...
  }
}
```

**Riesgo:** Si Redis se ve comprometido, toda la información de clientes queda expuesta.

---

## 🛡️ 5. RECOMENDACIONES PRIORITARIAS

### ACCIÓN INMEDIATA (Hoy)

1. **Eliminar `/api/debug.js` y `/api/test-redis.js`**
   ```bash
   rm api/debug.js api/test-redis.js
   git commit -m "fix: remove debug endpoints"
   ```

2. **Configurar autenticación básica para `/admin`**
   Implementar HTTP Basic Auth o una password simple.

3. **Restringir CORS**
   ```json
   // vercel.json
   {
     "headers": [{
       "source": "/api/(.*)",
       "headers": [
         { "key": "Access-Control-Allow-Origin", "value": "https://portfolio.estudioforgelab.com" }
       ]
     }]
   }
   ```

### ACCIÓN CORTO PLAZO (Esta semana)

4. **Agregar rate limiting**
   - Máximo 10 requests/minuto por IP para POST
   - Máximo 100 requests/hora para GET

5. **Sanitizar TODOS los inputs**
   Aplicar la misma sanitización de `save-quote.js` a todos los endpoints.

6. **Cambiar a UUIDs**
   Reemplazar `Date.now() + Math.random()` por `crypto.randomUUID()`.

7. **Encriptar PII en Redis**
   - Emails, teléfonos, IPs
   - Usar AES-256 con key en env var

### ACCIÓN MEDIO PLAZO (Este mes)

8. **Implementar autenticación JWT**
   - Login para admin
   - Tokens con expiración
   - Refresh tokens

9. **Audit logging**
   - Quién hace qué y cuándo
   - IPs de administradores
   - Intentos fallidos

10. **Backup y retención**
    - Política de retención de datos (GDPR)
    - Backups cifrados de Redis

---

## 📊 6. SCORE DE SEGURIDAD

| Categoría | Score | Máximo |
|-----------|-------|--------|
| Autenticación | 0/10 | 10 |
| Autorización | 0/10 | 10 |
| Sanitización de Input | 5/10 | 10 |
| Manejo de Secretos | 2/10 | 10 |
| CORS | 2/10 | 10 |
| Rate Limiting | 0/10 | 10 |
| Logging/Auditoría | 3/10 | 10 |
| Encriptación de Datos | 0/10 | 10 |
| **TOTAL** | **12/80** | **80** |

**Clasificación:** 🔴 **CRÍTICO** - No apto para producción con datos reales

---

## 🔧 7. COMANDOS PARA VERIFICAR VULNERABILIDADES

```bash
# 1. Verificar exposición de debug endpoint
curl -s https://portfolio.estudioforgelab.com/api/debug | jq .

# 2. Listar todas las cotizaciones sin auth
curl -s https://portfolio.estudioforgelab.com/api/quotes | jq '.quotes | length'

# 3. Verificar CORS
curl -I -H "Origin: https://evil.com" \
  https://portfolio.estudioforgelab.com/api/quotes

# 4. Enumeración de IDs (si es predecible)
for i in $(seq 1740000000000 1740000000100); do
  curl -s "https://portfolio.estudioforgelab.com/api/quotes?id=quote_${i}_xxxxxxxxx"
done
```

---

## 📝 8. CHECKLIST DE REMEDIACIÓN

- [ ] Eliminar endpoints de debug
- [ ] Implementar autenticación en /admin
- [ ] Restringir CORS
- [ ] Agregar rate limiting
- [ ] Sanitizar todos los inputs
- [ ] Cambiar IDs a UUID v4
- [ ] Encriptar PII en Redis
- [ ] Configurar headers de seguridad (HSTS, CSP)
- [ ] Implementar audit logging
- [ ] Hacer pentest con herramienta automática (OWASP ZAP)

---

## 👤 9. DATOS DEL AUDITOR

**Auditor:** Kimi Code CLI  
**Fecha:** 2026-03-07  
**Versión revisada:** commit actual (HEAD)  
**Metodología:** OWASP Top 10 2021, SANS Top 25

---

## 📞 10. CONTACTO Y REPORTE

Si encontrás esta información expuesta en internet, reportala inmediatamente al administrador del sistema.

**NOTA:** Este documento contiene información sensible. No compartir públicamente.
