
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import authService from '../services/authService';
import { toast } from 'react-toastify';
import { motion } from 'motion/react';
import { User, Mail, Lock, Save, Loader2, Eye, EyeOff } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState({ name: '', email: '', lastLogin: '' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfile({ 
        name: data.name, 
        email: data.email, 
        lastLogin: data.lastLogin ? new Date(data.lastLogin).toLocaleString() : 'N/A'
      });
      setLoading(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch profile');
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setUpdating(true);
    try {
      const updateData: any = { name: profile.name, email: profile.email };
      if (password) updateData.password = password;

      await authService.updateProfile(updateData);
      toast.success('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Profile">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-stone-400" size={48} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Profile">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-stone-900 to-stone-800 p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold">Profile Settings</h2>
              <p className="text-stone-400 mt-1">Manage your account information and password.</p>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <User size={120} />
            </div>
          </div>

          <form onSubmit={handleUpdate} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                  <User size={20} className="text-orange-500" />
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        required
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5 text-stone-500">Last Login Activity</label>
                    <div className="px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-stone-600 text-sm italic">
                      {profile.lastLogin}
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                  <Lock size={20} className="text-rose-500" />
                  Security
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full pl-10 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={updating}
                className="flex items-center gap-2 px-8 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-stone-200 group"
              >
                {updating ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} className="group-hover:scale-110 transition-transform" />
                )}
                {updating ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default ProfilePage;
