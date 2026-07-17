import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '../api/apiClient';
import { PiggyBank, Calendar, Trash2, Loader2, Save, X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const Budgets = () => {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingBudget, setEditingBudget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const monthsList = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  const yearsList = Array.from({ length: 7 }, (_, i) => today.getFullYear() - 3 + i);

  // Form for budgets
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      categoryId: '',
      monthlyLimit: '',
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgetsAndExpenses();
  }, [month, year]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      // Budgets are only set for EXPENSE categories
      setCategories(response.data.filter(c => c.type === 'EXPENSE'));
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const fetchBudgetsAndExpenses = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/dashboard/budget-status?month=${month}&year=${year}`);
      setBudgets(response.data);
    } catch (error) {
      console.error('Failed to load budgets', error);
      toast.error('Failed to load budgets list.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        categoryId: parseInt(data.categoryId),
        monthlyLimit: parseFloat(data.monthlyLimit),
        month: parseInt(data.month),
        year: parseInt(data.year)
      };

      if (editingBudget) {
        await apiClient.put(`/api/budgets/${editingBudget.id}`, payload);
        toast.success('Budget limit updated successfully!');
      } else {
        await apiClient.post('/api/budgets', payload);
        toast.success('Budget created successfully!');
      }
      resetForm();
      fetchBudgetsAndExpenses();
    } catch (error) {
      console.error('Failed to save budget', error);
      toast.error(error.response?.data?.message || 'Failed to save budget target.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (b) => {
    // Find category ID matching name
    const category = categories.find(c => c.name === b.categoryName);
    if (!category) return;
    
    setEditingBudget(b);
    setValue('categoryId', category.id);
    setValue('monthlyLimit', parseFloat(b.limit));
    setValue('month', month);
    setValue('year', year);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget limit?')) return;
    try {
      await apiClient.delete(`/api/budgets/${id}`);
      toast.success('Budget deleted successfully!');
      fetchBudgetsAndExpenses();
      if (editingBudget?.id === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Failed to delete budget', error);
      toast.error('Failed to delete budget.');
    }
  };

  const resetForm = () => {
    setEditingBudget(null);
    reset({
      categoryId: '',
      monthlyLimit: '',
      month: month,
      year: year,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Budgets</h1>
          <p className="text-slate-400 text-sm">Configure monthly expense target limits by category.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="relative">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="appearance-none bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 pr-10 text-sm text-slate-200 focus:outline-none"
            >
              {monthsList.map(m => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
            <Calendar className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          {/* Year Selector */}
          <div className="relative">
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="appearance-none bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 pr-10 text-sm text-slate-200 focus:outline-none"
            >
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <Calendar className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Budgets List (Span 2) */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Budgets for {monthsList.find(m => m.value === month)?.name} {year}
          </h3>

          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.map((b) => {
                const limit = parseFloat(b.limit);
                const spent = parseFloat(b.spent);
                const remaining = parseFloat(b.remaining);
                const percentage = parseFloat(b.percentageUsed);
                const isOver = b.overBudget;
                const isNear = percentage >= 80 && percentage <= 100;

                return (
                  <div 
                    key={b.id}
                    className="p-5 bg-slate-900/30 border border-slate-800/80 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                          style={{ backgroundColor: `${b.color}15`, color: b.color }}
                        >
                          {b.categoryName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{b.categoryName}</h4>
                          <span className="text-[10px] text-slate-500">Monthly budget limit</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOver && (
                          <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            Over Limit
                          </span>
                        )}
                        {isNear && (
                          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            Near Limit
                          </span>
                        )}
                        <button
                          onClick={() => handleEdit(b)}
                          className="text-xs text-blue-400 hover:underline font-semibold px-2 py-1"
                        >
                          Edit Limit
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-850 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 
                            ${isOver ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-blue-500'}
                          `} 
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Spent: <span className="font-semibold text-slate-200">${spent.toFixed(2)}</span></span>
                        <span>Percentage: <span className="font-semibold text-slate-200">{percentage.toFixed(0)}%</span></span>
                      </div>
                    </div>

                    {/* Footer values details */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-850/50 text-xs">
                      <div>
                        <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-semibold">Budget Limit</span>
                        <span className="text-slate-300 font-bold text-sm">${limit.toFixed(2)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-semibold">Remaining Limit</span>
                        <span className={`font-bold text-sm ${remaining <= 0 ? 'text-red-400' : 'text-slate-350'}`}>
                          ${remaining.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <PiggyBank className="w-12 h-12 text-slate-600" />
              <p className="font-semibold text-slate-400 text-sm">No budgets set for this month.</p>
              <p className="text-xs text-slate-500">Configure target spending limits using the card panel on the right.</p>
            </div>
          )}
        </div>

        {/* Right Side: Set Budget Limit Card */}
        <div className="glass-panel p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              {editingBudget ? 'Edit Limit' : 'Set Budget'}
            </h3>
            {editingBudget && (
              <button 
                onClick={resetForm}
                className="p-1 rounded-lg hover:bg-slate-850 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                disabled={!!editingBudget}
                {...register('categoryId', { required: 'Please select category' })}
                className="w-full glass-input appearance-none disabled:opacity-50"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-rose-500 text-xs mt-1 font-medium">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Limit Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Monthly Target ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="500.00"
                {...register('monthlyLimit', { 
                  required: 'Monthly limit is required',
                  min: { value: 0.01, message: 'Must be greater than 0.01' }
                })}
                className="w-full glass-input"
              />
              {errors.monthlyLimit && (
                <p className="text-rose-500 text-xs mt-1 font-medium">{errors.monthlyLimit.message}</p>
              )}
            </div>

            {/* Target Month */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Month
                </label>
                <select
                  disabled={!!editingBudget}
                  {...register('month', { required: true })}
                  className="w-full glass-input appearance-none disabled:opacity-50"
                >
                  {monthsList.map(m => (
                    <option key={m.value} value={m.value}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Year
                </label>
                <select
                  disabled={!!editingBudget}
                  {...register('year', { required: true })}
                  className="w-full glass-input appearance-none disabled:opacity-50"
                >
                  {yearsList.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              {editingBudget && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="glass-btn-secondary text-xs py-2 flex-1"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="glass-btn-primary text-xs py-2 flex-1 flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Target
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
