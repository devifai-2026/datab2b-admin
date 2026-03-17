import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { motion } from 'motion/react';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#fef9f3] font-sans text-stone-900 overflow-hidden relative">
      {/* Sidebar Component */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-20 bg-white border-b border-stone-200 flex items-center justify-between px-6 md:px-10 shrink-0 z-10 transition-all duration-300">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-stone-500 hover:text-stone-900 transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* Desktop Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-2 -ml-2 text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl md:text-2xl font-black tracking-tight text-stone-900 truncate"
            >
              {title}
            </motion.h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-stone-900">Administrator</span>
              <span className="text-xs font-medium text-stone-400">admin@datab2b.in</span>
            </div>
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm md:text-base">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar-x p-4 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
