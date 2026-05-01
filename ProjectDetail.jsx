import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Layout, Users, Plus, Settings, 
  Trash2, UserPlus, CheckCircle2, 
  Clock, AlertCircle, MoreVertical, X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user: currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', assignee_id: '' });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`)
      ]);
      setProject(projRes.data.project);
      setMembers(projRes.data.members);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      console.error(err);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, navigate]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${projectId}/members`, { email: newMemberEmail, role: 'member' });
      setIsMemberModalOpen(false);
      setNewMemberEmail('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${projectId}/tasks`, newTask);
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium', assignee_id: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/projects/${projectId}/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleUpdateAssignee = async (taskId, newAssigneeId) => {
    try {
      await api.put(`/projects/${projectId}/tasks/${taskId}`, { assignee_id: newAssigneeId });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update assignee');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const isAdmin = project?.owner_id === currentUser?.id || 
                  members.find(m => m.id === currentUser?.id)?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: project?.color }}
          >
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{project?.name}</h1>
            <p className="text-slate-500 text-sm">Created by {project?.owner_name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition duration-200">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200 shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </>
          )}
        </div>
      </div>

      {/* New Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Create New Task</h2>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Design Login Page"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                  placeholder="Task details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newTask.assignee_id}
                    onChange={(e) => setNewTask({ ...newTask, assignee_id: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-200 mt-4"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm min-h-[400px]">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                Tasks
                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">
                  {tasks.length}
                </span>
              </h2>
            </div>
            
            <div className="p-4 space-y-3">
              {tasks.length > 0 ? tasks.map(task => (
                <div key={task.id} className="p-4 bg-slate-50 border border-slate-100 rounded-lg hover:border-indigo-200 transition group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800">{task.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        task.priority === 'urgent' ? 'bg-rose-100 text-rose-600' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {task.priority}
                      </span>
                      <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {task.description || 'No description'}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: members.find(m => m.id === task.assignee_id)?.avatar?.split('|')[1] || '#94a3b8' }}
                      >
                        {task.assignee_name?.[0] || '?'}
                      </div>
                      <select
                        value={task.assignee_id || ''}
                        onChange={(e) => handleUpdateAssignee(task.id, e.target.value)}
                        className="text-xs text-slate-500 bg-transparent border-none outline-none cursor-pointer hover:text-indigo-600 transition"
                      >
                        <option value="">Unassigned</option>
                        {members.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                      className={`text-[10px] font-bold px-2 py-1 rounded border-none outline-none cursor-pointer transition ${
                        task.status === 'done' ? 'bg-emerald-100 text-emerald-600' :
                        task.status === 'in_progress' ? 'bg-indigo-100 text-indigo-600' :
                        task.status === 'review' ? 'bg-amber-100 text-amber-600' :
                        'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <option value="todo">TODO</option>
                      <option value="in_progress">IN PROGRESS</option>
                      <option value="review">REVIEW</option>
                      <option value="done">DONE</option>
                    </select>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No tasks found in this project</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Members */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Team Members
              </h2>
              {isAdmin && (
                <button 
                  onClick={() => setIsMemberModalOpen(true)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Add Member Modal */}
            {isMemberModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Add Team Member</h2>
                    <button onClick={() => setIsMemberModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <form onSubmit={handleAddMember} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Member's Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="user@example.com"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                      />
                      <p className="mt-2 text-[10px] text-slate-500">Note: User must have an account on TaskFlow.</p>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-200 mt-4"
                    >
                      Add to Project
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: member.avatar?.split('|')[1] || '#6366f1' }}
                    >
                      {member.avatar?.split('|')[0] || member.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{member.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{member.role}</p>
                    </div>
                  </div>
                  {isAdmin && member.id !== project.owner_id && (
                    <button 
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="bg-rose-50 rounded-xl border border-rose-100 p-6">
              <h3 className="text-rose-800 font-bold text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Danger Zone
              </h3>
              <p className="text-rose-600 text-xs mb-4">
                Deleting this project will permanently remove all tasks and data.
              </p>
              <button className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition duration-200 flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
