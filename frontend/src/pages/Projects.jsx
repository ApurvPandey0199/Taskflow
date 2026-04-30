import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Layout, Plus, Users, Calendar, ChevronRight } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchProjects();
  }, []);

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
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200 shadow-sm">
          <Plus className="w-5 h-5" />
          Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length > 0 ? projects.map((project) => (
          <Link 
            to={`/projects/${project.id}`} 
            key={project.id}
            className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 p-6 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: project.color }}
              >
                <Layout className="w-6 h-6" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {project.member_count}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {project.task_count} tasks
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition" />
            </div>
          </Link>
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
