import React, { useState, useEffect, useContext } from 'react';
import { expenseAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Save, X } from 'lucide-react';

const ExpenseForm = ({ onAdd, onCancel, editData, onUpdate }) => {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        amount: editData.amount,
        category: editData.category,
        date: new Date(editData.date).toISOString().split('T')[0],
        note: editData.note || '',
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editData) {
        const res = await expenseAPI.updateExpense(editData._id, formData);
        if (onUpdate) onUpdate(res.data.expense);
      } else {
        const res = await expenseAPI.addExpense(formData);
        onAdd(res.data.expense);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert(err.response?.data?.message || "Failed to save expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {editData ? 'Edit Transaction' : 'Record New Expense'}
        </h2>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount (₹)</label>
          <input
            type="number"
            name="amount"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
            required
            className="input-premium w-full text-lg font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input-premium w-full appearance-none"
          >
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Entertainment</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Transaction Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="input-premium w-full"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Note / Memo</label>
          <textarea
            name="note"
            placeholder="What was this for?"
            value={formData.note}
            onChange={handleChange}
            className="input-premium w-full h-24 resize-none"
          />
        </div>

        <div className="md:col-span-2 flex gap-3 mt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-premium flex-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save size={18} />
            )}
            <span>
              {loading ? 'Recording...' : (editData ? 'Save Changes' : 'Record Transaction')}
            </span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5"
          >
            Discard
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;