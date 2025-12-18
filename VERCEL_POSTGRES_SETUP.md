# 🗄️ Configuración de PostgreSQL para Vercel

Esta guía te ayudará a configurar una base de datos PostgreSQL para tu aplicación CyberShield en Vercel.

---

## ⚠️ Por Qué Necesitas PostgreSQL

**SQLite NO funciona en Vercel** porque:
- Vercel es serverless (sin almacenamiento de archivos persistente)
- Los archivos se eliminan entre despliegues
- Las funciones serverless son efímeras

**Solución**: Usar una base de datos PostgreSQL externa.

---

## 🚀 Opción 1: Vercel Postgres (Recomendado)

### Ventajas
✅ Integración nativa con Vercel
✅ Configuración automática de variables de entorno
✅ Connection pooling incluido
✅ 256 MB gratis para empezar

### Pasos de Configuración

#### 1. Crear Base de Datos

1. Ve a tu dashboard de Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto: **tu-cyber-shield**
3. Click en la pestaña **"Storage"**
4. Click en **"Create Database"**
5. Selecciona **"Postgres"**
6. Configura:
   - **Database Name**: `cybershield-db` (o el nombre que prefieras)
   - **Region**: Selecciona la más cercana (ej: `US East` para mejor rendimiento)
7. Click **"Create"**

#### 2. Conectar a tu Proyecto

Vercel automáticamente:
- ✅ Crea la base de datos
- ✅ Agrega `DATABASE_URL` a las variables de entorno
- ✅ Configura connection pooling

**No necesitas hacer nada más en el dashboard de Vercel.**

#### 3. Ejecutar Migraciones

Ahora necesitas crear las tablas en tu nueva base de datos:

```bash
# 1. Instalar Vercel CLI si no lo tienes
npm install -g vercel

# 2. Conectar tu proyecto local con Vercel
vercel link

# 3. Descargar las variables de entorno (incluyendo DATABASE_URL)
vercel env pull .env.local

# 4. Generar cliente de Prisma
npx prisma generate

# 5. Ejecutar migraciones (crear tablas)
npx prisma db push

# 6. (Opcional) Ver la base de datos con Prisma Studio
npx prisma studio
```

#### 4. Verificar en Vercel Dashboard

1. Ve a **Storage** → Tu base de datos
2. Click en **"Query"**
3. Ejecuta esta query para verificar las tablas:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Deberías ver tablas como: `User`, `Threat`, `Email`, etc.

#### 5. Re-desplegar

```bash
# Desde tu terminal
vercel --prod

# O simplemente haz push a GitHub (auto-deploy)
git add .
git commit -m "Migrated to PostgreSQL"
git push origin main
```

---

## 🟢 Opción 2: Neon PostgreSQL (Alternativa Gratuita)

### Ventajas
✅ Free tier muy generoso (0.5 GB)
✅ Serverless PostgreSQL
✅ Muy rápido
✅ Fácil configuración

### Pasos de Configuración

#### 1. Crear Cuenta y Proyecto

1. Ve a: https://neon.tech
2. Click **"Sign Up"** (usar GitHub para login rápido)
3. Click **"Create Project"**
4. Configura:
   - **Project Name**: `CyberShield`
   - **Region**: Selecciona la más cercana
   - **Postgres Version**: 16 (recomendado)
5. Click **"Create Project"**

#### 2. Obtener Connection String

1. En el dashboard de Neon, verás **"Connection Details"**
2. Copia el **"Connection string"** que se ve así:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

#### 3. Agregar a Vercel

1. Ve a Vercel Dashboard → tu proyecto
2. Click **"Settings"** → **"Environment Variables"**
3. Agregar nueva variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Pega el connection string de Neon
   - **Environments**: Selecciona `Production`, `Preview`, `Development`
4. Click **"Save"**

#### 4. Ejecutar Migraciones

```bash
# 1. Actualizar tu .env.local con la URL de Neon
echo 'DATABASE_URL="postgresql://..."' > .env.local

# 2. Generar cliente de Prisma
npx prisma generate

# 3. Ejecutar migraciones
npx prisma db push

# 4. Verificar con Prisma Studio
npx prisma studio
```

#### 5. Re-desplegar en Vercel

```bash
vercel --prod
```

---

## 🔵 Opción 3: Supabase PostgreSQL

### Ventajas
✅ 500 MB gratis
✅ Incluye autenticación y storage
✅ Dashboard intuitivo
✅ API REST automática

### Pasos de Configuración

#### 1. Crear Proyecto

1. Ve a: https://supabase.com
2. Click **"Start your project"**
3. Crear cuenta (GitHub recomendado)
4. Click **"New Project"**
5. Configura:
   - **Organization**: Crea una nueva o usa existente
   - **Name**: `CyberShield`
   - **Database Password**: Genera una segura (¡guárdala!)
   - **Region**: Selecciona la más cercana
6. Click **"Create new project"** (toma ~2 minutos)

#### 2. Obtener Connection String

1. En el dashboard, ve a **"Settings"** → **"Database"**
2. Busca **"Connection string"** → **"URI"**
3. Cambia `[YOUR-PASSWORD]` por tu contraseña
4. La URL será algo como:
   ```
   postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```

#### 3. Agregar a Vercel

(Mismo proceso que Opción 2 - Neon)

#### 4. Ejecutar Migraciones

```bash
# Mismo proceso que las otras opciones
npx prisma generate
npx prisma db push
```

---

## 🧪 Verificación

### Test 1: Verificar Conexión Local

```bash
# Asegúrate de que .env.local tiene DATABASE_URL correcto
npx prisma studio
```

Si se abre Prisma Studio y ves tus modelos, ✅ la conexión funciona.

### Test 2: Verificar Build en Vercel

1. Ve a Vercel Dashboard → **Deployments**
2. El último deployment debe mostrar **"Ready"** (no "Failed")
3. Click en el deployment → **"Build Logs"**
4. Busca: `✓ Compiled successfully` - debe aparecer sin errores

### Test 3: Probar la App en Producción

1. Abre: https://tu-cyber-shield.vercel.app/register
2. Registra un usuario de prueba:
   - Nombre: "Test User"
   - Email: "test@example.com"
   - Contraseña: "test123456"
3. Deberías ser redirigido a `/login?registered=true`
4. Inicia sesión y verifica que llegues al dashboard

### Test 4: Verificar Datos en PostgreSQL

**Para Vercel Postgres**:
```bash
# Abrir Prisma Studio conectado a producción
vercel env pull .env.local
npx prisma studio
```

**Para Neon/Supabase**:
- Neon: Dashboard → Tables → Ver datos
- Supabase: Dashboard → Table Editor → Ver tabla `User`

Debes ver el usuario "test@example.com" que creaste.

---

## 🔧 Troubleshooting

### Error: "P1001: Can't reach database server"

**Solución**:
- Verifica que `DATABASE_URL` esté correctamente configurado en Vercel
- Asegúrate de que incluye `?sslmode=require` al final
- Verifica que la base de datos no esté pausada (Neon pausa después de inactividad)

### Error: "prisma generate failed"

**Solución**:
```bash
# Actualizar Prisma
npm install prisma@latest @prisma/client@latest

# Regenerar
npx prisma generate
```

### Build falla en Vercel

**Solución**:
1. Verifica que `vercel.json` NO tenga `prisma db push` en el build command
2. Verifica que `schema.prisma` tenga `provider = "postgresql"`
3. Revisa los Build Logs en Vercel para el error específico

### La app muestra 404

**Solución**:
- El build probablemente falló
- Ve a Vercel Dashboard → Deployments → Click en el failed deployment
- Revisa los logs de build
- Soluciona el error y re-deploy con `vercel --prod`

---

## 📊 Comparación de Opciones

| Característica | Vercel Postgres | Neon | Supabase |
|---|---|---|---|
| **Free Tier** | 256 MB | 0.5 GB | 500 MB |
| **Integración Vercel** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Velocidad Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Features Extras** | - | Auto-scaling | Auth, Storage, API |
| **Recomendado para** | Vercel projects | Apps serverless | Full-stack apps |

**Mi recomendación**: Empieza con **Vercel Postgres** por la integración nativa.

---

## ✅ Checklist Final

Antes de considerar la migración completa:

- [ ] Base de datos PostgreSQL creada
- [ ] `DATABASE_URL` configurado en Vercel
- [ ] Migraciones ejecutadas (`npx prisma db push`)
- [ ] Build exitoso en Vercel (sin errores)
- [ ] App accesible en https://tu-cyber-shield.vercel.app
- [ ] Registro funciona correctamente
- [ ] Login funciona correctamente
- [ ] Datos persisten en PostgreSQL

---

## 📞 Próximos Pasos

1. **Elige una opción** de base de datos (recomiendo Vercel Postgres)
2. **Sigue los pasos** de configuración
3. **Ejecuta las migraciones**
4. **Re-despliega** en Vercel
5. **Prueba** la aplicación en producción

¿Necesitas ayuda con algún paso? ¡Házmelo saber!
