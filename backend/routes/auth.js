const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

const { Octokit } = require('octokit');

router.post('/signup', validate([
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('githubToken').optional().notEmpty().withMessage('GitHub token cannot be empty')
]), (req, res) => {
  const { name, email, password, githubToken } = req.body;
  
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const id = uuidv4();
  const hashed = bcrypt.hashSync(password, 10);
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444'];
  const avatar = `${initials}|${colors[Math.floor(Math.random() * colors.length)]}`;

  db.prepare('INSERT INTO users (id, name, email, password, avatar, github_token) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, name, email.toLowerCase(), hashed, avatar, githubToken || null);

  const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, name, email: email.toLowerCase(), avatar, githubToken } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'User not found with this email' });
  if (!bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Incorrect password' });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, githubToken: user.github_token } });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', authenticate, validate([
  body('name').notEmpty().withMessage('Name is required'),
  body('githubToken').optional().notEmpty().withMessage('GitHub token cannot be empty')
]), (req, res) => {
  const { name, githubToken } = req.body;
  
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const user = db.prepare('SELECT avatar FROM users WHERE id = ?').get(req.user.id);
  const color = user.avatar.split('|')[1];
  const newAvatar = `${initials}|${color}`;

  db.prepare('UPDATE users SET name = ?, github_token = ?, avatar = ? WHERE id = ?')
    .run(name, githubToken || null, newAvatar, req.user.id);

  res.json({ message: 'Profile updated' });
});

router.put('/password', authenticate, validate([
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
]), (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(401).json({ error: 'Incorrect current password' });
  }

  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user.id);

  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
