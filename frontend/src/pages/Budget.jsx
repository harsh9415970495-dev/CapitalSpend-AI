import React, { useState, useEffect, useContext } from 'react';
import { budgetAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { AlertTriangle, CheckCircle, AlertCircle, Save, Wallet, TrendingDown, Target, Check, X } from 'lucide-react';


const Budget = () => {
  const { user, setUser } = useContext(AuthContext);
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || 50000);
  const [loading, setLoading] = useState(false);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBudgetStatus();
  }, []);

  const fetchBudgetStatus = async () => {
    try {
      const response = await budgetAPI.getBudgetStatus();
      setBudgetStatus(response.data);
      if (response.data.budget?.amount) {
        setMonthlyBudget(response.data.budget.amount);
      }
    } catch (error) {
      console.error('Error fetching budget status:', error);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    if (!monthlyBudget || monthlyBudget <= 0) {
      setError('❌ Budget must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      const res = await budgetAPI.setBudget({ amount: Number(monthlyBudget) });
      
      if (res.data.success) {
        setSuccess('✅ Budget updated successfully!');
        setUser(prev => ({ ...prev, monthlyBudget: Number(monthlyBudget) }));
        fetchBudgetStatus();
      } else {
        throw new Error(res.data.error || 'Server reported failure');
      }
    } catch (error) {
      setSuccess('');
      setError(`❌ ${error.response?.data?.error || error.message || 'Failed to update budget.'}`);
      console.error('Error updating budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = () => {
    const percent = budgetStatus?.currentMonth?.percentageUsed || 0;
    if (percent > 100) return 'bg-rose-600';
    if (percent > 80) return 'bg-rose-500';
    if (percent > 60) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStatusIcon = () => {
    const percent = budgetStatus?.currentMonth?.percentageUsed || 0;
    if (percent > 80) return <AlertTriangle className="text-rose-500" size={28} />;
    if (percent > 60) return <AlertCircle className="text-amber-500" size={28} />;
    return <CheckCircle className="text-emerald-500" size={28} />;
  };

  return (
    <div className="p-4 md:p-8 animate-fadeIn space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          Budget <span className="text-gradient">Control</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your financial limits and track spending efficiency.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Set Budget Form */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
               <Target size={24} />
             </div>
             <h2 className="text-xl font-bold text-slate-900 dark:text-white">Monthly Goal</h2>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-sm font-bold animate-fadeIn">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <X size={14} />
              </div>
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-sm font-bold animate-fadeIn">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Check size={14} />
              </div>
              {success}
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                Target Budget Amount (₹)
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-500 transition-colors">
                  ₹
                </span>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="0.00"
                  className="input-premium pl-10 w-full text-2xl font-black"
                  min="0"
                  step="100"
                  required
                />
              </div>
            </div>

            {/* Quick Select Buttons */}
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Instant Presets:</p>
              <div className="flex flex-wrap gap-2">
                {[10000, 20000, 30000, 50000, 100000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setMonthlyBudget(amount)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      Number(monthlyBudget) === amount
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-105'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-blue-500/50'
                    }`}
                  >
                    ₹{amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-premium w-full flex items-center justify-center gap-3 py-4 text-white shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={20} />
                  <span className="text-sm font-black uppercase tracking-widest">Apply Budget</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Budget Status Card */}
        {budgetStatus && (
          <div className="space-y-8">
            <div className="glass-card p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Status</h2>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Real-time expenditure tracking</p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                  {getStatusIcon()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                   <div className="flex items-center gap-2 mb-2">
                     <Wallet size={14} className="text-blue-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Budget</span>
                   </div>
                   <p className="text-2xl font-black text-slate-900 dark:text-white">₹{(budgetStatus.budget?.amount || 0).toLocaleString()}</p>
                </div>
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                   <div className="flex items-center gap-2 mb-2">
                     <TrendingDown size={14} className="text-rose-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Spent</span>
                   </div>
                   <p className="text-2xl font-black text-rose-500">₹{(budgetStatus.currentMonth?.totalSpent || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Consumption</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{budgetStatus.currentMonth?.percentageUsed || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-4 p-1 border border-black/5 dark:border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 shadow-sm ${getProgressColor()}`}
                    style={{ width: `${Math.min(budgetStatus.currentMonth?.percentageUsed || 0, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Balance: ₹{(budgetStatus.currentMonth?.remaining || 0).toLocaleString()}</span>
                  <span>Goal: ₹{(budgetStatus.budget?.amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* AI Insights Sidebar */}
            {budgetStatus.suggestions && budgetStatus.suggestions.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Smart Insights</h2>
                </div>
                <div className="space-y-3">
                  {budgetStatus.suggestions.slice(0, 2).map((suggestion, index) => (
                    <div key={index} className="p-4 bg-blue-600/5 border border-blue-600/10 rounded-2xl">
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">"{suggestion.message}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;