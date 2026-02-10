# Deploying CLS Monitor to Vercel

**Vercel is the easiest way to deploy this application to the internet with automatic HTTPS/SSL support.**

## Why Vercel?

- ✅ **Free** - No credit card needed
- ✅ **Automatic HTTPS** - SSL certificate included
- ✅ **WebSocket Support** - Works perfectly with your app
- ✅ **Zero Configuration** - Just push to GitHub and deploy
- ✅ **Global CDN** - Fast access from anywhere
- ✅ **Auto-scaling** - Handles traffic automatically
- ✅ **Automatic Deployments** - Updates on every git push

## Prerequisites

1. **GitHub Account** (free at https://github.com)
2. **Vercel Account** (free at https://vercel.com)
3. **Git installed** on your computer
4. **Your code** ready to push

## Step-by-Step Deployment

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - Name: `cls-monitor` (or your preferred name)
   - Description: "CLS Monitor - Classroom Monitoring System"
   - Visibility: Public
   - Click "Create repository"

3. Copy the repository URL (e.g., `https://github.com/yourname/cls-monitor.git`)

### Step 2: Push Code to GitHub

Open PowerShell/Terminal in your project directory:

```bash
# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: CLS Monitor"

# Add remote repository
git remote add origin https://github.com/yourname/cls-monitor.git

# Push to GitHub (you may need to authenticate)
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select your `cls-monitor` repository
5. Click "Import"
6. **Important**: Under "Environment Variables", add:
   ```
   NODE_ENV = production
   PORT = 3000
   HOST = 0.0.0.0
   ```
7. Click "Deploy"
8. Wait for deployment (usually 1-2 minutes)
9. You'll get a URL like: `https://cls-monitor-yourname.vercel.app`

### Step 4: Test Your Deployment

1. Open the Vercel URL in your browser
2. Login with test credentials:
   - Username: `teacher_01`
   - Password: `password123`
3. Test that the teacher dashboard loads
4. Share the URL with students
5. Students can access at the same URL

## Using Your Application

### For Students (Access URL)
```
https://cls-monitor-yourname.vercel.app
```

### For Teachers
Same URL, login with teacher credentials

### Automatic Updates

Every time you push to GitHub:
```bash
# Make changes to files
git add .
git commit -m "Your message"
git push origin main
```

Vercel automatically detects the push and redeploys your application!

## Troubleshooting

### "WebSocket connection failed"
- ✅ This is normal - Vercel handles WebSocket (WSS) automatically
- ✅ Your browser should show "Connected to server" in console

### "Environment Variables not working"
- Go to Vercel Dashboard
- Select your project
- Click "Settings"
- Click "Environment Variables"
- Add/update variables:
  - `NODE_ENV` = `production`
  - `PORT` = `3000`
  - `HOST` = `0.0.0.0`
- Click "Save"
- Go to "Deployments" and click "Redeploy"

### "Still having issues?"
1. Check Vercel build logs:
   - Vercel Dashboard → Your Project → Deployments
   - Click "View Logs"
2. Check browser console (F12):
   - Look for WebSocket/connection errors
3. Try a different browser

## Vercel Plans

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Deployments | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| Bandwidth | 100GB/month | 1TB/month | Custom |
| Scaling | ✅ Auto | ✅ Auto | ✅ Auto |
| SSL/HTTPS | ✅ Free | ✅ Free | ✅ Free |
| Custom Domain | ✅ Yes | ✅ Yes | ✅ Yes |
| Support | Community | Email | 24/7 Phone |

**For CLS Monitor, the free plan is perfect!**

## Custom Domain (Optional)

Want to use your own domain instead of `vercel.app`?

1. **Register a domain** (Google Domains, Namecheap, etc.) - ~$12/year
2. **Add to Vercel**:
   - Vercel Dashboard → Your Project → Settings → Domains
   - Enter your domain
   - Update DNS records (Vercel provides instructions)
3. **Access**: `https://yourdomain.com`

## Advanced: Environment Variables

If you need to add custom environment variables:

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add your variables
3. Redeploy for changes to take effect

Currently used:
- `NODE_ENV` - Set to `production`
- `PORT` - Server port (usually 3000)
- `HOST` - Listen on all interfaces

## Monitoring & Logs

### View Application Logs
1. Vercel Dashboard → Your Project → Deployments
2. Click on a deployment
3. Click "Logs" tab
4. See real-time logs of your application

### Monitor Performance
1. Vercel Dashboard → Your Project → Analytics
2. View request counts, response times
3. See regions with traffic

## Rollback to Previous Version

If something breaks:
1. Vercel Dashboard → Your Project → Deployments
2. Find the working deployment
3. Click the three dots (...)
4. Click "Promote to Production"

## How It Works (Technical)

Vercel automatically:
1. Detects Node.js application
2. Installs dependencies (`npm install`)
3. Builds your application (no build step needed for this app)
4. Starts your server with `npm start`
5. Routes all requests to `server.js`
6. Provides HTTPS/SSL automatically
7. Handles WebSocket connections via WSS

The `vercel.json` file in your project tells Vercel how to deploy it.

## Cost Breakdown

- **Vercel Free Tier**: Free
- **Your Domain** (optional): ~$12/year
- **Total Cost**: $0-$12/year

Compare this to:
- AWS/DigitalOcean: $5-$40/month
- Heroku: $7-$50/month
- Traditional VPS: $5-$20/month

**Vercel is perfect for schools and classrooms!**

## Next Steps

1. Create GitHub account
2. Create GitHub repository
3. Push your code
4. Deploy to Vercel (3 clicks)
5. Share URL with students
6. Done!

## Support

- **Vercel Docs**: https://vercel.com/docs
- **WebSocket Guide**: https://vercel.com/docs/concepts/functions/serverless-functions#websocket-functions
- **Troubleshooting**: https://vercel.com/support

---

**Ready to deploy? Start with Step 1 above!**

For questions or issues, check the troubleshooting section or consult [DEPLOYMENT.md](DEPLOYMENT.md) for other deployment options.
