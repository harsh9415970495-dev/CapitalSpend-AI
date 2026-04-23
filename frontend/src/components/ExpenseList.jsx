import React, { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import ExpenseForm from './ExpenseForm';
import { Edit2, Trash2, Download, Plus, Calendar, Receipt } from 'lucide-react';

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
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setShowForm(false);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleExportPDF = async () => {
    try {
      const res = await expenseAPI.exportPDF({ date: selectedDate });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SmartSpend_Report_${new Date().toLocaleDateString()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("Failed to generate PDF report.");
    }
  };


  return (
    <div className="p-4 md:p-8 animate-fadeIn space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Transaction <span className="text-gradient">History</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage your detailed spending logs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-premium pl-10 w-full"
            />
          </div>
          
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 px-4 py-2.5 rounded-xl font-semibold transition-all text-slate-600 dark:text-slate-300"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>


          <button
            onClick={() => { setShowForm(true); setEditingExpense(null); }}
            className="btn-premium flex items-center gap-2 px-6 py-2.5 text-white"
          >
            <Plus size={18} />
            <span>New Expense</span>
          </button>
        </div>
      </div>

      {(showForm || editingExpense) && (
        <div className="glass-card p-6 animate-slideIn">
           <ExpenseForm
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onCancel={handleCancelForm}
            editData={editingExpense}
          />
        </div>
      )}

      {/* TABLE */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <th className="p-5 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest">Date</th>
                <th className="p-5 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest">Category</th>
                <th className="p-5 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest">Memo</th>
                <th className="p-5 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest">Amount</th>
                <th className="p-5 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Receipt size={40} className="opacity-20 mb-2" />
                      <p>No transaction records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white font-semibold">
                           {new Date(e.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">
                          {new Date(e.date).getFullYear()}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-5">
                      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate font-medium" title={e.note}>
                        {e.note || <span className="italic opacity-30 text-xs text-slate-400">No memo</span>}
                      </p>
                    </td>
                    <td className="p-5">
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        ₹{e.amount.toLocaleString()}
                      </span>
                    </td>

                    <td className="p-5">
                      <div className="flex justify-center gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(e)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(e._id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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