import React, { useState, useEffect, useContext } from 'react';
import { expenseAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editData) {
      const res = await expenseAPI.updateExpense(editData._id, formData);
      if (onUpdate) onUpdate(res.data.expense);
    } else {
      const res = await expenseAPI.addExpense(formData);
      onAdd(res.data.expense);
    }
  };

  return (
    <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg text-white">

      <h2 className="text-xl font-semibold mb-4">{editData ? 'Edit Expense' : 'Add Expense'}</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

        <input
          type="number"
          name="amount"
          placeholder="Amount ₹"
          value={formData.amount}
          onChange={handleChange}
          required
          className="col-span-2 p-3 rounded-lg bg-[#334155] outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="p-3 rounded-lg bg-[#334155] outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Bills</option>
          <option>Entertainment</option>
          <option>Other</option>
        </select>

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="p-3 rounded-lg bg-[#334155] outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          name="note"
          placeholder="Note (optional)"
          value={formData.note}
          onChange={handleChange}
          className="col-span-2 p-3 rounded-lg bg-[#334155] outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-medium transition">
          {editData ? 'Update' : 'Add'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 p-3 rounded-lg font-medium transition"
        >
          Cancel
        </button>

      </form>
    </div>
  );
};

export default ExpenseForm;