const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { authenticate, requireProjectRole } = require('../middleware/auth');

const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Get all projects for user
router.get('/', authenticate, (req, res) => {
  const projects = db.prepare(`
    SELECT p.*, u.name as owner_name, u.avatar as owner_avatar,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as done_count,
      (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
      pm.role as my_role
    FROM projects p
    JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
    JOIN users u ON u.id = p.owner_id
    ORDER BY p.created_at DESC
  `).all(req.user.id);
  res.json({ projects });
});

// Create project
router.post('/', authenticate, validate([
  body('name').notEmpty().withMessage('Project name is required'),
  body('color').optional().isHexColor().withMessage('Invalid color format')
]), (req, res) => {
  const { name, description, color } = req.body;

  const id = uuidv4();
  const memberId = uuidv4();

  const createProject = db.transaction(() => {
    db.prepare('INSERT INTO projects (id, name, description, color, owner_id) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, description || '', color || '#6366f1', req.user.id);
    db.prepare('INSERT INTO project_members (id, project_id, user_id, role) VALUES (?, ?, ?, ?)')
      .run(memberId, id, req.user.id, 'admin');
  });
  createProject();

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.status(201).json({ project });
});

// Get single project
router.get('/:projectId', authenticate, requireProjectRole(), (req, res) => {
  const project = db.prepare(`
    SELECT p.*, u.name as owner_name, u.avatar as owner_avatar,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as done_count
    FROM projects p JOIN users u ON u.id = p.owner_id WHERE p.id = ?
  `).get(req.params.projectId);

  const members = db.prepare(`
    SELECT u.id, u.name, u.email, u.avatar, pm.role, pm.joined_at
    FROM project_members pm JOIN users u ON u.id = pm.user_id
    WHERE pm.project_id = ? ORDER BY pm.joined_at
  `).all(req.params.projectId);

  res.json({ project, members });
});

// Update project (admin only)
router.put('/:projectId', authenticate, requireProjectRole(['admin']), (req, res) => {
  const { name, description, color, status } = req.body;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.projectId);
  if (project.owner_id !== req.user.id)
    return res.status(403).json({ error: 'Only owner can update project' });

  db.prepare('UPDATE projects SET name=?, description=?, color=?, status=? WHERE id=?')
    .run(name || project.name, description ?? project.description, color || project.color, status || project.status, req.params.projectId);

  res.json({ project: db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.projectId) });
});

// Delete project (owner only)
router.delete('/:projectId', authenticate, requireProjectRole(['admin']), (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.projectId);
  if (project.owner_id !== req.user.id)
    return res.status(403).json({ error: 'Only owner can delete project' });
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.projectId);
  res.json({ message: 'Project deleted' });
});

// Add member
router.post('/:projectId/members', authenticate, requireProjectRole(['admin']), (req, res) => {
  const { email, role } = req.body;
  const user = db.prepare('SELECT id, name, email, avatar FROM users WHERE email = ?').get(email?.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found with that email' });

  const existing = db.prepare('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?')
    .get(req.params.projectId, user.id);
  if (existing) return res.status(409).json({ error: 'User already a member' });

  db.prepare('INSERT INTO project_members (id, project_id, user_id, role) VALUES (?, ?, ?, ?)')
    .run(uuidv4(), req.params.projectId, user.id, role || 'member');

  res.status(201).json({ member: { ...user, role: role || 'member' } });
});

// Remove member
router.delete('/:projectId/members/:userId', authenticate, requireProjectRole(['admin']), (req, res) => {
  const project = db.prepare('SELECT owner_id FROM projects WHERE id = ?').get(req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  
  if (req.params.userId === project.owner_id)
    return res.status(400).json({ error: 'Cannot remove project owner' });
  db.prepare('DELETE FROM project_members WHERE project_id = ? AND user_id = ?')
    .run(req.params.projectId, req.params.userId);
  res.json({ message: 'Member removed' });
});

// Update member role
router.put('/:projectId/members/:userId', authenticate, requireProjectRole(['admin']), (req, res) => {
  const { role } = req.body;
  if (!['admin', 'member'].includes(role))
    return res.status(400).json({ error: 'Invalid role' });
  db.prepare('UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?')
    .run(role, req.params.projectId, req.params.userId);
  res.json({ message: 'Role updated' });
});

module.exports = router;