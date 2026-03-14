import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.sqlite');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nim TEXT UNIQUE,
    prodi TEXT,
    angkatan TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'mahasiswa'
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    date TEXT,
    time TEXT,
    location TEXT,
    material_url TEXT
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    activity_id INTEGER,
    attendance TEXT DEFAULT '0',
    score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Belum Lulus',
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(activity_id) REFERENCES activities(id)
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Admin if not exists
const adminEmail = 'admin@example.com';
const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Administrator', adminEmail, hashedPassword, 'admin');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Configure Multer for file uploads
  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  const upload = multer({ storage });

  app.use('/uploads', express.static(uploadDir));

  // --- Auth Routes ---
  app.post('/api/auth/register', (req, res) => {
    const { name, nim, prodi, angkatan, email, phone, password } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      db.prepare('INSERT INTO users (name, nim, prodi, angkatan, email, phone, password) VALUES (?, ?, ?, ?, ?, ?, ?)').run(name, nim, prodi, angkatan, email, phone, hashedPassword);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  // Middleware for Auth
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  };

  // --- Admin Routes ---
  app.get('/api/admin/stats', authenticate, isAdmin, (req, res) => {
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'mahasiswa'").get() as any;
    const totalParticipants = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM registrations').get() as any;
    const totalPassed = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE status = 'Lulus'").get() as any;
    const totalAnnouncements = db.prepare('SELECT COUNT(*) as count FROM announcements').get() as any;
    res.json({
      totalStudents: totalStudents.count,
      totalParticipants: totalParticipants.count,
      totalPassed: totalPassed.count,
      totalAnnouncements: totalAnnouncements.count
    });
  });

  app.get('/api/admin/activities', authenticate, isAdmin, (req, res) => {
    const activities = db.prepare('SELECT * FROM activities').all();
    res.json(activities);
  });

  app.post('/api/admin/activities', authenticate, isAdmin, (req, res) => {
    const { name, description, date, time, location, material_url } = req.body;
    try {
      db.prepare('INSERT INTO activities (name, description, date, time, location, material_url) VALUES (?, ?, ?, ?, ?, ?)').run(name, description, date, time, location, material_url);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/admin/activities/:id', authenticate, isAdmin, (req, res) => {
    const { name, description, date, time, location, material_url } = req.body;
    try {
      db.prepare('UPDATE activities SET name = ?, description = ?, date = ?, time = ?, location = ?, material_url = ? WHERE id = ?').run(name, description, date, time, location, material_url, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/admin/upload-material', authenticate, isAdmin, upload.single('file'), (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const url = `/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Internal server error during upload' });
    }
  });

  app.delete('/api/admin/activities/:id', authenticate, isAdmin, (req, res) => {
    const id = req.params.id;
    try {
      const deleteRegs = db.prepare('DELETE FROM registrations WHERE activity_id = ?');
      const deleteActivity = db.prepare('DELETE FROM activities WHERE id = ?');
      
      const transaction = db.transaction((activityId) => {
        deleteRegs.run(activityId);
        deleteActivity.run(activityId);
      });

      transaction(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete activity error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/participants', authenticate, isAdmin, (req, res) => {
    const participants = db.prepare(`
      SELECT r.*, u.name as user_name, u.nim, u.prodi, u.angkatan, u.email, a.name as activity_name 
      FROM registrations r 
      JOIN users u ON r.user_id = u.id 
      JOIN activities a ON r.activity_id = a.id
    `).all();
    res.json(participants);
  });

  app.delete('/api/admin/participants/:id', authenticate, isAdmin, (req, res) => {
    db.prepare('DELETE FROM registrations WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.put('/api/admin/participants/:id', authenticate, isAdmin, (req, res) => {
    const { attendance, score, status } = req.body;
    db.prepare('UPDATE registrations SET attendance = ?, score = ?, status = ? WHERE id = ?').run(attendance, score, status, req.params.id);
    res.json({ success: true });
  });

  app.get('/api/admin/evaluations', authenticate, isAdmin, (req, res) => {
    const evaluations = db.prepare(`
      SELECT 
        u.id as user_id, 
        u.name as user_name, 
        u.nim, 
        u.prodi,
        COUNT(CASE WHEN r.attendance = 'Hadir' THEN 1 END) as hadir_count,
        MAX(r.score) as score,
        MAX(r.status) as status
      FROM users u 
      JOIN registrations r ON u.id = r.user_id 
      GROUP BY u.id
    `).all();
    res.json(evaluations);
  });

  app.put('/api/admin/update-evaluation/:userId', authenticate, isAdmin, (req, res) => {
    const { score, status } = req.body;
    const userId = req.params.userId;
    try {
      db.prepare('UPDATE registrations SET score = ?, status = ? WHERE user_id = ?').run(score, status, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // --- Announcement Routes ---
  app.get('/api/admin/announcements', authenticate, isAdmin, (req, res) => {
    const announcements = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all();
    res.json(announcements);
  });

  app.post('/api/admin/announcements', authenticate, isAdmin, (req, res) => {
    const { title, content } = req.body;
    db.prepare('INSERT INTO announcements (title, content) VALUES (?, ?)').run(title, content);
    res.json({ success: true });
  });

  app.put('/api/admin/announcements/:id', authenticate, isAdmin, (req, res) => {
    const { title, content } = req.body;
    db.prepare('UPDATE announcements SET title = ?, content = ? WHERE id = ?').run(title, content, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/admin/announcements/:id', authenticate, isAdmin, (req, res) => {
    db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // --- Certificate Management ---
  app.get('/api/admin/certificates', authenticate, isAdmin, (req, res) => {
    const certificates = db.prepare(`
      SELECT r.*, u.name as user_name, u.nim, u.prodi, a.name as activity_name, a.date
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN activities a ON r.activity_id = a.id
      WHERE r.status = 'Lulus'
    `).all();
    res.json(certificates);
  });

  // --- Mahasiswa Routes ---
  app.get('/api/student/announcements', authenticate, (req, res) => {
    const announcements = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all();
    res.json(announcements);
  });

  app.get('/api/student/activities', authenticate, (req: any, res) => {
    const activities = db.prepare('SELECT * FROM activities').all();
    res.json(activities);
  });

  app.get('/api/student/my-registrations', authenticate, (req: any, res) => {
    const registrations = db.prepare(`
      SELECT r.*, a.name as activity_name, a.date, a.time, a.location, a.description, a.material_url
      FROM registrations r
      JOIN activities a ON r.activity_id = a.id
      WHERE r.user_id = ?
    `).all(req.user.id);
    res.json(registrations);
  });

  app.delete('/api/student/registrations/:id', authenticate, (req: any, res) => {
    try {
      const result = db.prepare('DELETE FROM registrations WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
      if (result.changes > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Pendaftaran tidak ditemukan' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/student/registrations/:id', authenticate, (req: any, res) => {
    const { activity_id } = req.body;
    try {
      // Check if already registered for the new activity
      const existing = db.prepare('SELECT * FROM registrations WHERE user_id = ? AND activity_id = ? AND id != ?').get(req.user.id, activity_id, req.params.id);
      if (existing) {
        return res.status(400).json({ error: 'Anda sudah terdaftar di kegiatan tersebut' });
      }

      const result = db.prepare('UPDATE registrations SET activity_id = ? WHERE id = ? AND user_id = ?').run(activity_id, req.params.id, req.user.id);
      if (result.changes > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Pendaftaran tidak ditemukan' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/student/register-activity', authenticate, (req: any, res) => {
    console.log(`Registration attempt: User ${req.user.id} for Activity ${req.body.activity_id}`);
    try {
      const activity_id = parseInt(req.body.activity_id);
      const user_id = req.user.id;

      if (!activity_id) {
        console.log('Registration failed: Invalid Activity ID');
        return res.status(400).json({ error: 'ID Kegiatan tidak valid' });
      }

      if (!user_id) {
        console.log('Registration failed: Invalid User ID');
        return res.status(401).json({ error: 'Sesi tidak valid, silakan login kembali' });
      }

      const existing = db.prepare('SELECT * FROM registrations WHERE user_id = ? AND activity_id = ?').get(user_id, activity_id);
      if (existing) {
        console.log('Registration failed: Already registered');
        return res.status(400).json({ error: 'Anda sudah terdaftar di kegiatan ini' });
      }

      db.prepare('INSERT INTO registrations (user_id, activity_id, status) VALUES (?, ?, ?)').run(user_id, activity_id, 'Belum Lulus');
      console.log('Registration successful');
      res.json({ success: true });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Terjadi kesalahan pada server saat mendaftar' });
    }
  });

  app.get('/api/student/profile', authenticate, (req: any, res) => {
    const user = db.prepare('SELECT id, name, nim, prodi, angkatan, email, phone FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  });

  app.get('/api/student/my-evaluation', authenticate, (req: any, res) => {
    const evaluation = db.prepare(`
      SELECT 
        u.name as user_name, 
        u.nim, 
        COUNT(CASE WHEN r.attendance = 'Hadir' THEN 1 END) as hadir_count,
        MAX(r.score) as score,
        MAX(r.status) as status
      FROM users u 
      JOIN registrations r ON u.id = r.user_id 
      WHERE u.id = ?
      GROUP BY u.id
    `).get(req.user.id);
    res.json(evaluation || null);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
