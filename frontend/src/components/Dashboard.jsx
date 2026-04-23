import React, { useEffect, useState } from "react";
import { expenseAPI, budgetAPI } from "../services/api";
import ExpenseCharts from "./ExpenseCharts";
import Chatbot from "./Chatbot";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expenseRes, budgetRes] = await Promise.all([
        expenseAPI.getExpenses(),
        budgetAPI.getBudgetStatus()
      ]);
      setExpenses(expenseRes.data.expenses);
      setBudgetData(budgetRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  const budget = budgetData?.budget?.amount || 0;
  const totalExpense = budgetData?.currentMonth?.totalSpent || 0;
  const remaining = budgetData?.currentMonth?.remaining || 0;
  const percentUsed = budgetData?.currentMonth?.percentageUsed || 0;
  const suggestions = budgetData?.suggestions || [];

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fadeIn space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Financial <span className="text-gradient">Intelligence</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor your capital flow and AI-driven insights.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-premium px-6 py-2.5 text-white" onClick={fetchData}>
            Refresh Analytics
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-6">
            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-[0.1em]">Monthly Budget</span>
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">₹{budget.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-3 tracking-widest">Total Allocation</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-6">
            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-[0.1em]">Total Spent</span>
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            </div>
          </div>
          <h3 className="text-4xl font-black text-rose-500 tracking-tighter">₹{totalExpense.toLocaleString()}</h3>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden border border-black/5 dark:border-white/5">
            <div 
              className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(244,63,94,0.3)] ${percentUsed > 80 ? 'bg-rose-500' : 'bg-blue-500'}`} 
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-6">
            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-[0.1em]">Remaining</span>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <h3 className={`text-4xl font-black tracking-tighter ${remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            ₹{remaining.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-3 tracking-widest">Available Balance</p>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Charts Card */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Expense Distribution</h3>
            <ExpenseCharts expenses={expenses} />
          </div>

          {/* AI Insights Card */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              AI Smart Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{suggestion.message}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-8 text-center bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                  <p className="text-slate-500">Add more data to generate personalized AI insights.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions Card */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                Recent Transactions
              </h3>
              <button 
                onClick={() => window.location.href = '/expenses'} 
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors font-bold uppercase tracking-wider"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {expenses.length > 0 ? (
                expenses.slice(0, 5).map((expense) => (
                  <div key={expense._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-lg">
                        {expense.category === 'Food' ? '🍔' : 
                         expense.category === 'Travel' ? '🚗' : 
                         expense.category === 'Shopping' ? '🛍️' : '💰'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{expense.category}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-rose-500">-₹{expense.amount.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-4 text-sm italic">No recent transactions.</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Assistant Card */}
        <div className="glass-card flex flex-col h-[700px] sticky top-8">
          <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white dark:border-slate-950 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">Finance Assistant</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase">Active & Secure</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Chatbot />
          </div>

        </div>
      </div>
    </div>

  );
};

export default Dashboard;