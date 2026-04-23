import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Wallet, PieChart, ChevronRight, LogOut, Sparkles } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/expenses', icon: Wallet, label: 'Expenses' },
    { path: '/budget', icon: PieChart, label: 'Budget' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-white/5 flex flex-col z-[60] transition-colors duration-300">
      {/* Brand */}
      <div className="p-8 select-none cursor-default">
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
             <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
            Smart<span className="text-blue-500">Spend</span>
          </h1>
        </div>
      </div>

      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 select-none">
        <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>
        <ul className="space-y-1.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 w-full cursor-pointer ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={location.pathname === item.path ? 'text-white' : 'text-slate-400 group-hover:text-blue-500 transition-colors'} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                {location.pathname === item.path && <ChevronRight size={14} className="opacity-50" />}
              </button>
            </li>
          ))}
        </ul>
      </nav>


      {/* Sidebar Footer - Logout Only */}
      <div className="p-6 mt-auto">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 w-full px-4 py-4 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300 border border-transparent hover:border-rose-500/20"
        >
          <LogOut size={20} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
          <span className="font-bold text-sm uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;