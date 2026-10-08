# 🚀 Quick Deployment Checklist

Use this checklist to deploy PulseLoop step by step.

---

## ✅ Pre-Deployment

- [ ] Code is working locally
- [ ] All tests pass
- [ ] Demo data works (ramesh@demo.com login)
- [ ] GitHub repository created
- [ ] Code pushed to GitHub

---

## ✅ MongoDB Atlas Setup

- [ ] Signed up for MongoDB Atlas
- [ ] Created free cluster (Singapore region)
- [ ] Created database user (username + password saved)
- [ ] Whitelisted IP addresses (0.0.0.0/0)
- [ ] Got connection string
- [ ] Replaced `<password>` with actual password
- [ ] Added database name: `/pulseloop`
- [ ] Connection string saved securely

**Your MongoDB URI:**
```
mongodb+srv://pulseloop-admin:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/pulseloop?retryWrites=true&w=majority
```

---

## ✅ Render ML Service

- [ ] Signed up for Render
- [ ] Created new Web Service
- [ ] Connected GitHub repository
- [ ] Configured:
  - Name: `pulseloop-ml`
  - Region: Singapore
  - Root Directory: `ml-service`
  - Environment: Python 3
  - Build: `pip install -r requirements.txt`
  - Start: `python main.py`
- [ ] Added environment variables:
  - `PORT` = `10000`
  - `MONGODB_URI` = (your connection string)
- [ ] Deployed successfully
- [ ] Health check works: `https://pulseloop-ml.onrender.com/health`

**Your ML Service URL:** ___________________________________

---

## ✅ Render Backend

- [ ] Created new Web Service on Render
- [ ] Connected GitHub repository
- [ ] Configured:
  - Name: `pulseloop-backend`
  - Region: Singapore
  - Root Directory: `backend`
  - Environment: Node
  - Build: `npm install && npm run build`
  - Start: `npm start`
- [ ] Added environment variables:
  - `NODE_ENV` = `production`
  - `PORT` = `10000`
  - `MONGODB_URI` = (your connection string)
  - `JWT_SECRET` = (random 32+ char string)
  - `JWT_EXPIRE` = `7d`
  - `ML_SERVICE_URL` = (your ML service URL)
  - `CORS_ORIGIN` = `https://pulseloop.vercel.app`
- [ ] Deployed successfully
- [ ] Health check works: `https://pulseloop-backend.onrender.com/health`
- [ ] Ran seed command: `npm run seed` in Shell tab
- [ ] Seed completed successfully

**Your Backend URL:** ___________________________________

---

## ✅ Vercel Frontend

- [ ] Signed up for Vercel
- [ ] Connected GitHub account
- [ ] Imported `pulseloop` repository
- [ ] Configured:
  - Framework: Vite
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Deployed successfully
- [ ] Frontend loads: `https://pulseloop-XXXXX.vercel.app`
- [ ] Can see login page

**Your Frontend URL:** ___________________________________

---

## ✅ Update CORS

- [ ] Copied your actual Vercel URL
- [ ] Went to Render → pulseloop-backend → Environment
- [ ] Updated `CORS_ORIGIN` to your Vercel URL
- [ ] Saved changes
- [ ] Backend redeployed

---

## ✅ Final Testing

- [ ] Opened your Vercel URL
- [ ] Login page loads correctly
- [ ] Logged in with: ramesh@demo.com / password123
- [ ] Dashboard shows data and charts
- [ ] Clicked "Discover Patterns"
- [ ] Pattern detection works (may take 30-60s first time)
- [ ] Patterns display correctly
- [ ] Can create experiment
- [ ] Can submit check-in
- [ ] No console errors in browser

---

## ✅ Documentation

- [ ] Updated README.md with live URLs
- [ ] Shared deployment URLs with team
- [ ] Documented any deployment issues encountered
- [ ] Created monitoring plan

---

## 📊 Your Live URLs

```
Frontend:  https://___________________________________
Backend:   https://___________________________________
ML Service: https://___________________________________
Database:  MongoDB Atlas (Singapore)
```

---

## 🎯 Demo Credentials

```
Email:    ramesh@demo.com
Password: password123
```

---

## 🎉 Status: DEPLOYED!

- [ ] All services live
- [ ] All health checks pass
- [ ] Demo flow works end-to-end
- [ ] URLs shared with stakeholders
- [ ] Ready for CaseBlitz presentation

---

## 📝 Notes

**Issues encountered:**

_____________________________________________

**Solutions applied:**

_____________________________________________

**Performance notes:**

_____________________________________________

---

## ⏱️ Expected Deployment Time

- MongoDB Atlas: 5 minutes
- GitHub push: 2 minutes
- Render ML Service: 5 minutes
- Render Backend: 5 minutes
- Vercel Frontend: 3 minutes
- Testing: 5 minutes

**Total: ~25 minutes**

---

## 🚨 If Something Goes Wrong

1. **Check Render logs**: Service → Logs tab
2. **Check browser console**: F12 → Console tab
3. **Verify URLs**: All service URLs correct?
4. **Check CORS**: Backend CORS_ORIGIN matches frontend URL?
5. **MongoDB**: Connection string correct?
6. **Environment variables**: All set correctly?

---

## ✅ All Checked? You're Live!

Share your app:
**https://your-frontend-url.vercel.app**

Good luck with CaseBlitz 2026! 🏆
