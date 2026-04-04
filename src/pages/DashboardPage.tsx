import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { motion } from 'motion/react';
import { Users, Database, Layers, TrendingUp, Loader2 } from 'lucide-react';
import authService from '../services/authService';

export default function DashboardPage() {
  const [statsData, setStatsData] = useState({
    categories: 0,
    datasets: 0,
    users: 0,
    revenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await authService.getDashboardStats();
        setStatsData({
          categories: stats.categories,
          datasets: stats.datasets,
          users: stats.users,
          revenue: stats.revenue
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Total Categories', value: statsData.categories, icon: Layers, color: 'bg-orange-500', trend: 'Live count' },
    { label: 'Total Datasets', value: statsData.datasets, icon: Database, color: 'bg-emerald-500', trend: 'Live count' },
    { label: 'Total Users', value: statsData.users, icon: Users, color: 'bg-amber-500', trend: 'Live count' },
    { label: 'Total Revenue', value: `₹${statsData.revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-rose-500', trend: 'Total paid' },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full h-40 flex items-center justify-center bg-white rounded-[32px] border border-stone-200">
            <Loader2 className="animate-spin text-orange-500 mr-2" />
            <span className="font-bold text-stone-400">Loading metrics...</span>
          </div>
        ) : (
          stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative overflow-hidden bg-white rounded-[32px] p-8 border border-stone-200 shadow-sm hover:shadow-xl hover:shadow-orange-50 transition-all duration-300"
            >
              <div className={`h-14 w-14 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-inherit/20 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-4xl font-black text-stone-900 tracking-tight mb-2">{stat.value}</div>
              <div className="text-xs font-bold text-emerald-500">{stat.trend}</div>
              
              <div className={`absolute -right-4 -bottom-4 h-24 w-24 ${stat.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
            </motion.div>
          ))
        )}
      </div>

     
    </AdminLayout>
  );
}
