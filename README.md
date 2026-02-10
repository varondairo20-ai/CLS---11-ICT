# CLS Monitor - Classroom Monitoring System

A WebRTC-based classroom monitoring system allowing teachers to supervise student screens in real-time. Works on local networks and supports remote deployment.

## Quick Start

### Prerequisites
- Node.js v14+
- npm
- Windows/macOS/Linux

### Installation
```bash
npm install
```

### Running the Server
```bash
npm start
```

The server will start on port 3000 and display all available access URLs.

### Default Accounts (In-Memory)
- **Teacher:** `teacher_01` / `password123`
- **Student 1:** `student_01` / `password123`
- **Student 2:** `student_02` / `password123`

## Access URLs

### Local Machine
- **Login:** `http://localhost:3000/`
- **Teacher Dashboard:** `http://localhost:3000/teacher-dashboard.html`
- **Student Device:** `http://localhost:3000/student.html`
- **API (Devices):** `http://localhost:3000/api/devices`

### Network/Remote (Replace with your server IP or domain)
- **Login:** `http://<SERVER_IP>:3000/`
- **Teacher Dashboard:** `http://<SERVER_IP>:3000/teacher-dashboard.html`
- **Student Device:** `http://<SERVER_IP>:3000/student.html`

## Features

✅ Unified authentication (Teacher & Student roles)  
✅ Real-time WebSocket signaling  
✅ WebRTC peer-to-peer screen sharing  
✅ Live teacher dashboard with device status  
✅ Role-based access control  
✅ Cross-platform browser support  
✅ LAN network access with automatic IP detection  
✅ Firewall-friendly configuration  

## Development

```bash
npm run dev  # Run with nodemon for live reload
```

## Deployment

### For Local Network Only (Recommended for Classrooms)

1. **Configure Server (Optional)**
   ```bash
   # Edit .env file
   PORT=3000
   HOST=0.0.0.0
   NODE_ENV=production
   ```

2. **Start Server**
   ```bash
   npm start
   ```

3. **Students Connect Using**
   - Get server IP: `ipconfig` (Windows) or `ifconfig` (macOS/Linux)
   - URL: `http://<SERVER_IP>:3000/`

4. **Allow Firewall Access (Windows)**
   ```powershell
   New-NetFirewallRule -DisplayName 'CLS Monitor 3000' -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```

### For Remote Access (Over Internet)

⚠️ **For secure remote access, use one of these methods:**

#### Option A: Vercel (Easiest - Free)
Deploy instantly to Vercel with automatic HTTPS:
1. Create account at https://vercel.com
2. Connect your GitHub repository
3. Click "Deploy" - that's it!
4. Access via: `https://your-project.vercel.app/`
5. Share URL with students worldwide

**Best for:** Quick internet access without configuration

#### Option B: Cloud Server (Traditional)
1. Deploy to AWS, DigitalOcean, Heroku, or similar
2. Configure HTTPS with Let's Encrypt (free SSL)
3. Update `.env`: `NODE_ENV=production`
4. Access via domain name: `https://yourdomain.com/`

**Best for:** Production use with custom domain

#### Option C: Ngrok (Quick Testing)
```bash
# Install from https://ngrok.com
ngrok http 3000
# Share the provided URL with students
```

**Best for:** Quick testing without deployment


#### Option C: Reverse Proxy (Nginx/Apache)
Set up a reverse proxy with SSL termination:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

For detailed deployment and troubleshooting, see [DEPLOYMENT.md](DEPLOYMENT.md)

## Architecture
- **Frontend:** HTML5, JavaScript, WebRTC
- **Backend:** Node.js, Express, WebSocket
- **Storage:** In-memory (no database)

## Notes

- This is a development prototype using in-memory storage
- Accounts are hardcoded and reset on server restart
- For production, add a proper database and authentication system

