import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, Database, FileText, LogOut, ChevronRight, X, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import authService from '../services/authService';
import { motion, AnimatePresence } from 'motion/react';
import logo from "../../src/assets/logo.jpeg"

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}

export default function AdminSidebar({ isOpen, onClose, isCollapsed }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Categories', icon: List, href: '/categories' },
    { name: 'Data', icon: Database, href: '/data' },
    { name: 'Invoices', icon: FileText, href: '/invoices' },
    { name: 'Users', icon: Users, href: '/users' },
  ];

  const sidebarContent = (
    <div className="flex h-full w-full flex-col bg-white shadow-2xl md:shadow-none border-r border-stone-200 overflow-hidden relative">
      <div className={cn(
        "flex items-center px-6 py-8 transition-all duration-300 relative",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-200">
            <img src={logo} alt="logo"   className="w-full h-full object-cover" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="text-lg font-black tracking-tight text-stone-900">Admin Panel</div>
              <div className="text-xs font-bold uppercase tracking-wider text-orange-600">Datab2b</div>
            </motion.div>
          )}
        </div>
        
        {/* Mobile Close Button */}
        <button onClick={onClose} className="md:hidden p-2 text-stone-400 hover:text-stone-900 transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => { if (window.innerWidth < 768) onClose(); }}
                className={cn(
                  "group flex items-center rounded-2xl text-sm font-bold transition-all duration-200",
                  isCollapsed ? "justify-center px-0 py-4" : "justify-between px-4 py-4",
                  isActive
                    ? "bg-orange-50 text-orange-700 shadow-sm"
                    : "text-stone-500 hover:bg-orange-50/50 hover:text-stone-900"
                )}
              >
                <div className="flex items-center">
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors shrink-0",
                      isActive ? "text-orange-600" : "text-stone-400 group-hover:text-stone-700",
                      !isCollapsed && "mr-3"
                    )}
                  />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </div>
                {!isCollapsed && isActive && <ChevronRight size={14} className="text-orange-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-stone-100 p-4">
        <button 
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center rounded-2xl text-sm font-bold text-stone-500 transition-all hover:bg-rose-50 hover:text-rose-600",
            isCollapsed ? "justify-center px-0 py-4" : "gap-3 px-4 py-4"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 group-hover:bg-rose-100 group-hover:text-rose-600">
            <LogOut size={16} />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Sign Out
            </motion.span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside 
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="hidden md:flex h-full flex-col bg-white z-20 shrink-0"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-72 max-w-[80vw]"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
