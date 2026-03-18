
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, Loader2, User as UserIcon, Mail, Calendar } from 'lucide-react';
import userService from '../services/userService';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  active?: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (user: User) => {
    const prevActive = Boolean(user.active);
    try {
      setIsUpdating(user._id);
      await userService.updateUserStatus(user._id, !prevActive);
      setUsers(prev =>
        prev.map(u => (u._id === user._id ? { ...u, active: !prevActive } : u))
      );
      toast.success(`User ${user.name} ${prevActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <AdminLayout title="Users Management">
      <div className="flex flex-col md:flex-row gap-6 mb-8 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-[20px] py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-4 bg-orange-50 px-6 py-4 rounded-[20px] border border-orange-100">
            <UserIcon size={20} className="text-orange-600" />
            <div className="flex flex-col">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest leading-none">Total Users</span>
                <span className="text-lg font-black text-stone-900 leading-none mt-1">{users.length}</span>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-stone-200 overflow-x-auto no-scrollbar-x">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">User Details</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">Email Address</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">Joined Date</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-orange-500" size={32} />
                    <span className="text-sm font-bold text-stone-400">Loading users...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center">
                  <span className="text-sm font-bold text-stone-400">No users found.</span>
                </td>
              </tr>
            ) : (
              currentItems.map((user) => (
                <tr key={user._id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                            <UserIcon size={20} />
                        </div>
                        <div className="font-bold text-stone-900">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-stone-600 font-medium">
                        <Mail size={16} className="text-stone-300" />
                        {user.email}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-stone-500 text-sm font-bold">
                        <Calendar size={16} className="text-stone-300" />
                        {new Date(user.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <label className="inline-flex items-center cursor-pointer">
                      <span className="mr-3 text-xs font-semibold text-stone-600">{user.active ? 'Active' : 'Inactive'}</span>
                      <span className="relative">
                        <input
                          type="checkbox"
                          checked={Boolean(user.active)}
                          disabled={isUpdating === user._id}
                          onChange={() => toggleUserStatus(user)}
                          className="sr-only"
                        />
                        <span className={`block w-11 h-6 rounded-full transition-colors ${user.active ? 'bg-emerald-500' : 'bg-stone-300'}`}></span>
                        <span className={`dot absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transform transition ${user.active ? 'translate-x-5' : ''}`}></span>
                      </span>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="h-10 px-4 rounded-xl bg-white border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <div className="flex items-center gap-2 overflow-x-auto max-w-[200px] md:max-w-md px-2 py-1 no-scrollbar">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`h-10 w-10 flex-shrink-0 rounded-xl font-bold transition-all ${
                  currentPage === i + 1
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-10 px-4 rounded-xl bg-white border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
