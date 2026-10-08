# MongoDB Atlas Setup for PulseSathi

## Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email or Google account
3. Select **FREE M0 cluster** (no credit card needed)

## Step 2: Create Your Cluster

1. Choose **AWS** as provider
2. Choose closest region (e.g., Mumbai/Singapore for India)
3. Cluster name: `PulseSathi` (or any name)
4. Click **Create Cluster** (takes 3-5 minutes)

## Step 3: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `pulseloop_user` (or your choice)
5. Password: Generate a secure password (SAVE THIS!)
6. User Privileges: **Read and write to any database**
7. Click **Add User**

## Step 4: Whitelist IP Address

1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - This is needed for Render to connect
4. Click **Confirm**

## Step 5: Get Connection String

1. Go to **Database** (left sidebar)
2. Click **Connect** button on your cluster
3. Select **Connect your application**
4. Driver: **Node.js** / Version: **5.5 or later**
5. Copy the connection string:
   ```
   mongodb+srv://pulseloop_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Connection String

Replace `<password>` with your actual password and add database name:

**Before:**
```
mongodb+srv://pulseloop_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**After:**
```
mongodb+srv://pulseloop_user:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/pulseloop?retryWrites=true&w=majority
```

Note: Added `/pulseloop` before the `?` to specify database name

## Step 7: Add to Render

1. Go to: https://dashboard.render.com
2. Select your **pulseloop-backend** service
3. Go to **Environment** tab
4. Find **MONGODB_URI** variable
5. Paste your connection string
6. Click **Save Changes**
7. Render will auto-redeploy

## Step 8: Add to ML Service

1. Select your **pulseloop-ml** service
2. Go to **Environment** tab  
3. Find **MONGODB_URI** variable
4. Paste the SAME connection string
5. Click **Save Changes**

## Done! 🎉

Your backend will redeploy automatically and connect to MongoDB Atlas.

---

## Alternative: Quick MongoDB URI Format

If you already have a MongoDB Atlas cluster, your URI should look like:

```
mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

Example:
```
mongodb+srv://admin:MyPassword123@cluster0.abc12.mongodb.net/pulseloop?retryWrites=true&w=majority
```

**Important:**
- Replace `<username>` with your MongoDB username
- Replace `<password>` with your MongoDB password (URL encode special characters)
- Replace `<cluster-url>` with your cluster URL
- Database name is `pulseloop`
