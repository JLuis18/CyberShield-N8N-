# Integración n8n + CyberShield - Análisis Automático de Emails

Esta guía te muestra cómo conectar tu Gmail con CyberShield usando n8n Cloud para analizar automáticamente tus correos en busca de phishing.

## 📋 Requisitos

- ✅ Cuenta de Gmail
- ✅ Cuenta de n8n Cloud (ya lo tienes)
- ✅ CyberShield corriendo (localhost:3000 o desplegado)

---

## 🚀 Configuración en n8n Cloud

### Paso 1: Conectar Gmail

1. Ve a tu n8n Cloud dashboard
2. Click en **Credentials** → **Add Credential**
3. Busca **"Gmail"** o **"Google"**
4. Click **Sign in with Google** y autoriza tu cuenta
5. Guarda las credenciales

### Paso 2: Crear el Workflow

1. Click **"New Workflow"**
2. Nombra tu workflow: `CyberShield - Análisis de Emails`

### Paso 3: Añadir Gmail Trigger

1. Click en el **+** para añadir un nodo
2. Busca **"Gmail Trigger"**
3. Configura:
   - **Resource**: Message
   - **Event**: Message Received
   - **Credential**: Selecciona tu Gmail
   - **Filters** (opcional): Puedes filtrar por etiquetas específicas

### Paso 4: Añadir HTTP Request (Webhook a CyberShield)

1. Añade otro nodo: **"HTTP Request"**
2. Configura:

```
Method: POST
URL: https://TU-DOMINIO/api/webhook/n8n
   (o http://localhost:3000/api/webhook/n8n para pruebas locales)

Headers:
   Content-Type: application/json

Body (JSON) - IMPORTANTE: Usar estos campos exactos:
{
  "from": "{{ $json.from }}",
  "subject": "{{ $json.headers?.subject || $json.subject }}",
  "body": "{{ $json.textPlain || $json.text || $json.html || '' }}",
  "snippet": "{{ $json.snippet }}"
}
```

> ⚠️ **Nota**: Los campos del Gmail Trigger pueden variar. Si el asunto no aparece, haz click en "Schema" en n8n para ver los campos disponibles y ajusta las expresiones.

### Paso 5: Añadir Filtro por Riesgo (Opcional)

1. Después del HTTP Request, añade un nodo **"IF"**
2. Configura:
   ```
   Condition: {{ $json.riskLevel }} equals "high"
   ```
3. Si es TRUE → Añade acciones de alerta

### Paso 6: Notificaciones (Opcional)

Si el email es de **alto riesgo**, puedes:

**Opción A: Email de alerta**
- Añade nodo **"Gmail"** → Send Email
- Envía una alerta a ti mismo

**Opción B: Slack/Discord**
- Añade nodo **"Slack"** o **"Discord"**
- Envía notificación al canal

**Opción C: Google Sheets (Log)**
- Añade nodo **"Google Sheets"**
- Guarda un registro de todos los análisis

---

## 📊 Estructura del Workflow

```
┌─────────────────┐
│  Gmail Trigger  │
│ (Nuevo email)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Request   │
│ (CyberShield)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      IF         │
│ riskLevel=high? │
└─────┬─────┬─────┘
    Yes     No
      │      │
      ▼      ▼
┌─────────┐ ┌─────────┐
│ Alerta  │ │  (End)  │
│ Slack   │ └─────────┘
└─────────┘
```

---

## 🔧 Respuesta del Webhook

CyberShield responderá con:

```json
{
  "success": true,
  "riskLevel": "high",      // "low", "medium", "high"
  "riskScore": 65,          // 0-100
  "threats": [
    "🚨 Urgencia sospechosa: \"verify now\"",
    "⚠️ Solicita información sensible: \"password\""
  ],
  "recommendations": [
    "🚫 NO responder al correo",
    "🚫 NO hacer clic en enlaces"
  ],
  "message": "🚨 ALERTA: Email de alto riesgo - Probable phishing"
}
```

---

## 🧪 Probar la Integración

### Probar el Webhook localmente:

```bash
cd d:\9no Ciclo\Customer\CyberShield-main
npm run dev
node scripts/test-n8n-webhook.js
```

### Probar en n8n:

1. Activa tu workflow
2. Envíate un email de prueba con contenido sospechoso:
   ```
   Asunto: URGENTE - Tu cuenta será suspendida
   
   Estimado cliente,
   Verifica tu cuenta bancaria inmediatamente haciendo clic aquí:
   http://192.168.1.1/login
   ```
3. Verifica que el workflow se ejecute y detecte la amenaza

---

## ⚙️ Configuración Avanzada

### Filtrar solo emails sospechosos

En el **Gmail Trigger**, añade un filtro:
- **Label**: Crear una etiqueta "Revisar con CyberShield"
- Solo emails con esa etiqueta activarán el workflow

### Uso con dominio público

Si tienes CyberShield desplegado (ej: Vercel):
```
URL: https://tu-app.vercel.app/api/webhook/n8n
```

### Rate Limiting

El webhook no tiene límite de rate por defecto. Para producción, considera añadir una API key en el header:
```
x-api-key: tu-api-key-secreta
```

---

## ❓ Troubleshooting

| Problema | Solución |
|----------|----------|
| Error de conexión | Verifica que CyberShield esté corriendo |
| No recibe emails | Verifica credenciales de Gmail en n8n |
| Respuesta vacía | Revisa el formato del body en HTTP Request |

---

## 📞 Soporte

- Revisa los logs en n8n Cloud
- Verifica la consola del servidor CyberShield
- Prueba primero con el script local `test-n8n-webhook.js`
