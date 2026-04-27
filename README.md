# Lácteos Selectos - Guía de Desarrollo

Sistema de pedidos online con notificaciones push para pequeños negocios de delivery.

## Índice

- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Guía de Inicio](#guía-de-inicio)
- [Configuración](#configuración)
- [Desarrollo por Módulos](#desarrollo-por-módulos)
- [Personalización](#personalización)
- [Despliegue](#despliegue)

## Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 15.x | Framework React con App Router |
| React | 19.x | UI Components |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 3.x | Estilos |
| Supabase | - | Base de datos y Realtime |
| Web Push API | - | Notificaciones push |
| web-push | 3.x | Librería servidor push |
| Bubblewrap | - | Generación APK (TWA) |

## Estructura del Proyecto

```
lacteos-pedidos/
├── src/
│   ├── app/                 # Rutas Next.js App Router
│   │   ├── admin/
│   │   │   └── dashboard/   # Panel admin (pedidos, notificaciones)
│   │   ├── api/
│   │   │   └── push/send/   # API para enviar notificaciones
│   │   ├── layout.tsx       # Layout principal con Providers
│   │   └── page.tsx         # Página tienda (catálogo)
│   ├── components/
│   │   ├── AdminNotifications.tsx   # Gestión notificaciones admin
│   │   ├── Cart.tsx                 # Carrito desktop
│   │   ├── MobileCart.tsx           # Carrito móvil
│   │   ├── Icons.tsx                # Iconos SVG
│   │   └── PWAInstaller.tsx         # Instalador PWA
│   ├── context/
│   │   ├── CartContext.tsx          # Estado del carrito
│   │   ├── NotificationsContext.tsx # Gestión push subscriptions
│   │   └── OrdersContext.tsx        # Gestión pedidos + notificaciones
│   └── lib/
│       └── supabase.ts      # Cliente Supabase
├── public/
│   ├── sw.js                # Service Worker (push + cache)
│   ├── manifest.json        # PWA manifest
│   └── icon-*.png           # Iconos PWA
├── supabase/
│   └── migrations/          # SQL para tablas
├── android-app/             # Configuración TWA
└── package.json
```

## Guía de Inicio

### 1. Crear Proyecto Base

```bash
npx create-next-app@latest mi-negocio --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd mi-negocio
```

### 2. Instalar Dependencias

```bash
npm install @supabase/supabase-js web-push
npm install -D @types/web-push
```

### 3. Configurar Variables de Entorno

Crear `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-key

# Web Push (generar con: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu-public-key
VAPID_PRIVATE_KEY=tu-private-key
```

### 4. Configurar Supabase

Ejecutar en SQL Editor:

```sql
-- Tabla de productos
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'unidad',
  image TEXT,
  category TEXT DEFAULT 'general',
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de pedidos
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  items JSONB NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  notes TEXT,
  location TEXT,
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) DEFAULT 'efectivo',
  credit_due_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de suscripciones push
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_type VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Políticas RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);
```

## Desarrollo por Módulos

### Módulo 1: Catálogo de Productos

**Archivo:** `src/app/page.tsx`

```tsx
// Componente principal: Lista de productos con carrito
// Features:
// - Grid de productos con imágenes
// - Selector de cantidad
// - Botón "Agregar al carrito"
// - Carrito flotante (mobile/desktop)
```

**Personalizar:**
- Modificar array `products` con tus productos
- Cambiar colores en clases Tailwind
- Ajustar moneda (S/ → $)

### Módulo 2: Carrito y Checkout

**Archivos:** 
- `src/components/Cart.tsx` (desktop)
- `src/components/MobileCart.tsx` (móvil)

**Features:**
- Gestión de cantidades
- Formulario de datos cliente
- Selector método de pago (Yape, Efectivo, Crédito)
- Integración WhatsApp
- Geolocalización GPS

**Personalizar:**
- Cambiar número WhatsApp en `generateWhatsAppMessage()`
- Modificar campos del formulario
- Agregar/quitar métodos de pago

### Módulo 3: Notificaciones Push

**Archivos:**
- `src/context/NotificationsContext.tsx` - Gestión suscripciones
- `src/app/api/push/send/route.ts` - API envío
- `public/sw.js` - Service Worker
- `src/components/AdminNotifications.tsx` - UI admin

**Flujo:**
1. Cliente visita sitio → Service Worker registra
2. Admin activa notificaciones → Guarda en Supabase
3. Nuevo pedido → Busca suscripciones admin → Envia push
4. Suscripción expirada → Elimina automáticamente (410)

**Personalizar:**
- Modificar título/body notificaciones en `OrdersContext.tsx`
- Cambiar iconos en `manifest.json`

### Módulo 4: Panel Admin

**Archivo:** `src/app/admin/dashboard/page.tsx`

**Features:**
- Lista de pedidos con filtros
- Cambiar estado (pendiente → aprobado → en camino → entregado)
- Editar método de pago
- Eliminar pedidos con confirmación modal
- Notificaciones cliente (cuando se aprueba/envía)

**Personalizar:**
- Agregar nuevos estados de pedido
- Modificar estilos de tarjetas
- Agregar métricas/estadísticas

### Módulo 5: PWA + App Android

**Archivos:**
- `public/manifest.json` - Configuración PWA
- `public/sw.js` - Service Worker
- `android-app/twa-manifest.json` - Config TWA
- `src/components/PWAInstaller.tsx` - UI instalación

**Generar APK:**
```bash
cd android-app
npx @bubblewrap/cli build
```

**Personalizar:**
- Cambiar `theme_color`, `background_color` en manifest
- Modificar `short_name` (max 12 chars para app)
- Generar iconos con: https://pwa-asset-generator.nicepkg.cn/

## Personalización Rápida

### Cambiar Colores Principales

```css
/* tailwind.config.ts */
colors: {
  primary: '#000000',    /* Negro */
  secondary: '#ffffff',  /* Blanco */
  accent: '#22c55e',     /* Verde éxito */
  danger: '#ef4444',     /* Rojo error */
  warning: '#f97316',    /* Naranja crédito */
}
```

### Cambiar Datos del Negocio

| Dato | Ubicación | Variable |
|------|-----------|----------|
| Nombre | `manifest.json` | `name`, `short_name` |
| WhatsApp | `MobileCart.tsx`, `Cart.tsx` | `51932398293` |
| Moneda | Todos los componentes | `S/` → `$` |
| Colores | `manifest.json` | `theme_color` |

### Agregar Nuevo Método de Pago

1. En `Cart.tsx` y `MobileCart.tsx`:
```tsx
// Agregar botón
<button onClick={() => setFormData({...formData, paymentMethod: 'nuevo'})}>
  Nuevo Método
</button>
```

2. Actualizar tipado:
```tsx
type PaymentMethod = 'yape' | 'efectivo' | 'credito' | 'nuevo';
```

3. Modificar mensaje WhatsApp:
```tsx
const paymentLabels = { nuevo: 'Nuevo Método' };
```

## Despliegue

### Web (Vercel)

```bash
npm run build
# Subir a GitHub y conectar con Vercel
```

**Variables de entorno en Vercel:**
- Todas las de `.env.local`

### App Android

1. Generar keystore (una vez):
```bash
keytool -genkey -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000
```

2. Crear TWA:
```bash
npx @bubblewrap/cli init --manifest=https://tu-web.vercel.app/manifest.json
npx @bubblewrap/cli build
```

3. Subir `app-release-signed.apk` a Play Console

## Solución de Problemas

### Notificaciones no llegan
1. Verificar VAPID keys en `.env.local`
2. Comprobar que service worker esté registrado
3. Revisar consola navegador por errores 410 (suscripción expirada)
4. Admin debe re-suscribirse si las suscripciones fueron eliminadas

### Error WebSocket Supabase
- Verificar proyecto no esté en pausa (Supabase dashboard)
- Revisar límite de conexiones en plan gratuito

### App no instala
- Verificar manifest.json tenga todos los campos requeridos
- Iconos deben ser PNG (no SVG) para Android
- `short_name` máximo 12 caracteres

## Recursos Adicionales

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [TWA Guide](https://developer.chrome.com/docs/android/trusted-web-activity/)

---

**Creado con:** Next.js + Supabase + Web Push API  
**Deploy:** Vercel (Web) + Play Store (App)
