import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from "recharts";

function ExpenseCharts({ expenses }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-gray-800 text-center text-gray-400 py-10">
        <p>No expense data available to generate charts.</p>
        <p className="text-sm mt-2">Add some expenses to see your analytics.</p>
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
  })).sort((a, b) => b.value - a.value); // Sort to keep colors somewhat consistent

  const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  // 2. Line Chart Data (Daily Trend)
  // Get last 7 days of data
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

  // 3. Bar Chart Data (Category vs Amount Bar)
  // Instead of monthly trend (since we only fetch current month's expenses usually), 
  // let's show a bar chart of categories for better visual comparison
  const barData = [...pieData];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Category Comparison</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tickFormatter={(value) => `₹${value}`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                <RechartsTooltip 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  cursor={{ fill: '#334155' }}
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
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-gray-800">
        <h2 className="text-lg font-semibold mb-4">Last 7 Days Trend</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => `₹${value}`} />
              <RechartsTooltip 
                formatter={(value) => `₹${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ExpenseCharts;