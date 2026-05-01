import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { 
  User, Lock, Bell, 
  Moon, Shield, Save, Loader2, 
  CheckCircle2, AlertCircle 
} from 'lucide-react';

const GithubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

export default function Settings() {
  const { user, login } = useAuth(); // login to refresh user data if needed
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    githubToken: user?.githubToken || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.put('/auth/profile', profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // In a real app, you'd update the auth context user state here
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match' });
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'github', label: 'Integrations', icon: GithubIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-slate-500 text-sm">Manage your profile, security, and integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage({ type: '', text: '' });
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {message.text && (
              <div className={`p-4 flex items-center gap-3 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            <div className="p-8">
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-slate-50">
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                      style={{ backgroundColor: user?.avatar?.split('|')[1] || '#6366f1' }}
                    >
                      {user?.avatar?.split('|')[0] || user?.name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Profile Picture</h3>
                      <p className="text-xs text-slate-500 mt-1">Avatar is auto-generated based on your name.</p>
                      <button type="button" className="text-indigo-600 text-xs font-bold mt-2 hover:underline">Change Initials</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        disabled
                        className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                        value={user?.email || ''}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        placeholder="••••••••"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                          placeholder="••••••••"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                          placeholder="••••••••"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                      Update Password
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'github' && (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-slate-800">
                      <GithubIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">GitHub Integration</h3>
                      <p className="text-xs text-slate-500 mt-1">Connect your GitHub account to sync repositories directly to your dashboard.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Personal Access Token</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="password"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        value={profileData.githubToken}
                        onChange={(e) => setProfileData({ ...profileData, githubToken: e.target.value })}
                      />
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400">
                      Token needs `repo` scope to list your private repositories.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-100"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Token
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="text-center py-12">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-800">Coming Soon</h3>
                  <p className="text-sm text-slate-500 mt-1">Notification preferences are being built.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
