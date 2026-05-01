const express = require('express');
const db = require('../models/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const { Octokit } = require('octokit');

// Get dashboard stats and recent data
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.id;
  
  // Basic stats
  const stats = {
    total_projects: db.prepare('SELECT COUNT(*) as count FROM project_members WHERE user_id = ?').get(userId).count,
    my_tasks: db.prepare('SELECT COUNT(*) as count FROM tasks WHERE assignee_id = ? AND status != "done"').get(userId).count,
    completed_tasks: db.prepare('SELECT COUNT(*) as count FROM tasks WHERE assignee_id = ? AND status = "done"').get(userId).count,
    overdue_tasks: db.prepare('SELECT COUNT(*) as count FROM tasks WHERE assignee_id = ? AND status != "done" AND due_date < date("now")').get(userId).count
  };

  // Recent tasks
  const myTasks = db.prepare(`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE t.assignee_id = ? AND t.status != 'done'
    ORDER BY t.created_at DESC LIMIT 5
  `).all(userId);

  // GitHub Repos (Optional)
  const user = db.prepare('SELECT github_token FROM users WHERE id = ?').get(userId);
  if (user?.github_token) {
    try {
      const octokit = new Octokit({ auth: user.github_token });
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({ sort: 'updated', per_page: 3 });
      stats.total_projects += data.length;
    } catch (err) {
      console.error('GH Stats Error:', err.message);
    }
  }

  res.json({ stats, myTasks, recentActivity: [] });
});

module.exports = router;