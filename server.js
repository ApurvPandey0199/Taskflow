require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/projects/:projectId/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Serve frontend in production
const frontendPath = path.join(__dirname, '../frontend/dist');
const fs = require('fs');
console.log('Checking frontend path:', frontendPath);
if (fs.existsSync(frontendPath)) {
  console.log('Frontend dist found! Serving static files.');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
} else {
  console.log('Frontend dist NOT found at:', frontendPath);
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => console.log(`TaskFlow API running on port ${PORT}`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port or kill the process.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
