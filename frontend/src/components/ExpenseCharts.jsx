import React, { useContext } from 'react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from "recharts";
import { AuthContext } from '../context/AuthContext';

function ExpenseCharts({ expenses }) {
  const { theme } = useContext(AuthContext);
  const isDark = theme === 'dark';

  // Theme-aware colors
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#1e293b' : '#e2e8f0';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';

  if (!expenses || expenses.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">No expense data available to generate charts.</p>
        <p className="text-xs text-slate-400 mt-2">Add some expenses to see your analytics.</p>
      </div>
    );
  }

  // 1. Pie Chart Data (Category-wise)
  const categoryMap = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const pieData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  })).sort((a, b) => b.value - a.value);

  const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  // 2. Line Chart Data (Daily Trend)
  const last7DaysMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7DaysMap[d.toISOString().split('T')[0]] = 0;
  }
  
  expenses.forEach((e) => {
    const dateStr = new Date(e.date).toISOString().split('T')[0];
    if (last7DaysMap[dateStr] !== undefined) {
      last7DaysMap[dateStr] += e.amount;
    }
  });

  const lineData = Object.keys(last7DaysMap).map((dateStr) => {
    const d = new Date(dateStr);
    return {
      date: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
      amount: last7DaysMap[dateStr],
    };
  });

  const barData = [...pieData];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Pie Chart */}
        <div className="bg-transparent">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">Spending by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80}
                  innerRadius={60}
                  paddingAngle={5}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder, 
                    borderRadius: '12px',
                    color: tooltipText,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: tooltipText }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-transparent">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">Category Comparison</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" stroke={textColor} fontSize={12} tickFormatter={(value) => `₹${value}`} />
                <YAxis dataKey="name" type="category" stroke={textColor} fontSize={12} width={80} />
                <RechartsTooltip 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder, 
                    borderRadius: '12px',
                    color: tooltipText 
                  }}
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Trend Line Chart */}
      <div className="bg-transparent pt-4">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">Last 7 Days Trend</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} dx={-10} />
              <RechartsTooltip 
                formatter={(value) => `₹${value.toLocaleString()}`}
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  borderColor: tooltipBorder, 
                  borderRadius: '12px',
                  color: tooltipText 
                }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={4}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: tooltipBg }} 
                activeDot={{ r: 6, strokeWidth: 0 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ExpenseCharts;