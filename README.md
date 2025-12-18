# CyberShield - Enterprise Security Platform

Una plataforma empresarial de ciberseguridad tipo SOC (Security Operations Center) con autenticación, escaneo de amenazas, monitoreo de seguridad y análisis en tiempo real.

## 🚀 Características

### Autenticación
- ✅ Registro de usuarios con validación
- ✅ Login con JWT tokens
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Sesiones seguras

### Dashboard Principal
- ✅ Puntuación de seguridad en tiempo real (0-100)
- ✅ Métricas diarias (amenazas bloqueadas, correos analizados, conexiones)
- ✅ Gráfico de tendencias de amenazas
- ✅ Tarjetas de acciones rápidas

### Escáner de Amenazas
- ✅ Análisis de URLs (detección de phishing)
- ✅ Análisis de emails (spam, phishing, spoofing)
- ✅ Análisis de archivos (malware, extensiones peligrosas)
- ✅ Niveles de riesgo: bajo, medio, alto
- ✅ Recomendaciones automáticas

### Nivel de Seguridad
- ✅ Puntuación actual
- ✅ Historial de seguridad
- ✅ Recomendaciones generadas por IA
- ✅ Tabla de amenazas detectadas con filtros

### Configuración
- ✅ Selección de idioma (ES/EN)
- ✅ Tema oscuro/claro
- ✅ Preferencias de notificaciones
- ✅ Gestión de API keys
- ✅ Integraciones externas (Microsoft 365, Google Workspace)

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: SQLite con Prisma ORM
- **Autenticación**: JWT, bcrypt
- **Animaciones**: Canvas API, CSS Animations

## 📦 Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar base de datos**:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

3. **Iniciar servidor de desarrollo**:
```bash
npm run dev
```

4. **Abrir en navegador**:
```
http://localhost:3000
```

## 🗄️ Estructura de la Base de Datos

- **users** - Usuarios registrados
- **threats** - Amenazas detectadas
- **emails** - Correos analizados
- **connections** - Conexiones monitoreadas
- **securityHistory** - Historial de puntuación de seguridad
- **userConfig** - Configuración de usuario

## 🎨 Diseño Visual

- Tema oscuro con gradientes azul neón, cyan y púrpura
- Efectos glassmorphism en paneles
- Animaciones de partículas en background
- Gráficos interactivos con Canvas
- Iconos corporativos de seguridad

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (salt rounds: 10)
- Tokens JWT con expiración de 7 días
- Middleware de autenticación en rutas protegidas
- Validación de entrada en todas las API routes
- Sanitización de datos del usuario

## 📱 Páginas

- `/` - Redirección a login
- `/login` - Página de inicio de sesión
- `/register` - Página de registro
- `/dashboard` - Dashboard principal (protegido)
- `/scanner` - Escáner de amenazas (protegido)
- `/security` - Nivel de seguridad (protegido)
- `/settings` - Configuración (protegido)

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Crear cuenta
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token

### Dashboard
- `GET /api/dashboard/metrics` - Métricas del dashboard

### Escáner
- `POST /api/scanner/url` - Analizar URL
- `POST /api/scanner/email` - Analizar email
- `POST /api/scanner/file` - Analizar archivo

### Seguridad
- `GET /api/security-score` - Obtener puntuación
- `GET /api/threats` - Listar amenazas

### Configuración
- `GET /api/config` - Obtener configuración
- `PATCH /api/config` - Actualizar configuración

## 🚨 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run start

# Base de datos
npx prisma studio          # Abrir Prisma Studio
npx prisma migrate dev     # Crear migración
npx prisma generate        # Generar cliente Prisma

# Linting
npm run lint
```

## 📝 Notas

- La base de datos SQLite es ideal para desarrollo. Para producción, considera PostgreSQL o MySQL.
- Cambia `JWT_SECRET` en `.env` antes de deployment.
- Las funciones de análisis son simulaciones. Para producción, integra con servicios reales como VirusTotal, Google Safe Browsing, etc.

## 🎯 Próximos Pasos

- [ ] Integración con APIs reales de análisis de amenazas
- [ ] Notificaciones en tiempo real con WebSockets
- [ ] Exportación de reportes (PDF, CSV)
- [ ] Autenticación de dos factores (2FA)
- [ ] Dashboard de administrador
- [ ] Análisis de logs y auditoría
- [ ] Machine Learning para detección de amenazas

## 📄 Licencia

MIT License - Libre para uso personal y comercial

## 👨‍💻 Desarrollado con

Next.js 14 + TypeScript + Prisma + Tailwind CSS
