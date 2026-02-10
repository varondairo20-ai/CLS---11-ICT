# Database Setup Guide

## Prerequisites

1. **MySQL Server** must be installed and running on your system
   - On Windows: [Download MySQL](https://dev.mysql.com/downloads/mysql/)
   - Or use Docker: `docker run -d -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mysql:8`

2. **Verify MySQL is running:**
   ```bash
   mysql -u root -p
   # Enter password: root
   ```

## Step 1: Create the Database

Connect to MySQL and run:

```bash
mysql -u root -p
```

Then paste this:

```sql
CREATE DATABASE IF NOT EXISTS cls_monitor;
USE cls_monitor;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('teacher', 'student') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Step 2: Install Dependencies

```powershell
npm install
```

This installs `mysql2`, `bcryptjs`, and `dotenv`.

## Step 3: Configure .env

The `.env` file is already created with:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=cls_monitor
PORT=3000
```

**Change these if your MySQL credentials differ.**

## Step 4: Restart the Server

```powershell
node server.js
```

The server will:
- Connect to MySQL
- Auto-create tables (if not exists)
- Start listening on http://localhost:3000

## Step 5: Register Users

1. Open http://localhost:3000 in your browser
2. Enter a new username, password, and role (teacher or student)
3. Click Login
4. The user will be saved to the database and you'll be logged in

## Troubleshooting

**"Error: Access denied for user 'root'@'localhost'"**
- Check your MySQL root password in `.env`
- Verify MySQL is running

**"Error: ECONNREFUSED"**
- MySQL is not running
- Start MySQL from Services or run: `mysql.server start` (macOS) or `net start MySQL` (Windows)

**"Duplicate entry"**
- Username already exists; use a different username

## Testing

After setup, open two browser windows:
- Window 1: Login as Teacher
- Window 2: Login as Student
- Test screen/webcam sharing

Done!
