# 🧵 Bordados Pando - ERP Industrial

Sistema de gestión de producción para industria de bordados. Desarrollado con **Next.js 15**, **Firebase** y **Genkit AI**.

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Next.js 15    │────▶│  Firebase Auth   │────▶│  Firestore DB    │
│   (Frontend)    │◄────│  (Auth)          │◄────│  (Real-time)     │
└─────────────────┘     └──────────────────┘     └──────────────────┘
         │                                                    │
         ▼                                                    ▼
┌─────────────────┐                                  ┌──────────────────┐
│  Vercel Hosting │                                  │  Firebase        │
│  $0/mes         │                                  │  Storage         │
└─────────────────┘                                  └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Google Gemini  │  ◄── Generación de mockups con IA
│  (Genkit)       │
└─────────────────┘
```

## 🚀 Quick Start

### 1. Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd bordados-pando-erp

# Instalar dependencias
npm install

# Instalar Firebase CLI (global)
npm install -g firebase-tools
```

### 2. Configuración

```bash
# Crear archivo de variables locales
cp .env.example .env.local

# Editar .env.local con tus credenciales Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project
# ... (resto de variables)
```

### 3. Desarrollo Local

```bash
# Opción A: Solo frontend (conecta a Firebase producción)
npm run dev

# Opción B: Full local con emuladores (RECOMENDADO)
npm run dev:full

# Esto inicia:
# - Next.js en http://localhost:9002
# - Firebase Emulators en http://localhost:4000
# - Firestore en puerto 8080
# - Auth en puerto 9099
```

### 4. Seed de Datos (Primera vez)

Con los emuladores corriendo, en otra terminal:

```bash
# Crear máquinas y pedidos de ejemplo
npm run seed:all

# O paso a paso:
cd seed && node seed-data.js    # Datos de máquinas y pedidos
cd seed && node auth-users.js   # Usuarios de prueba
```

**Usuarios de prueba creados:**

| Usuario | Email | Contraseña | Rol |
|-----------|-------|------------|-----|
| Administrador | `admin@bordadospando.com` | `admin123456` | admin |
| Gerente | `gerente@bordadospando.com` | `gerente123` | manager |
| Taller | `taller@bordadospando.com` | `taller123` | operator |
| Pedidos | `pedidos@bordadospando.com` | `pedidos123` | manager |

> **Nota:** Con emuladores activos también podés usar cualquier email/contraseña.

## 📁 Estructura del Proyecto

```
proyecto_tar/
├── src/
│   ├── app/
│   │   ├── (public)/           # Rutas públicas
│   │   │   ├── page.tsx        # Landing
│   │   │   └── cotizar/        # Cotizador
│   │   ├── (admin)/            # Rutas protegidas
│   │   │   ├── layout.tsx      # Layout con auth
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── taller/         # Panel de máquinas
│   │   │   ├── pedidos/        # Gestión de pedidos
│   │   │   ├── ventas/         # Reportes
│   │   │   └── staff/          # Personal
│   │   ├── login/              # Página de login
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # Shadcn UI
│   │   └── admin/              # Componentes admin
│   ├── firebase/
│   │   ├── config.ts           # Configuración
│   │   ├── auth.ts             # Hooks de auth
│   │   ├── provider.tsx        # Firebase Provider
│   │   └── firestore/          # Hooks de Firestore
│   ├── ai/                     # Genkit flows
│   └── lib/
│       ├── types.ts            # TypeScript types
│       └── utils.ts            # Utilidades
├── seed/                       # Datos de prueba
├── firebase.json               # Config Firebase
├── firestore.rules             # Reglas de seguridad
└── storage.rules               # Reglas de storage
```

## 🔐 Autenticación

### Roles de Usuario

- **admin**: Acceso total
- **manager**: Pedidos, ventas, staff
- **operator**: Solo panel de taller (su máquina)
- **client**: Portal de cliente (futuro)

### Flujo de Login

1. Usuario accede a `/login`
2. Firebase Auth verifica credenciales
3. Hook `useAuth` actualiza estado global
4. Middleware protege rutas `/admin/*`

## 🎨 Sistema de Diseño

### Colores

```css
--primary:    Indigo 500   (#6366f1)  /* Acciones principales */
--secondary:  Violet 500   (#8b5cf6)  /* Énfasis secundario */
--accent:     Emerald 500  (#10b981)  /* Éxito/positivo */
--destructive: Red 500     (#ef4444)  /* Errores/urgente */
```

### Componentes

- **Glass Card**: `className="glass-card"` - Efecto vidrio esmerilado
- **Gradient Text**: `className="bg-gradient-to-r from-primary to-secondary bg-clip-text"`
- **Animations**: `animate-in fade-in duration-500`

## 🚢 Deploy

### Opción 1: Vercel + Firebase (Recomendado)

```bash
# 1. Crear proyecto en Vercel
# 2. Configurar variables de entorno en Vercel Dashboard
# 3. Deploy automático en cada push a main

# Configurar Firebase para producción
firebase use --add  # Seleccionar proyecto
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Opción 2: Firebase Hosting (Todo en Firebase)

```bash
# Build y deploy
npm run build
firebase deploy
```

## 💰 Costos Estimados

| Servicio | Plan | Costo Mensual |
|----------|------|---------------|
| Vercel | Hobby | **$0** |
| Firebase | Spark | **$0** |
| Gemini API | Free Tier | **$0** |
| **TOTAL** | | **$0** |

### Cuándo pagarías

- **> 50K lecturas/día** → Firebase Blaze (~$5-15/mes)
- **> 100GB transferencia** → Vercel Pro ($20/mes)
- **Uso intensivo de IA** → Gemini API (~$5-20/mes)

## 🧪 Testing

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Emuladores para testing
npm run dev:emulators
```

## 📝 Scripts Útiles

```bash
# Desarrollo
npm run dev              # Solo Next.js
npm run dev:full         # Next.js + Emuladores
npm run dev:emulators    # Solo emuladores

# Deploy
npm run deploy           # Deploy completo
npm run deploy:hosting   # Solo hosting
npm run deploy:rules     # Solo reglas de seguridad

# Utilidades
npm run seed:export      # Exportar datos de emuladores
npm run firebase:login   # Login a Firebase
```

## 🐛 Troubleshooting

### Error: "Firebase App already initialized"
- Solución: Recargar página o reiniciar emuladores

### Error: "Permission denied" en Firestore
- Verificar que `NEXT_PUBLIC_USE_EMULATOR=true` en `.env.local`
- Verificar reglas en `firestore.rules`

### Emuladores no inician
```bash
# Limpiar caché
rm -rf seed/firestore_export
firebase emulators:start --import=./seed
```

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)

## 📄 Licencia

Proyecto privado - Bordados Pando © 2026

---

**Desarrollado con ❤️ usando Next.js + Firebase**
