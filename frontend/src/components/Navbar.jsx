import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Moon, Sun, Bell, Search } from 'lucide-react';

const Navbar = () => {
  const { user, theme, toggleTheme } = useContext(AuthContext);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5 px-4 md:px-8 py-4 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
             <span className="text-white font-black text-sm">S</span>
          </div>
          <h1 className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase select-none">
            Smart<span className="text-blue-500">Spend</span> AI
          </h1>
        </div>

        
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center gap-4">
             <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors relative">
               <Bell size={20} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-slate-950"></span>
             </button>
             <button 
               onClick={toggleTheme}
               className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors"
               title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
             >
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 hidden md:block"></div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user.username}</p>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Premium Member</p>
              </div>
              
              <div className="relative group cursor-pointer">
                <div className="w-10 h-10 rounded-full border-2 border-blue-500/50 p-0.5 group-hover:border-blue-500 transition-all">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt="User"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;