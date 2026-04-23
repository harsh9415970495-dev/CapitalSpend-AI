import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Moon, Sun, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Smart Expense Tracker</h1>
        
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="flex items-center space-x-2">
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden md:inline text-sm font-medium">
                  {user.username}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="btn-outline flex items-center space-x-1"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          )}
          
          <button
            onClick={toggleTheme}
            className="btn-outline p-2 rounded-full"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;