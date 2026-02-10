require('dotenv').config()
const os = require('os')

const express = require('express')
const http = require('http')
const path = require('path')
const WebSocket = require('ws')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname)))

// In-memory accounts (default test accounts)
const accounts = {
  'teacher_01': {
    password: 'password123',
    role: 'teacher',
    createdAt: new Date().toISOString()
  },
  'student_01': {
    password: 'password123',
    role: 'student',
    createdAt: new Date().toISOString()
  },
  'student_02': {
    password: 'password123',
    role: 'student',
    createdAt: new Date().toISOString()
  }
}

console.log('[OK] Accounts loaded from memory:', Object.keys(accounts))

// Connected clients
const clients = {
  teachers: new Map(),
  students: new Map(),
  sessionToDevice: new Map()  // Map sessionId to deviceId
}

function broadcastDeviceList() {
  const devices = Array.from(clients.students.values()).map(s => ({
    id: s.deviceId,
    name: s.username,
    status: 'active',
    webcamAllowed: s.webcamAllowed || false,
    connectedAt: s.connectedAt
  }))

  console.log(`[broadcastDeviceList] ${devices.length} devices`)

  clients.teachers.forEach(teacher => {
    if (teacher.ws.readyState === WebSocket.OPEN) {
      teacher.ws.send(JSON.stringify({
        type: 'device-list',
        devices
      }))
    }
  })
}

// REST API - Unified Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  if (!accounts[username] || accounts[username].password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const account = accounts[username]
  const sessionId = Math.random().toString(36).substr(2, 16)

  res.json({
    success: true,
    sessionId,
    username,
    role: account.role,
    message: 'Logged in successfully'
  })
})

// WebSocket connection handler
wss.on('connection', (ws) => {
  const clientId = Math.random().toString(36).substr(2, 9)
  let role = null
  let sessionId = null
  let username = null

  console.log(`Client connected: ${clientId}`)

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data)
      const { type, payload } = msg

      if (type === 'register-teacher') {
        role = 'teacher'
        username = payload.username || 'Teacher'
        clients.teachers.set(clientId, { ws, clientId, role: 'teacher', username })
        console.log(`Teacher registered: ${username} (${clientId})`)
        ws.send(JSON.stringify({ type: 'registered', clientId, role: 'teacher' }))
        broadcastDeviceList()
      } else if (type === 'register-student') {
        role = 'student'
        sessionId = payload.sessionId
        username = payload.username

        console.log(`[Student Registration] sessionId=${sessionId}, username=${username}`)

        if (!sessionId || !username) {
          console.log(`[ERROR] Invalid student registration - missing sessionId or username`)
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid session' }))
          return
        }

        const deviceId = `DEV-${username}-${Date.now()}`
        clients.students.set(deviceId, {
          ws, clientId, sessionId, username, deviceId, role: 'student',
          webcamAllowed: false, connectedAt: new Date().toISOString()
        })
        clients.sessionToDevice.set(sessionId, deviceId)

        console.log(`Student registered: ${username} -> ${deviceId} (clientId: ${clientId})`)
        ws.send(JSON.stringify({
          type: 'registered', clientId: deviceId, role: 'student', deviceId, username
        }))
        broadcastDeviceList()
      } else if (type === 'offer') {
        const { targetId } = msg
        
        // Check if target is a student
        if (clients.students.has(targetId)) {
          const student = clients.students.get(targetId)
          if (student.ws.readyState === WebSocket.OPEN) {
            console.log(`[Offer] Teacher ${clientId} sending offer to student ${targetId}`)
            student.ws.send(JSON.stringify({ type: 'offer', fromId: clientId, payload }))
          }
        } 
        // Check if target is a teacher (student sending offer)
        else if (clients.teachers.has(targetId)) {
          const teacher = clients.teachers.get(targetId)
          if (teacher.ws.readyState === WebSocket.OPEN) {
            // Get device ID for this student if possible
            const deviceId = clients.sessionToDevice.get(sessionId) || clientId
            console.log(`[Offer] Student ${username} (${deviceId}) sending offer to teacher ${targetId}`)
            teacher.ws.send(JSON.stringify({ type: 'offer', fromId: deviceId, payload }))
          }
        }
        else {
          console.log(`[WARN] Offer target not found: ${targetId}`)
        }
      } else if (type === 'answer') {
        const { targetId } = msg
        
        // Determine sender info
        let fromId = clientId
        if (role === 'student' && sessionId) {
          fromId = clients.sessionToDevice.get(sessionId) || clientId
        }
        
        console.log(`[Answer] ${role} ${username} sending answer to targetId=${targetId}`)
        
        // Send to teacher
        if (clients.teachers.has(targetId)) {
          const teacher = clients.teachers.get(targetId)
          if (teacher.ws.readyState === WebSocket.OPEN) {
            console.log(`[Answer] Relaying answer to teacher ${targetId} from ${fromId}`)
            teacher.ws.send(JSON.stringify({ type: 'answer', fromId, payload }))
          }
        } 
        // Send to student
        else if (clients.students.has(targetId)) {
          const student = clients.students.get(targetId)
          if (student.ws.readyState === WebSocket.OPEN) {
            console.log(`[Answer] Relaying answer to student ${targetId} from ${fromId}`)
            student.ws.send(JSON.stringify({ type: 'answer', fromId, payload }))
          }
        }
        
        // Mark student as allowed if teacher is requesting
        if (role === 'student' && sessionId && fromId === clients.sessionToDevice.get(sessionId)) {
          const device = clients.sessionToDevice.get(sessionId)
          if (device && clients.students.has(device)) {
            const student = clients.students.get(device)
            student.webcamAllowed = true
            console.log(`[Answer] Marked student ${device} as webcamAllowed=true`)
            broadcastDeviceList()
          }
        }
      } else if (type === 'answer-reject') {
        const { targetId } = msg
        
        // Determine sender info
        let fromId = clientId
        if (role === 'student' && sessionId) {
          fromId = clients.sessionToDevice.get(sessionId) || clientId
        }
        
        console.log(`[Answer-Reject] ${role} ${username} rejecting request to targetId=${targetId}`)
        
        // Send to teacher
        if (clients.teachers.has(targetId)) {
          const teacher = clients.teachers.get(targetId)
          if (teacher.ws.readyState === WebSocket.OPEN) {
            teacher.ws.send(JSON.stringify({ type: 'answer-reject', fromId }))
          }
        } 
        // Send to student
        else if (clients.students.has(targetId)) {
          const student = clients.students.get(targetId)
          if (student.ws.readyState === WebSocket.OPEN) {
            student.ws.send(JSON.stringify({ type: 'answer-reject', fromId }))
          }
        }
      } else if (type === 'ice-candidate') {
        const { targetId } = msg
        
        // Determine sender info
        let fromId = clientId
        if (role === 'student' && sessionId) {
          fromId = clients.sessionToDevice.get(sessionId) || clientId
        }
        
        // Send to student
        if (clients.students.has(targetId)) {
          const target = clients.students.get(targetId)
          if (target && target.ws.readyState === WebSocket.OPEN) {
            target.ws.send(JSON.stringify({ type: 'ice-candidate', fromId, payload }))
          }
        } 
        // Send to teacher
        else if (clients.teachers.has(targetId)) {
          const target = clients.teachers.get(targetId)
          if (target && target.ws.readyState === WebSocket.OPEN) {
            target.ws.send(JSON.stringify({ type: 'ice-candidate', fromId, payload }))
          }
        }
      }
    } catch (e) {
      console.error('Message error:', e)
    }
  })

  ws.on('close', () => {
    if (role === 'teacher') {
      clients.teachers.delete(clientId)
      console.log(`Teacher disconnected`)
    } else if (role === 'student' && sessionId) {
      const deviceId = clients.sessionToDevice.get(sessionId)
      if (deviceId) {
        clients.students.delete(deviceId)
        clients.sessionToDevice.delete(sessionId)
        console.log(`Student disconnected: ${sessionId} -> ${deviceId}`)
      } else {
        console.log(`Student disconnected (no device mapping): ${sessionId}`)
      }
      broadcastDeviceList()
    }
  })
})

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'login.html')))
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')))
app.get('/teacher-dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'teacher-dashboard.html')))
// Legacy routes for backward compatibility
app.get('/concept.html', (req, res) => res.sendFile(path.join(__dirname, 'teacher-dashboard.html')))
app.get('/student.html', (req, res) => res.sendFile(path.join(__dirname, 'student.html')))

app.get('/api/devices', (req, res) => {
  const devices = Array.from(clients.students.values()).map(s => ({
    id: s.deviceId,
    name: s.username,
    status: 'active',
    webcamAllowed: s.webcamAllowed || false,
    connectedAt: s.connectedAt
  }))
  res.json(devices)
})

// Start server
const HOST = process.env.HOST || '0.0.0.0'
server.listen(PORT, HOST, () => {
  // Print helpful access URLs including LAN IPs so students can connect
  const nets = os.networkInterfaces()
  const addresses = []
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address)
      }
    }
  }

  console.log('\n=== CLS Monitor Server ===')
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Port: ${PORT}`)
  console.log(`\nAccess URLs:`)
  console.log(`  Local: http://localhost:${PORT}/`)
  console.log(`  Teacher Dashboard: http://localhost:${PORT}/teacher-dashboard.html`)
  console.log(`  Student Device: http://localhost:${PORT}/student.html`)
  console.log(`  API Devices: http://localhost:${PORT}/api/devices`)
  console.log(`  API Login: POST http://localhost:${PORT}/api/auth/login`)
  if (addresses.length) {
    console.log(`\n  Remote Access (LAN):`)
    addresses.forEach(a => {
      console.log(`    http://${a}:${PORT}/`)
      console.log(`    http://${a}:${PORT}/teacher-dashboard.html`)
      console.log(`    http://${a}:${PORT}/student.html`)
    })
  } else {
    console.log('\nNo LAN IP detected; use localhost or check network')
  }
  console.log('\n=== Firewall Configuration ===')
  console.log(`If students cannot reach the server, open Windows Firewall for TCP port ${PORT}:`)
  console.log(`PowerShell (admin): New-NetFirewallRule -DisplayName 'CLS Monitor ${PORT}' -Direction Inbound -LocalPort ${PORT} -Protocol TCP -Action Allow`)
  console.log('\n=== Test Credentials ===')
  console.log('Teacher: username=teacher_01, password=password123')
  console.log('Student: username=student_01, password=password123')
  console.log('\n=== WebSocket Details ===')
  console.log('WebSocket protocol: ws:// (or wss:// over HTTPS)')
  console.log('Automatically detects HTTPS and uses secure WebSocket\n')
})
