# 🚀 PulseLoop Deployment Guide

Complete guide to deploy PulseLoop to production using Vercel (Frontend) and Render (Backend + ML Service).

---

## 📋 Prerequisites

1. **GitHub Account** (to push code)
2. **Vercel Account** (free tier) - https://vercel.com
3. **Render Account** (free tier) - https://render.com
4. **MongoDB Atlas Account** (free tier) - https://www.mongodb.com/cloud/atlas

---

## 🗄️ Step 1: Setup MongoDB Atlas (5 minutes)

### 1.1 Create Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Login
3. Click **"Build a Database"**
4. Select **"Shared" (Free tier)**
5. Choose **Singapore** region (closest to India)
6. Cluster name: `pulseloop`
7. Click **"Create Cluster"**

### 1.2 Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Username: `pulseloop-admin`
4. Password: Generate strong password (SAVE THIS!)
5. Database User Privileges: **"Read and write to any database"**
6. Click **"Add User"**

### 1.3 Whitelist IP Addresses

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Note: For production, whitelist only Render IPs
4. Click **"Confirm"**

### 1.4 Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://pulseloop-admin:<password>@pulseloop.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: `pulseloop`
   ```
   mongodb+srv://pulseloop-admin:YOUR_PASSWORD@pulseloop.xxxxx.mongodb.net/pulseloop?retryWrites=true&w=majority
   ```
7. **SAVE THIS CONNECTION STRING!**

---

## 📤 Step 2: Push Code to GitHub (2 minutes)

### 2.1 Initialize Git (if not already)

```bash
cd pulseloop
git init
git add .
git commit -m "Initial commit - PulseLoop MVP"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `pulseloop`
3. Visibility: **Private** (or Public)
4. Click **"Create repository"**

### 2.3 Push Code

```bash
git remote add origin https://github.com/YOUR_USERNAME/pulseloop.git
git branch -M main
git push -u origin main
```

---

## 🐍 Step 3: Deploy ML Service to Render (5 minutes)

### 3.1 Create ML Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `pulseloop` repository

### 3.2 Configure Service

**Basic Settings:**
- Name: `pulseloop-ml`
- Region: **Singapore**
- Branch: `main`
- Root Directory: `ml-service`
- Environment: **Python 3**
- Build Command: `pip install -r requirements.txt`
- Start Command: `python main.py`

**Environment Variables:**
Click **"Advanced"** → **"Add Environment Variable"**

| Key | Value |
|-----|-------|
| `PORT` | `10000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |

### 3.3 Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Once deployed, note the URL: `https://pulseloop-ml.onrender.com`
4. Test: Open `https://pulseloop-ml.onrender.com/health`
   - Should see: `{"status":"healthy"}`

---

## 🖥️ Step 4: Deploy Backend to Render (5 minutes)

### 4.1 Create Backend Service

1. On Render dashboard, click **"New +"** → **"Web Service"**
2. Select your `pulseloop` repository again

### 4.2 Configure Service

**Basic Settings:**
- Name: `pulseloop-backend`
- Region: **Singapore**
- Branch: `main`
- Root Directory: `backend`
- Environment: **Node**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Environment Variables:**

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate random string (use https://randomkeygen.com) |
| `JWT_EXPIRE` | `7d` |
| `ML_SERVICE_URL` | `https://pulseloop-ml.onrender.com` |
| `CORS_ORIGIN` | `https://pulseloop.vercel.app` (update after frontend deploy) |

### 4.3 Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Once deployed, note the URL: `https://pulseloop-backend.onrender.com`
4. Test: Open `https://pulseloop-backend.onrender.com/health`
   - Should see: `{"status":"ok","timestamp":"..."}`

### 4.4 Seed Demo Data

1. In Render dashboard, go to your `pulseloop-backend` service
2. Click **"Shell"** tab
3. Run: `npm run seed`
4. Wait for: "Database seeded successfully!"

---

## 🌐 Step 5: Deploy Frontend to Vercel (3 minutes)

### 5.1 Update API URL

The frontend is already configured to use production backend URL in production.

Verify `frontend/src/lib/api.ts` has:
```typescript
baseURL: import.meta.env.PROD 
  ? 'https://pulseloop-backend.onrender.com/api'
  : '/api',
```

### 5.2 Push Changes (if you made any)

```bash
git add .
git commit -m "Configure for production deployment"
git push
```

### 5.3 Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import your `pulseloop` GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click **"Deploy"**
6. Wait 2-3 minutes

### 5.4 Get Your URL

- Vercel will give you a URL like: `https://pulseloop.vercel.app`
- Test by visiting the URL

---

## 🔄 Step 6: Update CORS Settings (1 minute)

Now that you have your Vercel URL, update the backend CORS setting:

1. Go to Render dashboard
2. Open `pulseloop-backend` service
3. Go to **"Environment"** tab
4. Update `CORS_ORIGIN` to your actual Vercel URL:
   ```
   https://pulseloop-XXXXX.vercel.app
   ```
5. Click **"Save Changes"**
6. Service will auto-redeploy

---

## ✅ Step 7: Test Production Deployment

### 7.1 Health Checks

```bash
# ML Service
curl https://pulseloop-ml.onrender.com/health

# Backend
curl https://pulseloop-backend.onrender.com/health
```

### 7.2 Login Test

1. Open your Vercel URL: `https://pulseloop.vercel.app`
2. Login with: `ramesh@demo.com` / `password123`
3. Should see dashboard with data
4. Click **"Discover Patterns"**
5. Should see detected patterns

---

## 🎉 Success! Your App is Live!

### Your Deployment URLs:

- **Frontend**: https://pulseloop.vercel.app (or your custom domain)
- **Backend**: https://pulseloop-backend.onrender.com
- **ML Service**: https://pulseloop-ml.onrender.com
- **Database**: MongoDB Atlas (Singapore)

---

## 🔧 Troubleshooting

### Issue: Frontend shows "Network Error"

**Fix:** Check CORS settings in backend
1. Verify `CORS_ORIGIN` in Render matches your Vercel URL exactly
2. No trailing slash
3. Redeploy backend after changing

### Issue: "Cannot connect to database"

**Fix:** Check MongoDB connection string
1. Verify password is correct (no special characters that need encoding)
2. Check IP whitelist includes 0.0.0.0/0
3. Ensure database name is included in connection string

### Issue: ML Service "Module not found"

**Fix:** Check requirements.txt
1. All dependencies listed
2. Correct Python version in runtime.txt
3. Check Render logs for specific error

### Issue: Backend fails to build

**Fix:** Check TypeScript compilation
1. Ensure all dependencies in package.json
2. Check Render build logs
3. May need to increase build timeout

### Issue: Render free tier "spinning down"

**Note:** Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- For production, upgrade to paid tier ($7/month per service)

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Demo/Pilot)

- **MongoDB Atlas**: Free (512 MB)
- **Render Backend**: Free (750 hours/month)
- **Render ML Service**: Free (750 hours/month)
- **Vercel Frontend**: Free (unlimited)
- **Total**: $0/month

**Limitations:**
- Services sleep after 15 min inactivity
- Limited to 512 MB database
- 100 GB bandwidth/month

### Production Tier (For Scaling)

- **MongoDB Atlas**: Shared M2 - $9/month
- **Render Backend**: Starter - $7/month
- **Render ML Service**: Starter - $7/month
- **Vercel Frontend**: Pro - $20/month
- **Total**: $43/month

**Benefits:**
- No sleeping
- 2 GB database
- Better performance
- Custom domains
- SSL included

---

## 🌍 Custom Domain (Optional)

### For Vercel (Frontend)

1. Buy domain (e.g., pulseloop.health from Namecheap)
2. In Vercel dashboard, go to your project
3. Click **"Settings"** → **"Domains"**
4. Add your domain
5. Update DNS records as instructed
6. SSL auto-configured

### Update Backend CORS

After setting custom domain:
1. Update `CORS_ORIGIN` in Render backend to your custom domain
2. Redeploy

---

## 📊 Monitoring

### Render Dashboard

- View logs: Click service → **"Logs"** tab
- View metrics: **"Metrics"** tab (CPU, memory, requests)
- Set up alerts: **"Settings"** → **"Alerts"**

### Vercel Analytics

- Built-in analytics available
- Shows: Page views, performance, errors
- Access: Project → **"Analytics"** tab

### MongoDB Atlas

- Monitor: **"Metrics"** tab
- Set alerts: **"Alerts"** tab
- View slow queries: **"Performance Advisor"**

---

## 🔐 Security Checklist

### ✅ Before Going Live

- [ ] Strong JWT_SECRET (not "your-secret-key")
- [ ] MongoDB password is strong
- [ ] CORS_ORIGIN set to specific domain (not "*")
- [ ] Environment variables not committed to git
- [ ] API rate limiting enabled
- [ ] MongoDB IP whitelist tightened (optional, for high security)
- [ ] HTTPS everywhere (auto with Vercel/Render)
- [ ] Error messages don't leak sensitive info

---

## 🚀 Deployment Workflow

### For Future Updates

```bash
# 1. Make changes locally
# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Your update message"
git push

# 4. Auto-deploys!
# - Render: Auto-deploys backend & ML service
# - Vercel: Auto-deploys frontend
```

### Rollback if Needed

**Vercel:**
1. Go to project → **"Deployments"**
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

**Render:**
1. Go to service → **"Events"**
2. Find previous successful deploy
3. Click **"Rollback"**

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com

---

## 🎯 Next Steps After Deployment

1. **Share the link** with CaseBlitz judges
2. **Monitor logs** in first 24 hours
3. **Test all flows** thoroughly
4. **Set up uptime monitoring** (e.g., UptimeRobot - free)
5. **Plan for scaling** based on usage

---

## 🎉 Congratulations!

Your PulseLoop MVP is now **LIVE** and accessible worldwide!

**Demo URL**: https://pulseloop.vercel.app

**Demo Credentials**:
- Email: ramesh@demo.com
- Password: password123

Share this with judges, investors, and potential users! 🚀
