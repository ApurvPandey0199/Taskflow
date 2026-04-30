const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post('/signup', validate([
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required')
]), (req, res) => {
  const { name, email, password } = req.body;
  
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const id = uuidv4();
  const hashed = bcrypt.hashSync(password, 10);
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444'];
  const avatar = `${initials}|${colors[Math.floor(Math.random() * colors.length)]}`;

  db.prepare('INSERT INTO users (id, name, email, password, avatar) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, email.toLowerCase(), hashed, avatar);

  const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, name, email: email.toLowerCase(), avatar } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'User not found with this email' });
  if (!bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Incorrect password' });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
