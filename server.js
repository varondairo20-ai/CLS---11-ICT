const express = require('express')
const WebSocket = require('ws')
const http = require('http')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.static(__dirname))
app.use(express.json())

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'cls_monitor',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Initialize database schema (run once)
async function initDB() {
  try {
    // First, create a connection without database to create the database
    const initPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    })
    
    const initConn = await initPool.getConnection()
    try {
      // Create database if not exists
      await initConn.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'cls_monitor'}`)
      console.log(`✅ Database ${process.env.DB_NAME || 'cls_monitor'} ready`)
    } finally {
      initConn.release()
      initPool.end()
    }
    
    // Now connect to the database and create tables
    const conn = await pool.getConnection()
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('teacher', 'student') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // Create sessions table with logout_time support
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          session_id VARCHAR(255) UNIQUE NOT NULL,
          login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          logout_time TIMESTAMP NULL DEFAULT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `)
      
      // Add logout_time column if it doesn't exist (for existing tables)
      try {
        await conn.execute(`ALTER TABLE sessions ADD COLUMN logout_time TIMESTAMP NULL DEFAULT NULL`)
      } catch (err) {
        if (err.code !== 'ER_DUP_FIELDNAME') throw err
        // Column already exists, that's fine
      }
      
      console.log('✅ Database schema initialized')

      // Insert demo accounts (skip if they already exist)
      const demoAccounts = [
        { username: 'teacher1', password: 'teacher123', role: 'teacher' },
        { username: 'teacher2', password: 'teacher123', role: 'teacher' },
        { username: 'student1', password: 'student123', role: 'student' },
        { username: 'student2', password: 'student123', role: 'student' }
      ]

      for (const account of demoAccounts) {
        try {
          const hashedPassword = await bcrypt.hash(account.password, 10)
          await conn.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [account.username, hashedPassword, account.role]
          )
        } catch (err) {
          if (err.code !== 'ER_DUP_ENTRY') {
            throw err
          }
          // Account already exists, skip
        }
      }
      console.log('✅ Demo accounts ready')
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error('DB init error:', err.message)
  }
}

initDB()

// Create HTTP server and WebSocket server
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Auth endpoints
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Missing fields' })
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const conn = await pool.getConnection()
    try {
      await conn.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [
        username, hashedPassword, role
      ])
      res.json({ success: true, message: 'Registration successful' })
    } finally {
      conn.release()
    }
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username already exists' })
    } else {
      res.status(500).json({ error: err.message })
    }
  }
})

app.post('/api/login', async (req, res) => {
  const { username, password, role } = req.body
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Missing fields' })
  }
  try {
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.execute('SELECT id, username, password, role FROM users WHERE username = ? AND role = ?', [
        username, role
      ])
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }
      const user = rows[0]
      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }
      // Create session
      const sessionId = 'sid-' + Math.random().toString(36).slice(2)
      await conn.execute('INSERT INTO sessions (user_id, session_id) VALUES (?, ?)', [
        user.id, sessionId
      ])
      res.json({ success: true, sessionId, username: user.username, role: user.role })
    } finally {
      conn.release()
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Logout endpoint - update session logout_time
app.post('/api/logout', async (req, res) => {
  const { sessionId } = req.body
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' })
  }
  try {
    const conn = await pool.getConnection()
    try {
      await conn.execute('UPDATE sessions SET logout_time = NOW() WHERE session_id = ?', [sessionId])
      res.json({ success: true })
    } finally {
      conn.release()
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get activity logs for all students
app.get('/api/logs', async (req, res) => {
  try {
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.execute(`
        SELECT users.username, sessions.login_time, sessions.logout_time 
        FROM sessions
        JOIN users ON sessions.user_id = users.id
        WHERE users.role = 'student'
        ORDER BY sessions.login_time DESC
        LIMIT 100
      `)
      res.json({ success: true, logs: rows })
    } finally {
      conn.release()
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Store connected clients
const clients = new Map()
const devices = new Map() // deviceId -> { id, name, role, clientId }
let clientCounter = 0

function broadcastDeviceList() {
  const deviceList = Array.from(devices.values()).filter(d => d.role === 'student')
  const msg = JSON.stringify({ type: 'device-list', devices: deviceList })
  
  // Send to all connected teachers
  clients.forEach((client) => {
    if (client.role === 'teacher' && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(msg)
    }
  })
}

wss.on('connection', (ws) => {
  const clientId = `client-${++clientCounter}`
  console.log(`[${clientId}] Connected. Total clients: ${clients.size + 1}`)

  let role = null
  let deviceId = null
  let username = null

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data)
      // Debug: log incoming message summary
      console.log(`[${clientId}] recv:`, { type: msg.type, targetId: msg.targetId || msg.payload?.targetId || (msg.payload && msg.payload.desc && 'offer-desc') })
      const { type, payload } = msg

      if (type === 'register-teacher') {
        role = 'teacher'
        username = payload?.username || 'Teacher'
        clients.set(clientId, { ws, role, clientId, username })
        console.log(`[${clientId}] Teacher registered: ${username}`)
        
        // Send registration confirmation and current device list
        ws.send(JSON.stringify({ type: 'registered', clientId, role: 'teacher' }))
        broadcastDeviceList()
      }
      else if (type === 'register-student') {
        role = 'student'
        username = payload?.username || 'Student'
        deviceId = `device-${clientCounter}`
        clients.set(clientId, { ws, role, clientId, username })
        devices.set(deviceId, { id: deviceId, name: username, role: 'student', clientId })
        console.log(`[${clientId}] Student registered: ${username} (${deviceId})`)
        
        // Send registration confirmation
        ws.send(JSON.stringify({ type: 'registered', clientId, deviceId, role: 'student' }))
        broadcastDeviceList()
      }
      else if (type === 'offer') {
        // Route offer from teacher to student
        const { targetId, payload: offerPayload } = msg
        const targetClient = Array.from(clients.values()).find(c => 
          devices.get(targetId)?.clientId === c.clientId
        )
        if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
          targetClient.ws.send(JSON.stringify({
            type: 'offer',
            fromId: clientId,
            payload: offerPayload
          }))
          console.log(`[${clientId}] Sent offer to ${targetId}`)
        }
      }
      else if (type === 'answer') {
        // Route answer from student to teacher
        const { targetId, payload: answerPayload } = msg
        const targetClient = clients.get(targetId)
        if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
          targetClient.ws.send(JSON.stringify({
            type: 'answer',
            fromId: deviceId || clientId,
            payload: answerPayload
          }))
          console.log(`[${clientId}] Sent answer to ${targetId}`)
        }
      }
      else if (type === 'answer-reject') {
        // Route rejection from student to teacher
        const { targetId } = msg
        const targetClient = clients.get(targetId)
        if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
          targetClient.ws.send(JSON.stringify({
            type: 'answer-reject',
            fromId: deviceId || clientId
          }))
          console.log(`[${clientId}] Sent rejection to ${targetId}`)
        }
      }
      else if (type === 'ice-candidate') {
        // Route ICE candidate
        const { targetId, payload: candPayload } = msg
        const targetClient = clients.get(targetId) || 
          Array.from(clients.values()).find(c => devices.get(targetId)?.clientId === c.clientId)
        if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
          targetClient.ws.send(JSON.stringify({
            type: 'ice-candidate',
            fromId: deviceId || clientId,
            payload: candPayload
          }))
        }
      }
      else if (type === 'broadcast') {
        // Broadcast text message to all student devices
        const { text } = payload || {}
        if (!text) return
        devices.forEach(d => {
          const c = clients.get(d.clientId)
          if (c && c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(JSON.stringify({ type: 'broadcast', payload: { text, from: username || clientId } }))
          }
        })
        // Optionally ack to sender
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'broadcast-sent' }))
      }
      else if (type === 'direct-message') {
        // Send a direct text message to a specific deviceId
        const { targetId, text } = msg
        if (!targetId || !text) return
        const targetDevice = devices.get(targetId)
        if (targetDevice) {
          const c = clients.get(targetDevice.clientId)
          if (c && c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(JSON.stringify({ type: 'direct-message', payload: { text, from: username || clientId } }))
            if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'direct-sent', targetId }))
          }
        }
      }
      else {
        console.debug(`[${clientId}] Unknown message type: ${type}`)
      }
    } catch (err) {
      console.error(`[${clientId}] Error processing message:`, err.message)
    }
  })

  ws.on('close', () => {
    clients.delete(clientId)
    if (deviceId) {
      devices.delete(deviceId)
      broadcastDeviceList()
    }
    console.log(`[${clientId}] Disconnected. Total clients: ${clients.size}`)
  })

  ws.on('error', (err) => {
    console.error(`[${clientId}] WebSocket error:`, err.message)
  })
})

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login.html')
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ CLS Monitor Server running on http://localhost:${PORT}`)
  console.log(`📡 WebSocket signaling ready at ws://localhost:${PORT}`)
  console.log(`🌐 Open http://localhost:${PORT} in your browser\n`)
})
