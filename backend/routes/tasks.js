const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { authenticate, requireProjectRole } = require('../middleware/auth');

const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router({ mergeParams: true });

// Get tasks for project
router.get('/', authenticate, requireProjectRole(), (req, res) => {
  const { status, priority, assignee } = req.query;
  let query = `
    SELECT t.*, 
      u.name as assignee_name, u.avatar as assignee_avatar,
      c.name as creator_name
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assignee_id
    JOIN users c ON c.id = t.creator_id
    WHERE t.project_id = ?
  `;
  const params = [req.params.projectId];
  if (status) { query += ' AND t.status = ?'; params.push(status); }
  if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
  if (assignee) { query += ' AND t.assignee_id = ?'; params.push(assignee); }
  query += ' ORDER BY t.created_at DESC';
  const tasks = db.prepare(query).all(...params);
  res.json({ tasks });
});

// Create task
router.post('/', authenticate, requireProjectRole(), validate([
  body('title').notEmpty().withMessage('Task title is required'),
  body('status').optional().isIn(['todo', 'in_progress', 'review', 'done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
]), (req, res) => {
  const { title, description, status, priority, assignee_id, due_date } = req.body;

  if (assignee_id) {
    const member = db.prepare('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?')
      .get(req.params.projectId, assignee_id);
    if (!member) return res.status(400).json({ error: 'Assignee must be a project member' });
  }

  const id = uuidv4();
  db.prepare(`INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, creator_id, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, title, description || '', status || 'todo', priority || 'medium',
    req.params.projectId, assignee_id || null, req.user.id, due_date || null);

  const task = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar, c.name as creator_name
    FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id JOIN users c ON c.id = t.creator_id
    WHERE t.id = ?`).get(id);
  res.status(201).json({ task });
});

// Update task
router.put('/:taskId', authenticate, requireProjectRole(), (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?')
    .get(req.params.taskId, req.params.projectId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const member = db.prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
    .get(req.params.projectId, req.user.id);
  const project = db.prepare('SELECT owner_id FROM projects WHERE id = ?').get(req.params.projectId);
  const isAdmin = project.owner_id === req.user.id || member?.role === 'admin';
  const isCreator = task.creator_id === req.user.id;
  const isAssignee = task.assignee_id === req.user.id;

  if (!isAdmin && !isCreator && !isAssignee)
    return res.status(403).json({ error: 'Cannot edit this task' });

  const { title, description, status, priority, assignee_id, due_date } = req.body;
  db.prepare(`UPDATE tasks SET title=?, description=?, status=?, priority=?, assignee_id=?, due_date=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(title ?? task.title, description ?? task.description, status ?? task.status,
      priority ?? task.priority, assignee_id !== undefined ? assignee_id : task.assignee_id,
      due_date !== undefined ? due_date : task.due_date, req.params.taskId);

  const updated = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar, c.name as creator_name
    FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id JOIN users c ON c.id = t.creator_id
    WHERE t.id = ?`).get(req.params.taskId);
  res.json({ task: updated });
});

// Delete task
router.delete('/:taskId', authenticate, requireProjectRole(), (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?')
    .get(req.params.taskId, req.params.projectId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const member = db.prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
    .get(req.params.projectId, req.user.id);
  const project = db.prepare('SELECT owner_id FROM projects WHERE id = ?').get(req.params.projectId);
  const isAdmin = project.owner_id === req.user.id || member?.role === 'admin';
  if (!isAdmin && task.creator_id !== req.user.id)
    return res.status(403).json({ error: 'Cannot delete this task' });

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.taskId);
  res.json({ message: 'Task deleted' });
});

// Comments
router.get('/:taskId/comments', authenticate, requireProjectRole(), (req, res) => {
  const comments = db.prepare(`
    SELECT c.*, u.name, u.avatar FROM comments c JOIN users u ON u.id = c.user_id
    WHERE c.task_id = ? ORDER BY c.created_at ASC
  `).all(req.params.taskId);
  res.json({ comments });
});

router.post('/:taskId/comments', authenticate, requireProjectRole(), (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });
  const id = uuidv4();
  db.prepare('INSERT INTO comments (id, task_id, user_id, content) VALUES (?, ?, ?, ?)')
    .run(id, req.params.taskId, req.user.id, content.trim());
  const comment = db.prepare(`
    SELECT c.*, u.name, u.avatar FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?
  `).get(id);
  res.status(201).json({ comment });
});

module.exports = router;