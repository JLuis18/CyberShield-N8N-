# Network Connection Threat Database

Esta base de datos contiene **datos reales** de conexiones de red categorizadas por nivel de riesgo, lista para ser analizada por la aplicación CyberShield.

## 📊 Categorías de Riesgo

### 🟢 Conexiones Seguras (Safe)
Estas conexiones **deben salir como seguras** en el análisis:

| IP:Puerto | Descripción | Categoría |
|-----------|-------------|-----------|
| `8.8.8.8:53` | Google DNS | DNS |
| `1.1.1.1:53` | Cloudflare DNS | DNS |
| `172.217.5.78:443` | Google HTTPS | Web Services |
| `104.26.0.1:443` | Cloudflare Servicios Web | Web Services |
| `157.240.3.35:443` | Facebook Servicios HTTPS | Social Media |
| `52.217.40.36:443` | AWS Infraestructura | Cloud Infrastructure |
| `151.101.1.69:80` | Wikipedia | Web Services |
| `35.170.27.238:443` | Amazon Servidor Global | Cloud Infrastructure |
| `104.18.31.223:443` | CDN Cloudflare | CDN |

**Respuesta esperada:** ✅ "Conexión legítima y segura"

---

### 🟡 Conexiones de Advertencia (Warning)
Conexiones sospechosas o protocolos inseguros - **Riesgo medio**:

| IP:Puerto | Descripción | Categoría |
|-----------|-------------|-----------|
| `192.168.1.50:21` | FTP sin cifrado | Unencrypted Protocol |
| `181.45.117.201:8080` | Proxy HTTP | Proxy |
| `177.234.29.22:23` | Telnet inseguro | Unencrypted Protocol |
| `192.168.0.15:3389` | Escritorio Remoto (RDP) | Remote Access |
| `201.245.191.17:5900` | VNC remoto | Remote Access |
| `200.35.201.155:110` | POP3 sin seguridad | Email Protocol |
| `189.142.21.101:25` | SMTP inseguro | Email Protocol |
| `45.186.64.9:389` | LDAP expuesto | Directory Service |

**Respuesta esperada:** ⚠️ "Posible amenaza o servicio expuesto"

---

### 🔴 Conexiones de Alto Riesgo (High Risk)
Botnets, C2, TOR, RAT - **Riesgo alto**:

| IP:Puerto | Descripción | Categoría |
|-----------|-------------|-----------|
| `45.71.101.221:22` | SSH externo desconocido | Remote Access |
| `103.150.97.12:4444` | Puerto RAT de control remoto | RAT |
| `185.220.101.4:9001` | Nodo de salida TOR | TOR Network |
| `201.48.11.93:6667` | Botnet IRC | Botnet |
| `92.255.85.66:5000` | Reverse Shell | Reverse Shell |
| `89.248.165.234:8081` | Beaconing C2 | C2 Server |
| `188.68.41.191:135` | RPC Expuesto | RPC |
| `156.146.63.56:1080` | SOCKS Proxy oculto | Proxy |

**Respuesta esperada:** 🚫 "Actividad de malware o exfiltración"

---

### 🧨 Conexiones CRÍTICAS (Critical)
Indicio directo de ataque - **Máxima prioridad**:

| IP:Puerto | Descripción | Categoría | Detección |
|-----------|-------------|-----------|-----------|
| `145.239.5.30:4444` | Control Botnet | Botnet C2 | 🔥 Servidor C2 |
| `185.156.177.59:1337` | Puerto de explotación | Exploitation | 🔥 Alta probabilidad de ataque |
| `198.98.49.55:9001` | TOR Hidden Service | TOR Network | 🔥 Servidor C2 |
| `81.17.18.59:6667` | Control Botnet IRC | Botnet C2 | 🔥 Servidor C2 |
| `185.129.62.62:2222` | SSH Persistente oculto | Backdoor | 🔥 Alta probabilidad de ataque |
| `5.79.113.108:23` | Telnet usado por Mirai | Mirai Botnet | 🔥 Servidor C2 |
| `144.76.139.55:8888` | Servidor CobaltStrike C2 | CobaltStrike | 🔥 Servidor C2 |
| `193.56.28.52:443` | Server Beaconing HTTPS | C2 Server | 🔥 Servidor C2 |
| `104.21.16.101:2053` | Puerto de exfiltración SSL | Data Exfiltration | 🔥 Alta probabilidad de ataque |

**Respuesta esperada:** 
- 🔥 **Alta probabilidad de ataque dirigido**
- 🔥 **Servidor de comando y control (C2)**

---

## 🎯 Detección por Puerto

### Puertos de Riesgo Alto/Crítico

| Puerto | Riesgo | Descripción |
|--------|--------|-------------|
| `4444` | 🔴 CRÍTICO | Control remoto RAT / Metasploit |
| `6667` | 🔴 ALTO | Botnet IRC |
| `9001` | 🔴 ALTO | TOR / C2 |
| `1337` | 🧨 CRÍTICO | Reverse shell / Explotación |
| `5000` | 🔴 ALTO | Payload server |
| `2222` | 🧨 CRÍTICO | SSH oculto / Backdoor |
| `8888` | 🧨 CRÍTICO | CobaltStrike C2 |
| `2053` | 🧨 CRÍTICO | Exfiltración SSL |
| `12345` | 🧨 CRÍTICO | NetBus (Trojan) |
| `31337` | 🧨 CRÍTICO | Back Orifice (Trojan) |
| `8081` | 🔴 ALTO | Beaconing C2 |
| `1080` | 🔴 ALTO | SOCKS Proxy |

### Puertos de Advertencia

| Puerto | Riesgo | Descripción |
|--------|--------|-------------|
| `21` | 🟡 MEDIO | FTP sin cifrado |
| `23` | 🟡 MEDIO | Telnet inseguro |
| `3389` | 🟡 MEDIO | RDP - Escritorio Remoto |
| `5900` | 🟡 MEDIO | VNC |
| `25` | 🟡 MEDIO | SMTP inseguro |
| `110` | 🟡 MEDIO | POP3 sin seguridad |
| `389` | 🟡 MEDIO | LDAP expuesto |
| `8080` | 🟡 MEDIO | HTTP Proxy |

---

## 🧪 Ejemplo de Uso

### Testing con cURL

```bash
# Ejemplo: Conexión segura (Google DNS)
curl -X POST http://localhost:3000/api/scanner/network \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "ipAddress": "8.8.8.8",
    "port": 53,
    "protocol": "UDP"
  }'

# Respuesta esperada:
# {
#   "riskLevel": "low",
#   "emoji": "🟢",
#   "threats": ["Google DNS", "✓ Conexión segura verificada"],
#   "category": "DNS",
#   "recommendations": ["✅ Conexión legítima y segura", ...]
# }

# Ejemplo: Conexión CRÍTICA (CobaltStrike)
curl -X POST http://localhost:3000/api/scanner/network \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "ipAddress": "144.76.139.55",
    "port": 8888,
    "protocol": "TCP"
  }'

# Respuesta esperada:
# {
#   "riskLevel": "high",
#   "emoji": "🧨",
#   "threats": [
#     "Servidor CobaltStrike C2",
#     "🔥 Alta probabilidad de ataque dirigido",
#     "🔥 Servidor de comando y control (C2)"
#   ],
#   "category": "CobaltStrike",
#   "recommendations": [
#     "⛔ BLOQUEAR INMEDIATAMENTE",
#     "🚨 Aislar el sistema afectado",
#     "📞 Contactar equipo de respuesta a incidentes",
#     "🔍 Auditoría completa del sistema"
#   ]
# }
```

---

## 📁 Implementación

Los datos están implementados en el archivo:
- **`lib/network-threats.ts`** - Base de datos de amenazas y funciones de análisis

Y son utilizados por los endpoints:
- **`app/api/scanner/network/route.ts`** - Endpoint interno
- **`app/api/v1/scan/network/route.ts`** - API pública

---

## ✅ Validación

Para validar que el sistema funciona correctamente, puedes probar estos casos:

### ✅ Debe ser SEGURO
- `8.8.8.8:53` → Google DNS
- `1.1.1.1:53` → Cloudflare DNS
- `104.26.0.1:443` → Cloudflare HTTPS

### ⚠️ Debe ser ADVERTENCIA
- `192.168.1.50:21` → FTP sin cifrado
- `177.234.29.22:23` → Telnet inseguro
- `192.168.0.15:3389` → RDP

### 🔴 Debe ser ALTO RIESGO
- `103.150.97.12:4444` → RAT
- `185.220.101.4:9001` → TOR
- `201.48.11.93:6667` → Botnet IRC

### 🧨 Debe ser CRÍTICO
- `145.239.5.30:4444` → Botnet C2
- `144.76.139.55:8888` → CobaltStrike
- `185.156.177.59:1337` → Explotación
- `5.79.113.108:23` → Mirai Botnet

---

## 🔄 Actualización de Datos

Para agregar nuevas conexiones conocidas, edita `lib/network-threats.ts` y añade entradas en:
- `SAFE_CONNECTIONS` - Para servicios legítimos
- `WARNING_CONNECTIONS` - Para protocolos inseguros
- `HIGH_RISK_CONNECTIONS` - Para amenazas conocidas
- `CRITICAL_CONNECTIONS` - Para ataques confirmados
- `DANGEROUS_PORTS` - Para puertos específicos de malware
