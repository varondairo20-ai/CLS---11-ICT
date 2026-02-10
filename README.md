# CLS Monitor — WebRTC Screen Sharing

A real-time classroom screen-sharing system built with HTML5, WebRTC, and Node.js signaling.

## Quick Start

### Prerequisites

1. **MySQL Server** — See [DB_SETUP.md](./DB_SETUP.md) for installation
2. **Node.js 18+** — [Download](https://nodejs.org/)

### Local Development (2 browsers)

1. **Login page** (`login.html`)
   - Register new users (username, password, role)
   - Credentials stored securely in MySQL with bcrypt hashing
   - Choose "Teacher" or "Student" role

2. **Teacher Dashboard** (`teacher-dashboard.html`)
   - Connect automatically to signaling server
   - View registered student devices
   - Click "Request Screen" to initiate a screen-sharing request
   - Watch incoming video in fullscreen viewer

3. **Student Page** (`student.html`)
   - Connect automatically to signaling server
   - When teacher requests, a modal appears asking for approval
   - Click "Approve & Share" to grant access
   - Teacher will see your display in real-time

### Files

- `login.html` — Role selector (Teacher / Student)
- `teacher-dashboard.html` — Teacher control panel
- `student.html` — Student client with screen-sharing capability
- `styles.css` — Shared dark-theme styling
- Signaling server at `wss://cls-11-ict.onrender.com` (auto-configured)

### Features

- **Bidirectional WebRTC** — Offer/Answer/ICE exchange
- **Status Indicators** — Real-time connection badges
- **Exponential Backoff** — Automatic reconnection with increasing delays
- **Toast Notifications** — Error/success messages
- **Display Media API** — getDisplayMedia for screen capture

### Deployment

Ensure a Node.js signaling server is running that accepts:
- `register-teacher` messages
- `register-student` messages  
- Relay of `offer`, `answer`, `ice-candidate` messages

The default signaling endpoint is configured in each HTML file's `<meta name="signal-server">` tag.

### Browser Compatibility

Requires:
- WebRTC support (Chrome, Firefox, Safari, Edge)
- Display Media API (Chrome 72+, Firefox 66+, Safari 13+)

---

Built for real-time classroom monitoring and student screen sharing.

