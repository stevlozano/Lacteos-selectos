# Instrucciones para Generar Iconos PWA

Para que la instalación PWA funcione en TODOS los dispositivos Android (Honor, Huawei, Samsung, etc.),
necesitas generar estos archivos PNG en la carpeta `public/`:

## Archivos Requeridos

1. **public/icon-192x192.png** (192x192 píxeles)
2. **public/icon-512x512.png** (512x512 píxeles)
3. **public/screenshot-narrow.png** (390x844 píxeles - tamaño móvil)
4. **public/screenshot-wide.png** (1280x720 píxeles - tamaño desktop)

## Cómo Generar

### Opción 1: Usar logo.svg (Recomendado)
Convierte el logo.svg a PNG usando cualquier herramienta online:
- https://convertio.co/es/svg-png/
- https://cloudconvert.com/svg-to-png

Sube `logo.svg` y descarga en los tamaños 192x192 y 512x512.

### Opción 2: Usar comando ImageMagick (si está instalado)
```bash
# Instalar ImageMagick primero:
# Ubuntu/Debian: sudo apt-get install imagemagick
# macOS: brew install imagemagick

convert public/logo.svg -resize 192x192 public/icon-192x192.png
convert public/logo.svg -resize 512x512 public/icon-512x512.png

# Para screenshots, captura pantallas de tu app y redimensiona:
convert screenshot-mobile.jpg -resize 390x844 public/screenshot-narrow.png
convert screenshot-desktop.jpg -resize 1280x720 public/screenshot-wide.png
```

### Opción 3: Usar Figma o Canva
1. Abre `logo.svg` en Figma o Canva
2. Exporta en PNG a 192x192 y 512x512
3. Guarda en la carpeta `public/`

## Importante
- Los iconos DEBEN ser PNG (no SVG, no WebP)
- Tamaños exactos: 192x192 y 512x512
- Sin transparencia en los bordes (para iconos adaptativos/maskables)
- Screenshots opcionales pero mejoran la tasa de instalación

## Verificación
Una vez generados, verifica que los archivos existen:
```bash
ls -la public/icon-*.png public/screenshot-*.png
```

## Por qué esto es necesario
Las marcas chinas (Honor, Huawei, Xiaomi) y Samsung tienen verificaciones estrictas:
- Requieren iconos PNG exactos de 192x192 y 512x512
- No aceptan SVG para el prompt de instalación
- El manifest debe tener screenshots para mostrar UI de instalación rica

Sin estos archivos, el navegador no mostrará el prompt "Agregar a pantalla de inicio".
