import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Wallet, PieChart } from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/expenses', icon: Wallet, label: 'Expenses' },
    { path: '/budget', icon: PieChart, label: 'Budget' },
  ];

  return (
    <aside className="bg-white dark:bg-gray-800 w-64 min-h-screen border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary mb-6">Smart Expense Tracker</h1>
        
        {user && (
          <div className="flex items-center space-x-3 mb-8">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">₹{user.monthlyBudget}</p>
            </div>
          </div>
        )}
      </div>
      
      <nav className="px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full ${
                  location.pathname === item.path
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;