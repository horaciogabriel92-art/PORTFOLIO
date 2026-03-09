# Caso de Estudio: Personal Shopper UY - Tema WooCommerce Custom

## 📝 Descripción del Proyecto
**Personal Shopper UY** es un eCommerce de moda en Uruguay, construido con un tema de WordPress y WooCommerce 100% personalizado y programado desde cero. El desarrollo se centró en lograr la **máxima conversión**, un **rendimiento optimizado**, y una **experiencia de usuario (UX) excepcional** especialmente para dispositivos móviles, dejando de lado los lentos temas multipropósito.

**URL del Sitio:** [personalshopperuy.com](https://personalshopperuy.com)

---

## 🛠️ Stack Tecnológico

*   **Backend:** PHP 7.4+, WordPress (como CMS base), y WooCommerce (motor de E-commerce).
*   **Frontend:** HTML5, **Tailwind CSS** (inyectado vía CDN con configuración personalizada para el diseño UI) y Vanilla JavaScript.
*   **Recursos Visuales:** Lucide Icons (CDN) y Google Fonts (Inter).
*   **Herramientas de Desarrollo y DevOps:** Python 3 para scripts de automatización, diagnóstico remoto y despliegue haciendo uso de la **WordPress REST API**.
*   **Constructores (Page Builders):** Compatibilidad controlada con **Elementor** (solo para páginas de contenido institucional, no en tienda).

---

## 🚀 ¿Qué se hizo? (Características Principales)

El proyecto consistió en crear un *Custom Theme* ligero y enfocado en ventas. Las funcionalidades más destacadas incluyen:

### 1. Funcionalidades Nativas de Conversión (Sin Plugins Externos)
*   **Barra de Envío Gratis:** Una barra de progreso dinámica que calcula en el carrito cuánto dinero le falta al usuario para calificar para el envío gratuito (umbral de $3000).
*   **Gatillos de Urgencia:** Un contador simulado/real que indica: *"X personas viendo este producto en este momento"*.
*   **Stock en Tiempo Real:** Un sistema de *AJAX polling* que consulta el stock del servidor cada 15 segundos para evitar carritos fallidos o solapamiento de compras en productos de inventario bajo.
*   **Sticky Cart (Móvil):** Un botón de compra que flota permanentemente en la pantalla al hacer scroll en celulares, asegurando que la acción principal nunca se pierda de vista.
*   **Incentivo de Transferencia Bancaria:** Avisos destacados en los productos y carrito mostrando el precio con un -10% de descuento automático al pagar mediante transferencia.

### 2. Flujo de Checkout Adaptado a LATAM
*   Creación de una **Página de Agradecimiento Personalizada** para pagos manuales (transferencia BACS). 
*   Muestra claramente los datos del Banco (Itaú) e integra un **Botón flotante de WhatsApp** que lleva al usuario directo al chat de la tienda para enviar su comprobante.

### 3. Área de Administración Simplificada
*   Múltiples opciones añadidas al **WordPress Customizer** nativo: cambio de colores de la marca, modificación del banner (Hero), configuración de botones y control total sobre una "Top Bar" de anuncios sin necesidad de tocar código.
*   Shortcodes construidos a medida como `[ps_product_grid]` para colocar bloques de productos (por categoría, más vendidos, etc.) en cualquier lugar.

---

## 🧩 Solución a Problemas y Desafíos Técnicos

### Desafío 1: Rendimiento vs. Builders (Elementor)
*   **El Problema:** Elementor añade demasiado DOM (código HTML innecesario) y scripts pesados, lo que destroza los Core Web Vitals y la velocidad en páginas donde cada milisegundo cuenta (Catálogos y Fichas de Producto).
*   **La Solución:** Se programó un filtro estricto en el hook `wp_enqueue_scripts` (`ps_dequeue_elementor_on_shop`) que **desactiva forzosamente Elementor en todas las páginas nativas de WooCommerce**. Elementor solo carga en landings estáticas, permitiendo que la tienda sea ultrarrápida. También se desactivaron los pesados `cart_fragments` de AJAX de Woo.

### Desafío 2: Despliegue (Deploy) Remoto
*   **El Problema:** El cliente no dispone fácilmente de flujos CI/CD convencionales y la edición de temas por el editor de WP estaba deshabilitada por seguridad; tampoco siempre era fiable acceder por FTP.
*   **La Solución:** Desarrollo de utilidades en **Python** (`deploy_wp.py` y `remote_diagnostics.py`). Estos scripts interactúan con la **REST API de WordPress** mediante tokens de "Application Passwords" (WP 5.6+), permitiendo revisar qué temas y plugins corren en producción y facilitar tareas de diagnóstico remoto desde la terminal local.

### Desafío 3: Cachés Agresivas Rompiendo el Diseño
*   **El Problema:** Los cambios CSS o de marcado a veces no se visualizaban en los clientes a causa de cachés de servidor (LiteSpeed/Redis) y de navegador.
*   **La Solución:** 
    *   **Cache Busting Dinámico:** Implementación de la función `time()` de PHP como versión en la cola de estilos (`wp_enqueue_style`), lo que obliga al navegador a descargar el nuevo CSS si hubo una modificación.
    *   **Bypass de Transients:** Hooks en WooCommerce con prioridad alta (`99`) en `wc_get_template` para forzar que el sistema use las plantillas de nuestra carpeta `/woocommerce/` saltándose las cachés (`transients`) que WooCommerce guarda en la base de datos.
