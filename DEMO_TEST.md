# 🧪 Demostración Completa - CyberShield

## Test 1: Extensión de Navegador

### Paso 1: Verificar que la extensión esté instalada
1. Ve a `chrome://extensions`
2. Busca "CyberShield Protection"
3. Debe estar activada (toggle en azul)

### Paso 2: Probar con sitio seguro (Google)
1. Navega a: `https://www.google.com`
2. **Observa:**
   - Ícono de la extensión 🛡️ en la barra de herramientas
   - Badge verde o sin badge (sitio seguro)
3. **Click en el ícono de CyberShield**
4. **Deberías ver:**
   - "SEGURO" en verde
   - "Sitio web verificado y confiable"
   - Historial mostrando google.com

### Paso 3: Probar con URL sospechosa simulada
1. Crea un archivo HTML de prueba:
   ```html
   <!-- test-phishing.html -->
   <html>
   <head><title>PayPal Login</title></head>
   <body>
     <h1>Verify Your PayPal Account</h1>
     <a href="http://192.168.1.100/login">Click here urgently</a>
   </body>
   </html>
   ```
2. Ábrelo en el navegador
3. **Observa:**
   - Badge rojo o amarillo
   - Amenazas detectadas

---

## Test 2: Análisis de Emails

### Ejecutar script de prueba:
```bash
node scripts/test-email-forward.js
```

### Resultado Esperado:

**Email de Phishing:**
```
✅ Respuesta del servidor:
Status: 200

Resultado:
- Nivel de Riesgo: HIGH
- Risk Score: 140
- Amenazas Detectadas: 6

⚠️  Amenazas:
  🚨 Remitente de dominio sospechoso
  ⚠️ Lenguaje de urgencia: "urgente"
  🚨 1 URL(s) peligrosa(s) detectada(s)
  ⚠️ Archivos adjuntos sospechosos: invoice.exe
```

**Email Seguro:**
```
Status: 200
Nivel de Riesgo: LOW
✅ Email parece seguro
```

---

## Test 3: Dashboard Web

### Paso 1: Login
1. Ve a: `http://localhost:3001/login`
2. Email: `lara@gmail.com`
3. Contraseña: (tu contraseña)

### Paso 2: Ver Dashboard
1. Después del login, deberías ver el dashboard
2. **Revisa:**
   - Puntuación de seguridad
   - Amenazas recientes
   - Estadísticas

---

## 📊 Checklist de Funcionalidades

### Extensión ✅
- [ ] Se instala correctamente
- [ ] Escanea sitios automáticamente
- [ ] Muestra badge con colores
- [ ] Popup funciona
- [ ] Historial se guarda

### Email API ✅
- [ ] Endpoint responde (200)
- [ ] Detecta phishing
- [ ] Identifica dominios sospechosos
- [ ] Analiza URLs en emails
- [ ] Revisa archivos adjuntos

### Backend ✅
- [ ] Registro de usuarios
- [ ] Login funciona
- [ ] Base de datos SQLite
- [ ] API endpoints responden

---

## 🎬 Video Demos

### Demo 1: Extensión
1. Abrir Chrome
2. Ir a Google → Ver badge verde
3. Click en extensión → Mostrar análisis
4. Ir a sitio sospechoso → Ver alerta roja

### Demo 2: Email
1. Ejecutar `node scripts/test-email-forward.js`
2. Mostrar respuesta con HIGH risk
3. Explicar cada amenaza detectada

---

## ✨ Características Destacadas

1. **Cero copiar/pegar** - Todo automático
2. **Tiempo real** - Análisis instantáneo  
3. **Whitelist inteligente** - Sin falsos positivos
4. **Scoring system** - 0-100+ puntos de riesgo
5. **Multi-amenaza** - URLs, emails, archivos

---

## 💡 Casos de Uso Reales

### Caso 1: Email de Phishing
**Escenario:** Recibes email "Tu cuenta PayPal suspendida"
**Acción:** Reenviar a CyberShield
**Resultado:** Detecta domain falso, urgencia, URL maliciosa

### Caso 2: Navegación Web  
**Escenario:** Buscas en Google, ves link sospechoso
**Acción:** La extensión lo escanea al hacer hover
**Resultado:** Tooltip rojo advierte antes de hacer click

### Caso 3: Archivo Adjunto
**Escenario:** Email con "invoice.exe"
**Acción:** CyberShield analiza el attachment
**Resultado:** Alerta de archivo ejecutable peligroso
