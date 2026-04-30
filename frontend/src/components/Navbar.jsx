import { useAuth } from '../hooks/useAuth';
import { LogOut, Layout, Settings, Bell, Search, Menu, Briefcase, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getAvatarColor = (avatar) => {
    if (!avatar || !avatar.includes('|')) return '#6366f1';
    return avatar.split('|')[1];
  };

  const getInitials = (avatar) => {
    if (!avatar || !avatar.includes('|')) return 'U';
    return avatar.split('|')[0];
  };

  const navItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    { label: 'Projects', icon: Briefcase, path: '/projects' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">TaskFlow</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                    location.pathname === item.path
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 w-64">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder:text-slate-400"
              />
            </div>
            
            <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.email}</p>
              </div>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                style={{ backgroundColor: getAvatarColor(user?.avatar) }}
              >
                {getInitials(user?.avatar)}
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            
            <button className="md:hidden p-2 text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
