const express = require('express');
const db = require('../models/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const userId = req.user.id;

  // Tasks assigned to user
  const myTasks = db.prepare(`
    SELECT t.*, p.name as project_name, p.color as project_color,
      u.name as assignee_name, u.avatar as assignee_avatar
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    LEFT JOIN users u ON u.id = t.assignee_id
    JOIN project_members pm ON pm.project_id = t.project_id AND pm.user_id = ?
    WHERE t.assignee_id = ? AND t.status != 'done'
    ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
    LIMIT 10
  `).all(userId, userId);

  // Overdue tasks
  const overdueTasks = db.prepare(`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    JOIN project_members pm ON pm.project_id = t.project_id AND pm.user_id = ?
    WHERE t.due_date < date('now') AND t.status != 'done' AND t.assignee_id = ?
    ORDER BY t.due_date ASC
  `).all(userId, userId);

  // Stats
  const stats = db.prepare(`
    SELECT
      COUNT(DISTINCT p.id) as total_projects,
      COUNT(DISTINCT CASE WHEN t.assignee_id = ? THEN t.id END) as my_tasks,
      COUNT(DISTINCT CASE WHEN t.assignee_id = ? AND t.status = 'done' THEN t.id END) as completed_tasks,
      COUNT(DISTINCT CASE WHEN t.assignee_id = ? AND t.due_date < date('now') AND t.status != 'done' THEN t.id END) as overdue_tasks
    FROM project_members pm
    JOIN projects p ON p.id = pm.project_id
    LEFT JOIN tasks t ON t.project_id = p.id
    WHERE pm.user_id = ?
  `).get(userId, userId, userId, userId);

  // Recent activity (recent tasks updated across user's projects)
  const recentActivity = db.prepare(`
    SELECT t.id, t.title, t.status, t.updated_at, p.name as project_name, p.color as project_color
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    JOIN project_members pm ON pm.project_id = t.project_id AND pm.user_id = ?
    ORDER BY t.updated_at DESC LIMIT 8
  `).all(userId);

  // Task status distribution for user's projects
  const taskDistribution = db.prepare(`
    SELECT t.status, COUNT(*) as count
    FROM tasks t
    JOIN project_members pm ON pm.project_id = t.project_id AND pm.user_id = ?
    GROUP BY t.status
  `).all(userId);

  res.json({ stats, myTasks, overdueTasks, recentActivity, taskDistribution });
});

module.exports = router;