# 🔧 Quick Fix: Update CORS in Render Dashboard

The code fix has been deployed, but if Render is taking too long, you can manually update the environment variable:

## Option 1: Wait for Automatic Deployment (Recommended)
The fix is in the code and will deploy automatically. Render free tier can take 5-10 minutes.

Check status: https://dashboard.render.com → pulseloop-backend → Events

## Option 2: Manual Environment Variable (Instant)

If you need it working NOW:

1. **Go to**: https://dashboard.render.com
2. **Click on**: `pulseloop-backend` service
3. **Go to**: **Environment** tab
4. **Find**: `CORS_ORIGIN` variable
5. **Update value to**: `https://pulse-sathi-rosy.vercel.app`
6. **Click**: **Save Changes**
7. **Wait**: 30 seconds for service to restart

## Test After Fix

Open your browser and go to:
https://pulse-sathi-rosy.vercel.app

Open DevTools (F12) → Console

Try logging in with:
- Email: `ramesh@demo.com`
- Password: `password123`

You should NOT see CORS errors anymore!

## Why This Happened

The backend code now supports multiple origins:
- `http://localhost:5173` (local dev)
- `https://pulse-sathi-rosy.vercel.app` (your deployment)
- Whatever is in `CORS_ORIGIN` env variable

But Render's automatic deployment is slow on free tier.

## Current Status

✅ Code fix: DEPLOYED to GitHub
🔄 Render build: IN PROGRESS (5-10 min)
⚡ Manual fix: INSTANT (if you update env var)

---

**TL;DR**: Either wait 5-10 minutes OR update CORS_ORIGIN in Render dashboard now.
