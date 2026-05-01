import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Layout, Plus, Users, Calendar, ChevronRight, AlertCircle, X } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: '#6366f1' });
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', newProject);
      setIsModalOpen(false);
      navigate(`/projects/${res.data.project.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create project');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
          <p className="text-slate-500 text-sm">Manage your team's workspace</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Project
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length > 0 ? projects.map((project) => (
          <a 
            href={project.is_github ? project.url : `/projects/${project.id}`}
            target={project.is_github ? "_blank" : "_self"}
            rel="noopener noreferrer"
            key={project.id}
            className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 p-6 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: project.color }}
              >
                {project.is_github ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                ) : (
                  <Layout className="w-6 h-6" />
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                project.is_github ? 'bg-slate-900 text-white' :
                project.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
              }`}>
                {project.status}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition">
              {project.name}
            </h3>
            <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">
              {project.description || 'No description provided.'}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-4 text-slate-400 text-xs">
                {project.is_github ? (
                   <span className="flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {project.task_count} issues
                  </span>
                ) : (
                  <>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {project.member_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {project.task_count} tasks
                    </span>
                  </>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition" />
            </div>
          </a>
        )) : (
          <div className="col-span-full py-20 text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layout className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-800 font-bold mb-1">No projects yet</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first project to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
