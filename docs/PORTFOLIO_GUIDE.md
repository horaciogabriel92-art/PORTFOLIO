# Guía de Portafolio: Bordados Pando ERP

Este proyecto es una vitrina de ingeniería de software moderna, integrando gestión industrial en tiempo real con Inteligencia Artificial.

## Puntos Destacados para Reclutadores

### 1. Gestión de Estado en Tiempo Real (Real-time ERP)
- **Tecnología**: Firebase Firestore Snapshots.
- **Implementación**: El Monitor de Taller (`src/app/admin/taller/page.tsx`) se actualiza instantáneamente cuando un operario completa un pedido o una máquina cambia de estado, sin recargar la página.
- **Valor**: Demuestra dominio de aplicaciones reactivas y sincronización de datos asíncrona.

### 2. Integración de IA Generativa (GenAI)
- **Tecnología**: Genkit v1.x + Google Gemini 2.5 Flash Image.
- **Implementación**: El flujo de bordado (`src/ai/flows/generate-embroidery-mockup.ts`) toma un logo del cliente y genera una previsualización realista sobre una prenda física.
- **Valor**: Capacidad de integrar modelos de IA avanzados para resolver problemas de negocio reales.

### 3. Lógica de Negocio Compleja
- **Priorización Jerárquica**: Algoritmo que calcula la urgencia de los pedidos basándose en el "Deadline" y la capacidad de las máquinas.
- **Código de Colores Dinámico**: Sistema de alertas visuales (Verde/Amarillo/Rojo/Crítico) que guía la toma de decisiones.

## Cómo mostrar este proyecto
- **Graba un video**: Muestra el flujo desde que se carga un pedido hasta que se completa en el taller.
- **Muestra el código de la Semilla**: El archivo `src/app/admin/seed/page.tsx` demuestra tu habilidad para crear herramientas de desarrollo que facilitan el testing y la auditoría.
