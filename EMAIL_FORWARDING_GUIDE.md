# Guía de Configuración - Análisis Automático de Emails

## 🎯 Cómo Funciona

CyberShield puede analizar automáticamente emails sospechosos sin necesidad de copiar/pegar. Simplemente **reenvía** el email sospechoso y CyberShield lo analizará.

---

## ⚙️ Configuración

### Opción 1: Envío Manual (Disponible Ahora)

**Para probar el sistema:**

1. **Guarda el email** sospechoso como archivo .eml o copia el contenido
2. **Envía un POST request** al endpoint `/api/email/forward`

**Ejemplo usando el script de prueba:**
```bash
node scripts/test-email-forward.js
```

---

### Opción 2: Reenvío Automático (Próximamente)

**Configuración futura con servicio de email:**

1. Obtendrás una dirección única: `tu-id@analyze.cybershield.app`
2. Configuras regla de reenvío en Gmail/Outlook
3. Emails sospechosos se reenvían automáticamente
4. Recibes notificaciones en el dashboard

---

## 🧪 Probar Ahora (Manual)

### Usando el Script de Prueba

```bash
# Probar con email de phishing simulado
node scripts/test-email-forward.js
```

El script simula un email de phishing con:
- ✅ Remitente sospechoso
- ✅ Asunto con lenguaje de urgencia
- ✅ URLs maliciosas
- ✅ Archivos adjuntos peligrosos

---

## 📊 Qué Analiza CyberShield

### 1. Remitente
- ✅ Dominio sospechoso
- ✅ Direcciones desechables
- ✅ Dominios con patrones raros

### 2. Contenido
- ✅ Palabras de urgencia ("urgente", "suspendido")
- ✅ Solicitudes de verificación
- ✅ Amenazas de cierre de cuenta

### 3. Enlaces
- ✅ URLs con IP directa
- ✅ Dominios sin HTTPS
- ✅ Acortadores de URL
- ✅ Typosquatting (paypa1.com, g00gle.com)

### 4. Archivos Adjuntos
- ✅ Ejecutables (.exe, .bat, .cmd)
- ✅ Scripts (.vbs, .ps1, .js)
- ✅ Archivos comprimidos sospechosos

---

## 🎨 Niveles de Riesgo

| Nivel | Score | Descripción |
|-------|-------|-------------|
| 🟢 BAJO | 0-29 | Email parece seguro |
| 🟡 MEDIO | 30-59 | Algunas señales sospechosas |
| 🔴 ALTO | 60+ | Probable phishing/malware |

---

## 📱 Ver Resultados

1. **Dashboard** → Sección "Emails Analizados"
2. **Notificaciones** → Alertas de emails de alto riesgo
3. **Historial** → Todos los emails escaneados

---

## 🔗 API Reference

### POST `/api/email/forward`

**Request Body:**
```json
{
  "from": "suspicious@example.com",
  "to": "user@cybershield.app",
  "subject": "Urgent: Verify your account",
  "html": "<html>...</html>",
  "text": "Plain text content",
  "attachments": [
    {
      "filename": "invoice.exe",
      "contentType": "application/x-msdownload"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "emailId": "uuid",
  "riskLevel": "high",
  "threats": [
    "🚨 Remitente de dominio sospechoso",
    "⚠️ Lenguaje de urgencia detectado",
    "🚨 2 URL(s) peligrosa(s) detectada(s)"
  ],
  "urlsAnalyzed": 3,
  "message": "⚠️ Email de alto riesgo detectado"
}
```

---

## 💡 Próximos Pasos

1. **Integración con Gmail API** - Lectura automática
2. **Servicio de reenvío dedicado** - Email único para forwarding
3. **Notificaciones push** - Alertas instantáneas
4. **Análisis de imágenes** - Detectar phishing en screenshots

---

## ❓ Preguntas Frecuentes

**Q: ¿Es seguro reenviar emails?**
A: Sí, CyberShield solo analiza el contenido, no almacena datos sensibles.

**Q: ¿Funciona con archivos adjuntos?**
A: Sí, analiza los nombres y tipos de archivos (no el contenido aún).

**Q: ¿Puedo analizar emails antiguos?**
A: Sí, simplemente reenvíalos al sistema.

**Q: ¿Qué pasa con emails legítimos?**
A: El sistema está optimizado para minimizar falsos positivos.
