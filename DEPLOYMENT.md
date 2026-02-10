# CLS Monitor - Deployment & Setup Guide

## Overview
CLS Monitor is a real-time computer lab supervision system with:
- Teacher dashboard for monitoring student screens
- Student devices streaming via WebRTC
- Real-time signaling using WebSocket
- Cross-platform browser-based access

## Architecture
```
Browser (Teacher) ←→ Express Server + WebSocket ←→ Browser (Student)
          (ws/wss)                                    (ws/wss)
```

## Installation

### Prerequisites
- Node.js v14+ (with npm)
- Windows, macOS, or Linux
- Port 3000 available (or configure in .env)

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment** (Optional)
   - Copy `.env.example` to `.env`
   - Edit `.env` if needed (default values work for most setups)
   ```
   PORT=3000           # Server port
   NODE_ENV=production # Set to 'development' for verbose logging
   HOST=0.0.0.0        # Listen on all interfaces (required for remote access)
   ```

3. **Start the Server**
   ```bash
   npm start
   ```
   or with auto-reload during development:
   ```bash
   npm run dev
   ```

## Access URLs

### Local Network (LAN)
After starting the server, it will display all available access URLs:
- **Login Page**: `http://<SERVER_IP>:3000/`
- **Teacher Dashboard**: `http://<SERVER_IP>:3000/teacher-dashboard.html`
- **Student Device**: `http://<SERVER_IP>:3000/student.html`
- **API (List Devices)**: `http://<SERVER_IP>:3000/api/devices`
- **Login API**: `POST http://<SERVER_IP>:3000/api/auth/login`

Replace `<SERVER_IP>` with:
- `localhost` for local access
- Your machine's IP address (e.g., `192.168.1.100`) for student devices on the network
- The public IP/domain name for remote access over the internet

### Finding Your Server IP
**Windows (Command Prompt or PowerShell):**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (e.g., `192.168.x.x`)

**macOS/Linux:**
```bash
ifconfig
```
or
```bash
hostname -I
```

## Test Credentials

| Role    | Username    | Password     |
|---------|-------------|--------------|
| Teacher | teacher_01  | password123  |
| Student | student_01  | password123  |
| Student | student_02  | password123  |

## Firewall Configuration

If students cannot connect from remote devices, you must configure Windows Firewall.

**PowerShell (Run as Administrator):**
```powershell
New-NetFirewallRule -DisplayName 'CLS Monitor 3000' -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**Verify Rule:**
```powershell
Get-NetFirewallRule -DisplayName 'CLS Monitor*'
```

**Remove Rule (if needed):**
```powershell
Remove-NetFirewallRule -DisplayName 'CLS Monitor 3000'
```

## Testing the Setup

### 1. Verify Server is Running
```bash
curl http://localhost:3000/api/devices
```
Should return: `[]` (empty array)

### 2. Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher_01","password":"password123"}'
```

### 3. Manual Testing
1. Open browser to `http://<SERVER_IP>:3000/`
2. Login with `teacher_01 / password123`
3. Open second browser to `http://<SERVER_IP>:3000/`
4. Login with `student_01 / password123`
5. Teacher should see the student device appear in the dashboard

## Remote Deployment (Internet Access)

### Option 1: Vercel (Easiest - Recommended for Beginners)
**Vercel** is a free platform perfect for deploying this application with zero configuration.

**Setup Steps:**
1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub, GitLab, or email
   - Authorize Vercel to access your repositories

2. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "CLS Monitor"
   git push origin main
   ```
   (Create a GitHub repository first at https://github.com/new)

3. **Deploy on Vercel**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Select your GitHub repository
   - Click "Deploy"
   - Vercel automatically handles HTTPS/SSL

4. **Access Your Application**
   - URL: `https://cls-monitor-yourname.vercel.app/`
   - Share this URL with students
   - HTTPS and WebSocket (WSS) work automatically

**Advantages:**
- ✅ Free SSL/HTTPS (automatic)
- ✅ Automatic deployments on git push
- ✅ Global CDN for fast performance
- ✅ WebSocket support built-in
- ✅ No server configuration needed
- ✅ Scales automatically
- ✅ Custom domain support (optional paid)

**Limitations:**
- Function cold starts (first request takes 1-2 seconds)
- Free tier limited to 100GB data transfer/month
- Uses serverless architecture (fine for this use case)

**Update Application for Vercel:**
```bash
# Vercel automatically sets PORT and HOST
# No changes needed - your app will work as-is!
```

### Option 2: VPS/Cloud Server
1. Deploy this application to a cloud server (AWS, DigitalOcean, Heroku, etc.)
2. Configure DNS pointing to the server
3. Use HTTPS/WSS for security (use Let's Encrypt for free SSL certificates)
4. Update `NODE_ENV=production` in `.env`

### Option 3: Ngrok (Quick Testing)
For quick remote testing without deploying:
```bash
# Install ngrok from https://ngrok.com
ngrok http 3000
```
Share the generated URL with students.

### Option 4: Port Forwarding (Home Network)
⚠️ **Security Note:** Not recommended for production
1. Log into your router
2. Enable Port Forwarding: Forward external port (e.g., 8080) → Internal IP:3000
3. Share your public IP with students
4. ⚠️ Consider using a VPN or reverse proxy instead

## SSL/HTTPS Setup (Required for Remote Deployment)

For production with HTTPS, use a reverse proxy like Nginx:

**Example Nginx Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

The application automatically detects HTTPS and uses secure WebSocket (WSS).

## Troubleshooting

### Students Cannot Connect
1. **Check Server is Running**
   ```bash
   netstat -ano | findstr :3000  # Windows
   lsof -i :3000                  # macOS/Linux
   ```

2. **Check Firewall**
   - Windows Firewall: Add rule as shown above
   - Router/Network Firewall: Verify port 3000 is open

3. **Check IP Address**
   - Use the correct server IP (not `localhost` from remote devices)
   - Test from command line: `ping <SERVER_IP>`

4. **Check Network**
   - Students should be on same network or VPN
   - For internet access, use a cloud server or reverse proxy

### WebSocket Connection Issues
- Browser must support WebSocket (all modern browsers do)
- Check browser console for errors (F12 → Console tab)
- Verify WebSocket connection in Network tab

### Performance Issues
- Use `NODE_ENV=production` for better performance
- Consider using a reverse proxy (Nginx, Apache)
- Implement connection pooling for many students

## Architecture Details

### WebSocket Protocol
- Messages are JSON objects with `type` and optional `payload`
- Automatic reconnection for students if server restarts
- ICE candidates and SDP offers/answers for WebRTC

### Device Registration
- Students register with a device ID: `DEV-{username}-{timestamp}`
- Teachers identify devices for screen sharing
- Session management via localStorage (client-side)

### Security Notes
- Credentials are sent over HTTP by default (use HTTPS in production)
- WebSocket messages are unencrypted (use WSS over HTTPS)
- No persistent database (data lost on server restart)
- For production: implement authentication tokens, HTTPS, database persistence

## API Endpoints

### Authentication
```
POST /api/auth/login
Body: {"username": "teacher_01", "password": "password123"}
Response: {"success": true, "sessionId": "...", "username": "...", "role": "..."}
```

### Devices
```
GET /api/devices
Response: [{"id": "DEV-student_01-...", "name": "student_01", "status": "active", "webcamAllowed": false}]
```

### WebSocket (Real-time)
```
ws://localhost:3000/
Upgrade connection to WebSocket for real-time communication
```

## Development

### Project Structure
```
.
├── server.js                  # Express + WebSocket server
├── login.html                 # Login page
├── teacher-dashboard.html     # Teacher interface
├── student.html               # Student interface
├── styles.css                 # Shared styles
├── package.json               # Dependencies
└── .env                        # Environment configuration
```

### Key Technologies
- **Express.js** - HTTP server
- **WebSocket (ws)** - Real-time communication
- **WebRTC** - Peer-to-peer screen sharing
- **vanilla JavaScript** - No frameworks for lightweight deployment

### Adding Features
1. Extend `/api/` routes in `server.js` for REST endpoints
2. Add WebSocket message types in the `ws.on('message')` handler
3. Update HTML files with new UI elements
4. Test with multiple browsers (Chrome, Firefox, Safari, Edge)

## Support & Resources

- WebRTC Documentation: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- Express.js: https://expressjs.com/
- Node.js: https://nodejs.org/

---

**Last Updated:** February 2026
**Version:** 1.0.0
