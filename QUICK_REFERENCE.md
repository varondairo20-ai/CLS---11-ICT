# Quick Reference - CLS Monitor Commands

## 🚀 Start Server

### Option 1: npm (Recommended)
```bash
npm start
```

### Option 2: Direct node (Development with logging)
```bash
node server.js
```

### Option 3: Windows batch script
```bash
START.bat
```

### Option 4: With auto-reload (Development)
```bash
npm run dev
```

---

## 📍 Access URLs

### Local Only
```
http://localhost:3000/              # Login page
http://localhost:3000/teacher-dashboard.html    # Teacher
http://localhost:3000/student.html   # Student
```

### Network (Replace 192.168.100.175 with your IP)
```
http://192.168.100.175:3000/        # Login page
http://192.168.100.175:3000/teacher-dashboard.html
http://192.168.100.175:3000/student.html
```

### Get Your IP
```powershell
# Windows
ipconfig

# macOS / Linux
ifconfig
```

---

## 🔑 Test Credentials

```
Teacher:  username=teacher_01  password=password123
Student:  username=student_01  password=password123
Student:  username=student_02  password=password123
```

---

## 🔒 Firewall Setup (Windows)

If students can't connect, run this in PowerShell as Administrator:

```powershell
New-NetFirewallRule -DisplayName 'CLS Monitor 3000' `
  -Direction Inbound `
  -LocalPort 3000 `
  -Protocol TCP `
  -Action Allow
```

Verify:
```powershell
Get-NetFirewallRule -DisplayName 'CLS Monitor*'
```

Remove (if needed):
```powershell
Remove-NetFirewallRule -DisplayName 'CLS Monitor 3000'
```

---

## 🧪 Test API

### Check if server is running
```bash
curl http://localhost:3000/api/devices
```

### Login test
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher_01","password":"password123"}'
```

---

## 📝 Configuration

### Edit .env file
```
PORT=3000               # Change server port
NODE_ENV=production     # Or 'development' for verbose logging
HOST=0.0.0.0            # Listen on all interfaces (required for network access)
```

---

## 🐛 Troubleshooting

### Port already in use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with the number shown)
taskkill /PID <PID> /F
```

### Clear Node modules and reinstall
```bash
rm node_modules -r      # Linux/macOS: rm -rf node_modules
npm install
```

### Check Node.js version
```bash
node --version
npm --version
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Overview and quick start |
| `DEPLOYMENT.md` | Detailed deployment guide |
| `VERIFICATION.md` | Testing checklist |
| `COMPLETE_SUMMARY.md` | Comprehensive fix summary |
| `START.bat` | Windows batch startup script |

---

## 🌍 Remote Deployment Options

### Option A: Vercel (Instant Deployment - Free)
```bash
# 1. Create GitHub account (free at github.com)
# 2. Create GitHub repository
# 3. Push code to GitHub:
git init
git add .
git commit -m "CLS Monitor"
git push origin main

# 4. Go to https://vercel.com
# 5. Click "New Project"
# 6. Select your GitHub repo
# 7. Click "Deploy"

# Access: https://your-project.vercel.app/
```

**Why Vercel?**
- ✅ Free with automatic HTTPS
- ✅ Zero configuration needed
- ✅ Automatic deployments on git push
- ✅ Works worldwide instantly
- ✅ No server to manage

### Option B: Ngrok (Instant Testing)
```bash
# Download from https://ngrok.com
ngrok http 3000
# Share the https://xxxx.ngrok.io URL
```

### Option C: Cloud Server (Production)
1. Deploy to AWS, DigitalOcean, Heroku
2. Configure domain in DNS
3. Use HTTPS certificate (Let's Encrypt free)
4. Access via https://yourdomain.com/

### Option D: SSH Tunnel (Secure Remote)
```bash
ssh -R 80:localhost:3000 serveo.net
# Access via https://YOUR_HASH.serveo.net
```

---

## 🔍 Server Output Interpretation

```
[OK] Accounts loaded from memory       # ✅ Test accounts ready
=== CLS Monitor Server ===             # ✅ Server starting
Environment: production                # ✅ Production mode
Port: 3000                             # ✅ Listening on port 3000

Access URLs:
  Local: http://localhost:3000/        # For local machine only
  
  Remote Access (LAN):
    http://192.168.100.175:3000/       # ✅ Share this with students on same network

=== Firewall Configuration ===
If students cannot reach...             # ⚠️ If connection fails, apply firewall rule

=== Test Credentials ===                # ✅ Use these to login
```

---

## 📞 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Students can't connect | 1. Use server IP (not localhost)<br/>2. Check firewall rule<br/>3. Verify same network |
| WebSocket won't connect | 1. Check browser console (F12)<br/>2. Verify firewall<br/>3. Try different browser |
| Port 3000 already in use | 1. Change PORT in .env<br/>2. Kill process on port<br/>3. Restart server |
| HTTPS not working | 1. For local: Use http:// not https://<br/>2. For production: Set up SSL cert<br/>3. Server auto-detects and uses WSS |
| Login fails | 1. Check credentials (see above)<br/>2. Check server logs<br/>3. Verify server is running |

---

## 🎯 Typical Workflow

### First Time Setup
```
1. npm install
2. npm start
3. Get IP: ipconfig
4. Share IP with students
5. If connection fails: Apply firewall rule
```

### Daily Use
```
1. npm start
2. Teachers open http://SERVER_IP:3000/
3. Students open http://SERVER_IP:3000/
4. Login with credentials
5. Dashboard loads automatically
```

### Stopping Server
```
Press Ctrl+C in terminal
```

---

## 📱 Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome | ✅ Fully supported |
| Firefox | ✅ Fully supported |
| Safari | ✅ macOS & iOS 15+ |
| Edge | ✅ Fully supported |
| Opera | ✅ Fully supported |
| Mobile Safari | ⚠️ Requires HTTPS/WSS |

---

## 💾 Backup Configuration

### Save current setup
```bash
# Backup .env
copy .env .env.backup

# Backup entire project
tar -czf cls-monitor-backup.tar.gz .
```

### Restore from backup
```bash
# Restore .env
copy .env.backup .env

# Restore project
tar -xzf cls-monitor-backup.tar.gz
npm install
```

---

## 🔄 Version Info

- **Version**: 1.0.0
- **Node.js**: v14+ required
- **npm**: v6+ required
- **Updated**: February 2026

---

## 📞 Support Resources

- Node.js Docs: https://nodejs.org/docs/
- Express.js: https://expressjs.com/
- WebSocket: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- WebRTC: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API

---

**Pro Tip**: Save this file as a reference. It covers 90% of common tasks!
