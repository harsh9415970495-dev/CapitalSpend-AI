import React, { useEffect, useState } from "react";
import { expenseAPI, budgetAPI } from "../services/api";
import ExpenseCharts from "./ExpenseCharts";

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
      <div className="flex justify-center items-center h-screen bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const budget = budgetData?.budget?.amount || 0;
  const totalExpense = budgetData?.currentMonth?.totalSpent || 0;
  const remaining = budgetData?.currentMonth?.remaining || 0;
  const percentUsed = budgetData?.currentMonth?.percentageUsed || 0;
  const suggestions = budgetData?.suggestions || [];

  return (
    <div className="bg-[#0f172a] min-h-screen p-6 text-white space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* SUMMARY CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-gray-800 transition hover:border-gray-700">
          <h3 className="text-gray-400 font-medium">Monthly Budget</h3>
          <p className="text-3xl font-bold mt-2">₹{budget.toLocaleString()}</p>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-gray-800 transition hover:border-gray-700">
          <h3 className="text-gray-400 font-medium">Total Spent</h3>
          <p className="text-3xl font-bold mt-2 text-red-400">
            ₹{totalExpense.toLocaleString()}
          </p>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-gray-800 transition hover:border-gray-700">
          <h3 className="text-gray-400 font-medium">Remaining</h3>
          <p className={`text-3xl font-bold mt-2 ${remaining < 0 ? 'text-red-500' : 'text-green-400'}`}>
            ₹{remaining.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* CHARTS */}
          <ExpenseCharts expenses={expenses} />
        </div>

        <div className="space-y-6">
          {/* PROGRESS BAR */}
          <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Budget Usage</h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Spent: {percentUsed.toFixed(1)}%</span>
              <span className="text-gray-400">₹{budget.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-1000 ${
                  percentUsed < 50
                    ? "bg-green-500"
                    : percentUsed < 80
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              ></div>
            </div>
            {percentUsed >= 80 && (
              <p className="text-red-400 text-sm mt-3 font-medium">
                ⚠️ You are nearing your budget limit!
              </p>
            )}
          </div>

          {/* AI SUGGESTIONS */}
          <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">🤖</span> AI Insights
            </h3>
            {suggestions.length > 0 ? (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl text-sm font-medium ${
                      suggestion.type === 'warning'
                        ? 'bg-red-900/20 text-red-300 border border-red-900/50'
                        : suggestion.type === 'info'
                        ? 'bg-blue-900/20 text-blue-300 border border-blue-900/50'
                        : suggestion.type === 'success'
                        ? 'bg-green-900/20 text-green-300 border border-green-900/50'
                        : 'bg-yellow-900/20 text-yellow-300 border border-yellow-900/50'
                    }`}
                  >
                    {suggestion.message}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No insights available yet. Add some expenses to see AI suggestions.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;