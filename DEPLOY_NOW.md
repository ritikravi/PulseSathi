# 🚀 Deploy PulseLoop NOW!

**Get your app live in 25 minutes. Follow these steps in order.**

---

## ⚡ Prerequisites (2 minutes)

Create free accounts:

1. **GitHub**: https://github.com/signup
2. **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register
3. **Render**: https://dashboard.render.com/register
4. **Vercel**: https://vercel.com/signup

---

## 📦 Step 1: Push to GitHub (3 minutes)

```bash
# Initialize and commit
./deploy-init.sh

# Create repo on GitHub
# Go to: https://github.com/new
# Name: pulseloop
# Click "Create repository"

# Push code
git remote add origin https://github.com/YOUR_USERNAME/pulseloop.git
git branch -M main
git push -u origin main
```

✅ **Checkpoint**: Code is on GitHub

---

## 🗄️ Step 2: MongoDB Atlas (5 minutes)

1. **Go to**: https://cloud.mongodb.com
2. **Create Database** → Select "Shared" (Free)
3. **Region**: Singapore
4. **Create User**:
   - Username: `pulseloop-admin`
   - Password: (generate strong one, SAVE IT!)
5. **Network Access** → "Allow Access from Anywhere"
6. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy string
   - Replace `<password>` with your password
   - Add `/pulseloop` before the `?`
   
**Your final string should look like:**
```
mongodb+srv://pulseloop-admin:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/pulseloop?retryWrites=true&w=majority
```

✅ **Checkpoint**: MongoDB connection string ready

---

## 🐍 Step 3: Deploy ML Service (5 minutes)

1. **Go to**: https://dashboard.render.com
2. **New** → **Web Service**
3. **Connect** your GitHub `pulseloop` repo
4. **Configure**:
   - Name: `pulseloop-ml`
   - Region: Singapore
   - Root Directory: `ml-service`
   - Environment: Python 3
   - Build: `pip install -r requirements.txt`
   - Start: `python main.py`
5. **Environment Variables** (click "Advanced"):
   - `PORT` = `10000`
   - `MONGODB_URI` = (paste your MongoDB string)
6. **Create Web Service** → Wait 3-5 minutes
7. **Test**: Visit `https://pulseloop-ml.onrender.com/health`
   - Should see: `{"status":"healthy"}`

✅ **Checkpoint**: ML Service is live

---

## 💻 Step 4: Deploy Backend (5 minutes)

1. **On Render**: **New** → **Web Service**
2. **Connect** your GitHub `pulseloop` repo again
3. **Configure**:
   - Name: `pulseloop-backend`
   - Region: Singapore
   - Root Directory: `backend`
   - Environment: Node
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. **Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `MONGODB_URI` = (your MongoDB string)
   - `JWT_SECRET` = (generate at https://randomkeygen.com - CodeIgniter Encryption Keys)
   - `JWT_EXPIRE` = `7d`
   - `ML_SERVICE_URL` = `https://pulseloop-ml.onrender.com`
   - `CORS_ORIGIN` = `https://pulseloop.vercel.app` (update later)
5. **Create Web Service** → Wait 3-5 minutes
6. **Test**: Visit `https://pulseloop-backend.onrender.com/health`
   - Should see: `{"status":"ok",...}`

7. **Seed Demo Data**:
   - Click **"Shell"** tab in Render dashboard
   - Run: `npm run seed`
   - Wait for "Database seeded successfully!"

✅ **Checkpoint**: Backend is live with demo data

---

## 🌐 Step 5: Deploy Frontend (3 minutes)

1. **Go to**: https://vercel.com/new
2. **Import** your GitHub `pulseloop` repository
3. **Configure**:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Deploy** → Wait 2-3 minutes
5. **Get your URL**: `https://pulseloop-xxxxx.vercel.app`

✅ **Checkpoint**: Frontend is live

---

## 🔄 Step 6: Update CORS (1 minute)

Now update backend to allow your frontend:

1. **Go to Render** → `pulseloop-backend` service
2. **Environment** tab
3. **Edit** `CORS_ORIGIN`:
   - Replace with your actual Vercel URL
   - Example: `https://pulseloop-a1b2c3.vercel.app`
4. **Save Changes** → Service auto-redeploys (30 seconds)

✅ **Checkpoint**: CORS configured

---

## 🎯 Step 7: Test Everything (2 minutes)

1. **Open** your Vercel URL
2. **Login**:
   - Email: `ramesh@demo.com`
   - Password: `password123`
3. **Dashboard** should load with data
4. **Click** "Discover Patterns"
5. **Wait** 30-60 seconds (first time may be slow)
6. **Patterns** should appear!

✅ **Checkpoint**: Everything works!

---

## 🎉 YOU'RE LIVE!

### Your URLs:

- **App**: https://pulseloop-xxxxx.vercel.app
- **Backend**: https://pulseloop-backend.onrender.com
- **ML Service**: https://pulseloop-ml.onrender.com

### Demo Credentials:

- **Email**: ramesh@demo.com
- **Password**: password123

---

## 📤 Share Your App

**For CaseBlitz Judges:**
```
🎯 PulseLoop Demo
📱 https://your-vercel-url.vercel.app
👤 Email: ramesh@demo.com
🔑 Password: password123

"Personalized behavior experiments for diabetes care.
Discover patterns specific to each patient → Test → Measure → Learn"
```

---

## ⚠️ Important Notes

### Free Tier Limitations:

- **Services sleep** after 15 min inactivity
- **First request** after sleep: 30-60 seconds to wake up
- **Bandwidth**: 100 GB/month
- **Database**: 512 MB storage

### For Production:

Upgrade to paid tiers ($43/month total) for:
- No sleeping
- Faster response
- More storage
- Better reliability

---

## 🐛 Troubleshooting

### "Network Error" in frontend
→ Check `CORS_ORIGIN` in backend matches your Vercel URL exactly

### "Cannot connect to database"
→ Verify MongoDB connection string is correct (password, database name)

### ML Service "Module not found"
→ Check Render logs, may need to adjust requirements.txt

### First pattern detection is slow
→ Normal! Free tier services need to "wake up" (30-60s)

---

## 📚 Full Documentation

- **Complete Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Checklist**: [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)
- **Local Setup**: [QUICK_START.md](QUICK_START.md)
- **Project Overview**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## ⏱️ Total Time: ~25 Minutes

- MongoDB: 5 min
- GitHub: 3 min
- ML Service: 5 min
- Backend: 5 min
- Frontend: 3 min
- CORS Update: 1 min
- Testing: 2 min
- **Buffer**: 1 min

---

## 🏆 Ready for CaseBlitz!

Your app is now:
- ✅ Live on the internet
- ✅ Accessible worldwide
- ✅ Ready to demo
- ✅ Free to host (demo tier)

**Share it with judges, investors, and users!**

**Need help?** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting.

---

## 🎯 What's Next?

1. **Test thoroughly** - Run through full demo flow
2. **Monitor** - Check Render logs first 24 hours
3. **Share** - Send URL to stakeholders
4. **Present** - Wow the judges!
5. **Scale** - Upgrade to paid tier when you get users

---

**LET'S WIN CASEBLITZ 2026! 🚀**
