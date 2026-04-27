# App Admin - Lácteos Selectos

Esta es la configuración para generar el APK de administración.

## Características

- **Package ID:** `com.lacteosselectos.admin` (diferente a la app de clientes)
- **Nombre:** "Lácteos Selectos - Admin"
- **URL inicial:** `/admin/dashboard` (abre directamente en el panel admin)
- **Notificaciones:** Activadas (para recibir alertas de nuevos pedidos)

## Generar APK de Admin

```bash
cd /home/codeol/Documentos/lacteos-pedidos/android-app/admin

# Generar el APK
npx @bubblewrap/cli build

# Cuando pida la contraseña, usa la misma que para la app principal:
# Password for the Key Store: android
# Password for the Key: android
```

## Archivos generados

- `app-release-signed.apk` - APK firmado para instalar en Android
- `app-release-bundle.aab` - Bundle para subir a Play Store

## Diferencias con la app de clientes

| Característica | App Clientes | App Admin |
|----------------|--------------|-----------|
| Package ID | `com.lacteosselectos.app` | `com.lacteosselectos.admin` |
| URL inicial | `/` (tienda) | `/admin/dashboard` |
| Nombre | "Lácteos" | "Lácteos Admin" |
| Función | Hacer pedidos | Gestionar pedidos |

## Instalación

1. Transfiere `app-release-signed.apk` al teléfono del admin
2. Instala el APK (permitir instalación de fuentes desconocidas)
3. Abre la app - irá directamente al panel de administración
4. Activa las notificaciones cuando aparezca el prompt

## Notas

- Ambas apps pueden coexistir en el mismo teléfono
- La app del admin tiene su propio icono y nombre
- Las notificaciones de nuevos pedidos llegarán a esta app
