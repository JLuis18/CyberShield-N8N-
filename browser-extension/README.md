# CyberShield Browser Extension

## 🛡️ Protección en Tiempo Real para Navegación Web

La extensión de navegador oficial de CyberShield que analiza automáticamente las URLs que visitas y te protege contra amenazas en tiempo real.

## ✨ Características

- **🔍 Escaneo Automático** - Analiza cada sitio web antes de que lo visites
- **🎯 Indicadores Visuales** - Icono codificado por colores (🟢🟡🔴)
- **💬 Hover en Enlaces** - Ve el nivel de riesgo al pasar el mouse sobre links
- **📊 Popup Detallado** - Información completa de amenazas al hacer click
- **🔔 Notificaciones** - Alertas automáticas para sitios peligrosos
- **📝 Historial** - Guarda tus últimos 50 escaneos
- **🌐 Threat Intelligence** - Integración con AbuseIPDB para detección global

---

## 📦 Instalación

### Opción 1: Modo Desarrollador (Recomendado para Testing)

1. **Abre Chrome/Edge**
2. **Ve a extensiones:**
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`

3. **Activa "Modo de desarrollador"** (toggle en la esquina superior derecha)

4. **Click en "Cargar extensión sin empaquetar"**

5. **Selecciona la carpeta:**
   ```
   C:\Users\Lara\Documents\Cursos 2025-20\Custumer\Proyect\CyberShield\browser-extension
   ```

6. **¡Listo!** La extensión aparecerá en tu barra de herramientas

### Opción 2: Empaquetar para Distribución

Para distribuir a otros usuarios:

```bash
# En Chrome/Edge extensions
1. Click "Empaquetar extensión"
2. Selecciona el directorio browser-extension
3. Se generará un archivo .crx
```

---

## 🚀 Uso

### Primera Configuración

Al instalar la extensión por primera vez:

1. Click en el icono de CyberShield 🛡️
2. (Actualmente) La extensión usa `http://localhost:3000`  
3. Asegúrate de que tu servidor CyberShield esté corriendo

### Durante la Navegación

#### Escaneo Automático
- ✅ Cada vez que visites una URL, se escanea automáticamente
- ✅ El icono cambia de color según el riesgo
- ✅ Si hay peligro, recibes una notificación

#### Hover en Enlaces
- ✅ Pasa el mouse sobre cualquier enlace
- ✅ Espera 500ms
- ✅ Aparece un tooltip con el análisis

#### Ver Detalles
- ✅ Click en el icono de la extensión
- ✅ Ve el análisis completo de la página actual
- ✅ Revisa tu historial de escaneos

---

## ⚙️ Configuración

### Cambiar URL del Servidor

Actualmente la extensión apunta a `http://localhost:3000`. Para cambiar:

1. Edita `browser-extension/lib/api.js`
2. Cambia `baseURL` en `API_CONFIG`
3. Recarga la extensión

**Para producción:**
```javascript
const API_CONFIG = {
  baseURL: 'https://tu-dominio.vercel.app',
  // ...
};
```

### Permisos Necesarios

La extensión requiere:
- ✅ `activeTab` - Para analizar la página actual
- ✅ `storage` - Para guardar historial y configuración
- ✅ `notifications` - Para alertas de amenazas
- ✅ `webNavigation` - Para detectar navegación a URLs

---

## 🎨 Indicadores Visuales

### Badge del Icono

| Color | Significado |
|-------|-------------|
| 🟢 Verde | Sitio seguro |
| 🟡 Amarillo | Advertencia, proceder con precaución |
| 🔴 Rojo | ¡Peligro! Sitio malicioso detectado |
| ⚪ Gris | Sin análisis / Error |

### Tooltips en Enlaces

Al pasar el mouse sobre un enlace:
- **Borde verde** - Enlace seguro
- **Borde amarillo** - Precaución recomendada
- **Borde rojo** - Enlace peligroso, no hacer click

---

## 🔧 Troubleshooting

### La extensión no escanea sitios

**Solución:**
1. Verifica que el servidor CyberShield esté corriendo (`npm run dev`)
2. Revisa la consola de la extensión (click derecho > Inspeccionar)
3. Confirma que la URL en `api.js` es correcta

### No aparecen tooltips en links

**Solución:**
1. Espera al menos 500ms con el mouse sobre el enlace
2. Verifica que el contenido script está cargado (F12 > Console)
3. Algunos sitios bloquean content scripts por CSP

### El icono no cambia de color

**Solución:**
1. Recarga la extensión
2. Cierra y abre el tab
3. Revisa la consola del background worker

### Error de autenticación

**Solución:**
Actualmente la extensión no requiere login. Si ves errores 401:
1. Verifica que el servidor backend esté corriendo
2. La extensión funcionará con escaneos públicos por ahora

---

## 📁 Estructura de Archivos

```
browser-extension/
├── manifest.json          # Configuración de la extensión
├── icons/                 # Iconos de la extensión
│   └── icon128.png
├── popup/                 # Interfaz del popup
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── background/            # Service worker
│   └── background.js
├── content/               # Scripts en páginas web
│   ├── content.js
│   └── content.css
└── lib/                   # Utilidades compartidas
    ├── api.js
    └── utils.js
```

---

## 🚀 Próximas Mejoras

- [ ] Sistema de autenticación
- [ ] Configuración personalizable desde popup
- [ ] Whitelist/blacklist manual
- [ ] Exportar historial
- [ ] Modo offline con cache
- [ ] Soporte para Firefox
- [ ] Dark mode
- [ ] Estadísticas detalladas

---

## 🐛 Reporte de Bugs

Si encuentras algún problema:
1. Abre la consola (F12)
2. Reproduce el error
3. Captura los logs
4. Reporta con detalles

---

## 📄 Licencia

Parte del ecosistema CyberShield.

---

## 🎉 ¡Disfruta de una navegación más segura!

La extensión CyberShield te protege automáticamente mientras navegas. No más copiar y pegar URLs manualmente. ¡Todo es automático! 🛡️
