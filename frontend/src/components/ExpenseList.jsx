import React, { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import ExpenseForm from './ExpenseForm';
import { Edit2, Trash2, Download } from 'lucide-react';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, [selectedDate]);

  const fetchExpenses = async () => {
    const params = {};
    if (selectedDate) params.date = selectedDate;

    try {
      const res = await expenseAPI.getExpenses(params);
      setExpenses(res.data.expenses);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    }
  };

  const handleAdd = (data) => {
    setExpenses([data, ...expenses]);
    setShowForm(false);
  };

  const handleUpdate = (updatedData) => {
    setExpenses(expenses.map(e => e._id === updatedData._id ? updatedData : e));
    setEditingExpense(null);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this expense?");
    if (!confirmDelete) return;

    try {
      await expenseAPI.deleteExpense(id);
      setExpenses(expenses.filter((e) => e._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setShowForm(false); // Hide add form if open
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleExportCSV = async () => {
    try {
      const res = await expenseAPI.exportExpenses();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expenses.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export CSV");
    }
  };

  return (
    <div className="bg-[#0f172a] min-h-screen p-6 text-white space-y-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#1e293b] p-2.5 rounded-xl border border-gray-700 outline-none focus:border-blue-500 transition"
          />
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2.5 rounded-xl font-medium transition"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingExpense(null); }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl font-medium shadow-lg transition"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {(showForm || editingExpense) && (
        <ExpenseForm
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onCancel={handleCancelForm}
          editData={editingExpense}
        />
      )}

      {/* TABLE */}
      <div className="bg-[#1e293b] rounded-2xl overflow-hidden shadow-lg border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#334155] border-b border-gray-700">
              <tr>
                <th className="p-4 font-semibold text-gray-300">Date</th>
                <th className="p-4 font-semibold text-gray-300">Category</th>
                <th className="p-4 font-semibold text-gray-300">Note</th>
                <th className="p-4 font-semibold text-gray-300">Amount</th>
                <th className="p-4 font-semibold text-gray-300 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e._id} className="border-b border-gray-800 hover:bg-[#334155]/50 transition">
                    <td className="p-4 whitespace-nowrap">
                      {new Date(e.date).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-700 px-2.5 py-1 rounded-md text-sm">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 max-w-xs truncate" title={e.note}>
                      {e.note || '-'}
                    </td>
                    <td className="p-4 font-bold text-gray-100">
                      ₹{e.amount.toLocaleString()}
                    </td>

                    <td className="p-4 flex justify-center gap-3">
                      <button
                        onClick={() => handleEditClick(e)}
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(e._id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ExpenseList;