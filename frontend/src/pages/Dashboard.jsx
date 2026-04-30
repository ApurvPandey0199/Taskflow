import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Layout, CheckCircle2, Clock, AlertCircle, Plus, Users, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: '#6366f1' });
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setIsModalOpen(false);
      setNewProject({ name: '', description: '', color: '#6366f1' });
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create project');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const stats = [
    { label: 'Total Projects', value: data?.stats?.total_projects || 0, icon: Layout, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'My Tasks', value: data?.stats?.my_tasks || 0, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Completed', value: data?.stats?.completed_tasks || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Overdue', value: data?.stats?.overdue_tasks || 0, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Create New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Marketing Campaign"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                  placeholder="What is this project about?"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Color</label>
                <div className="flex gap-3">
                  {['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewProject({ ...newProject, color: c })}
                      className={`w-8 h-8 rounded-full transition ${newProject.color === c ? 'ring-4 ring-slate-200 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-200 mt-4"
              >
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Active Tasks
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {data?.myTasks?.length > 0 ? data.myTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-slate-50 transition duration-150 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-10 rounded-full" style={{ backgroundColor: task.project_color }}></div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition">{task.title}</h3>
                      <p className="text-sm text-slate-500">{task.project_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'urgent' ? 'bg-rose-50 text-rose-600' :
                      task.priority === 'high' ? 'bg-orange-50 text-orange-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {task.priority}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition" />
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-slate-400">No active tasks assigned</div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Recent Activity
            </h2>
            <div className="space-y-6">
              {data?.recentActivity?.length > 0 ? data.recentActivity.map((act) => (
                <div key={act.id} className="relative pl-6 pb-6 border-l border-slate-100 last:pb-0">
                  <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-indigo-500"></div>
                  <p className="text-sm text-slate-700 font-medium">{act.title}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {act.status} in <span className="font-medium" style={{ color: act.project_color }}>{act.project_name}</span>
                  </p>
                </div>
              )) : (
                <p className="text-slate-400 text-sm text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
