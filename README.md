# Horacio Morales — Portfolio

[![Vercel](https://img.shields.io/badge/Live%20Site-Vercel-000?style=flat-square&logo=vercel)](https://portfolio.estudioforgelab.com)
[![Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20Tailwind%20%7C%20JS-38B2AC?style=flat-square)](https://developer.mozilla.org)

> **Product Developer & AI Architect** — Construyo productos digitales con IA como ventaja competitiva. Mejor código, menos horas.

---

## Qué es esto

Mi portfolio no es una plantilla. Es una demostración técnica de cómo trabajo:

- **Frontend:** HTML vanilla, Tailwind CSS, JavaScript puro. Sin frameworks que escondan la complejidad.
- **Backend:** APIs serverless en Vercel, autenticación JWT, encriptación AES.
- **IA:** Gemini Flash Lite para estimaciones de proyectos en tiempo real.
- **Seguridad:** Rate limiting, XSS protection, CORS configurado. No es un toy project.

---

## Estructura

```
├── index.html              # Portfolio principal + 8 Interactive Labs
├── proyecto-*.html         # Case studies reales (3 proyectos)
├── admin/                  # Panel de gestión con auth JWT
├── api/                    # Endpoints serverless (Node.js)
│   ├── auth-login.js       # JWT + bcrypt
│   ├── estimate.js         # Gemini AI integration
│   ├── trello-create.js    # Automación de proyectos
│   └── ...
├── onboarding/             # Formulario de estimación con IA
├── quote/                  # Sistema de cotizaciones
└── documentation/          # Docs técnicas del sistema
```

---

## Proyectos Destacados

| Proyecto | Stack | Qué resolví |
|----------|-------|-------------|
| **[Personal Shopper UY](proyecto-personal-shopper.html)** | WordPress + WooCommerce + Tailwind | Tema 100% custom. Conversiones +15% vs temas genéricos. |
| **[Bordados Pando](proyecto-bordados-pando.html)** | Next.js + Firebase + Genkit AI | ERP SaaS con IA integrada para gestión de bordados. |
| **[Arrancandonga](proyecto-arrancandonga.html)** | Astro + Tailwind | Migración React→Astro. 100/100 Lighthouse. |

---

## Interactive Labs

8 demostraciones técnicas en vanilla JS (sin React, sin librerías):

- **State Management** — Sistema de estados con máquina de estados finita
- **Drag & Drop API** — Kanban board nativo con persistencia
- **3D CSS Transforms** — Flip cards con perspective nativa
- **Live Code Editor** — Console override para ejecución segura
- **Password Strength** — Validación en tiempo real con regex
- **Comparison Slider** — Interacción táctil y mouse
- **Command Palette** — ⌘K interface con fuzzy search
- **Data Visualization** — Charts sin librerías externas

---

## Cómo trabajo

**No uso IA para reemplazar el pensamiento.** La uso para:

- Arquitectura de sistemas (mejores decisiones técnicas)
- Generación de tests (cobertura sin escribir 500 líneas)
- Optimización de código (refactoring sin romper nada)
- Documentación técnica (que sí se mantenga actualizada)

**Mi factor de eficiencia:** IA aplicada correctamente reduce el tiempo de desarrollo sin sacrificar calidad. No porque escriba más rápido, porque tomo mejores decisiones con menos iteraciones.

---

## Deploy

```bash
# Local
npx serve .

# Producción
vercel --prod
```

---

## Contacto

- **Web:** [portfolio.estudioforgelab.com](https://portfolio.estudioforgelab.com)
- **Email:** contacto@estudioforgelab.com
- **LinkedIn:** [horaciomorales](https://linkedin.com/in/horaciomorales)

---

**Cómo empecé:** En 2018 compré un hosting de $5, instalé WordPress con Softaculous, y pasé tres días tratando de cambiar el color del header. Esa frustración se convirtió en curiosidad.

**Dónde estoy:** Algún proyecto salió mal. Otros se rompieron. Aprendí a debuggear a las 2 AM mientras un cliente esperaba su launch. Ahora construyo con propósito: código limpio, tiempos de carga rápidos, e interfaces que no confunden a los usuarios.

No tengo un título de CS. Tengo Google, paciencia, y un folder de experimentos fallidos que me enseñaron qué funciona.
