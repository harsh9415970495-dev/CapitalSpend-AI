import React, { useState, useEffect, useContext } from 'react';
import { budgetAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { AlertTriangle, CheckCircle, AlertCircle, Save } from 'lucide-react';

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
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!monthlyBudget || monthlyBudget <= 0) {
      setError('❌ Budget must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      await budgetAPI.setBudget({ amount: Number(monthlyBudget) });
      setError('');
      setSuccess('✅ Budget updated successfully!');
      setUser(prev => ({ ...prev, monthlyBudget: Number(monthlyBudget) })); // Update Sidebar immediately
      fetchBudgetStatus(); // Refresh budget status
    } catch (error) {
      setSuccess('');
      setError(`❌ ${error.response?.data?.error || 'Failed to update budget. Please try again.'}`);
      console.error('Error updating budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = () => {
    if (!budgetStatus) return 'bg-green-500';
    if ((budgetStatus.currentMonth?.percentageUsed || 0) > 80) return 'bg-red-500';
    if ((budgetStatus.currentMonth?.percentageUsed || 0) > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (!budgetStatus) return null;
    if ((budgetStatus.currentMonth?.percentageUsed || 0) > 80) return <AlertTriangle className="text-red-500" size={24} />;
    if ((budgetStatus.currentMonth?.percentageUsed || 0) > 60) return <AlertCircle className="text-yellow-500" size={24} />;
    return <CheckCircle className="text-green-500" size={24} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Budget Settings</h1>
      </div>

      {/* Set Budget Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Set Monthly Budget</h2>

        {error ? (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        ) : success ? (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
            {success}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Monthly Budget Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                ₹
              </span>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                placeholder="Enter your monthly budget"
                className="input-field pl-8"
                min="0"
                step="100"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Set how much you want to spend this month
            </p>
          </div>

          {/* Quick Select Buttons */}
          <div>
            <p className="text-sm font-medium mb-2">Quick Select:</p>
            <div className="flex flex-wrap gap-2">
              {[10000, 20000, 30000, 50000, 75000, 100000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setMonthlyBudget(amount)}
                  className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                    monthlyBudget === amount
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary'
                  }`}
                >
                  ₹{amount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Budget</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Budget Status Card */}
      {budgetStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Current Budget Status</h2>
            {getStatusIcon()}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Monthly Budget</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{(budgetStatus.budget?.amount || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-red-500">
                  ₹{(budgetStatus.currentMonth?.totalSpent || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Remaining</p>
                <p className={`text-2xl font-bold ${
                  (budgetStatus.currentMonth?.remaining || 0) < 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  ₹{(budgetStatus.currentMonth?.remaining || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Budget Used</span>
                <span className="font-bold">{budgetStatus.currentMonth?.percentageUsed || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${getProgressColor()}`}
                  style={{ width: `${Math.min(budgetStatus.currentMonth?.percentageUsed || 0, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹0</span>
                <span>₹{(budgetStatus.budget?.amount || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Status Message */}
            <div className={`p-3 rounded-lg ${
              (budgetStatus.currentMonth?.percentageUsed || 0) > 80
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                : (budgetStatus.currentMonth?.percentageUsed || 0) > 60
                ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            }`}>
              {(budgetStatus.currentMonth?.percentageUsed || 0) > 80
                ? '⚠️ Warning! You have used more than 80% of your monthly budget!'
                : (budgetStatus.currentMonth?.percentageUsed || 0) > 60
                ? '📊 Caution! You have used more than 60% of your monthly budget.'
                : '✅ Great! You are within your monthly budget.'}
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {budgetStatus?.suggestions && budgetStatus.suggestions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">💡 AI Suggestions</h2>
          <div className="space-y-3">
            {budgetStatus.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  suggestion.type === 'warning'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200'
                    : suggestion.type === 'info'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200'
                    : suggestion.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200'
                }`}
              >
                <p className="text-sm">{suggestion.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;