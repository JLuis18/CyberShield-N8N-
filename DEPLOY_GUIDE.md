# Deploy CyberShield to Vercel

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com with your GitHub)

## Step-by-Step Deployment Guide

### 1. Push Code to GitHub

First, ensure your code is in a GitHub repository:

```bash
# Si no has inicializado git todavía
git init
git add .
git commit -m "Ready for deployment"

# Crea un repositorio en GitHub y luego
git remote add origin https://github.com/TU_USUARIO/cybershield.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

Follow the prompts:
- Link to existing project?: No
- Project name: cybershield (or your preference)
- Directory: ./ (press enter)
- Want to override settings?: No

4. Deploy to production:
```bash
vercel --prod
```

#### Option B: Using Vercel Web Dashboard

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
5. Click "Deploy"

### 3. Configure Environment Variables

After first deployment, add environment variables:

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables:

```env
DATABASE_URL=file:./dev.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**Important Notes:**
- `DATABASE_URL`: For production, you'll want to use a real database (PostgreSQL, MySQL, etc.), not SQLite
- `JWT_SECRET`: Generate a secure random string
- `NEXT_PUBLIC_APP_URL`: Your Vercel URL (or custom domain)

### 4. Redeploy with Environment Variables

After adding environment variables:
```bash
vercel --prod
```

Or click "Redeploy" in the Vercel dashboard.

---

## Production Database Setup (Optional but Recommended)

For production, use a proper database instead of SQLite:

### Option 1: Vercel Postgres (Easiest)

1. In Vercel Dashboard, go to "Storage" tab
2. Click "Create Database" → "Postgres"
3. Follow the setup wizard
4. Vercel will automatically add `DATABASE_URL` to your environment

### Option 2: External Database (Supabase, PlanetScale, etc.)

1. Sign up for database service
2. Create a database
3. Get the connection string
4. Update `DATABASE_URL` in Vercel environment variables

### After Database Setup

Update your Prisma schema and run migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed initial data
npx prisma db seed
```

---

## Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## Access Your Application

Your app will be available at:
- **Vercel URL**: https://your-app-name.vercel.app
- **Custom Domain** (if configured): https://your-domain.com

---

## Troubleshooting

### Build Fails

Check build logs in Vercel dashboard. Common issues:
- Missing dependencies: Run `npm install` locally first
- TypeScript errors: Fix all TS errors before deploying
- Environment variables: Ensure all required vars are set

### Database Connection Fails

- Verify `DATABASE_URL` is correct
- Ensure database is accessible from Vercel (check firewall/allowlist)
- Run `npx prisma generate` after changing schema

### 404 Errors

- Ensure `next.config.ts` is properly configured
- Check that all routes are in `app/` directory
- Verify dynamic routes are correctly named

---

## Next Steps After Deployment

1. ✅ Test all functionality on production URL
2. ✅ Set up proper database (if using SQLite)
3. ✅ Configure custom domain
4. ✅ Set up monitoring/analytics
5. ✅ Enable HTTPS (automatic with Vercel)
6. ✅ Test mobile responsiveness
7. ✅ Set up CI/CD (automatic with Vercel + GitHub)

---

## Automatic Deploys

Vercel automatically deploys when you push to GitHub:
- **Push to `main`**: Deploys to production
- **Pull Requests**: Creates preview deployments
- **Other branches**: Creates preview deployments

---

## Cost

**Vercel Free Tier includes:**
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Custom domains
- Preview deployments

**Note**: For heavy usage, consider Vercel Pro ($20/month).
