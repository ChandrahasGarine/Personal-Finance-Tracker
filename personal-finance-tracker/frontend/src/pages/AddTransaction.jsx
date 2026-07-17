import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const AddTransaction = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      type: 'EXPENSE',
      categoryId: '',
      amount: '',
      transactionDate: new Date().toISOString().split('T')[0],
      description: '',
    }
  });

  const selectedType = watch('type');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories', error);
      toast.error('Failed to load categories.');
    }
  };

  // Filter categories depending on type (INCOME/EXPENSE)
  const filteredCategories = categories.filter(c => c.type === selectedType);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await apiClient.post('/api/transactions', {
        ...data,
        amount: parseFloat(data.amount)
      });
      toast.success('Transaction added successfully!');
      navigate('/transactions');
    } catch (error) {
      console.error('Failed to create transaction', error);
      toast.error(error.response?.data?.message || 'Failed to create transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header Link */}
      <div className="flex items-center gap-3">
        <Link 
          to="/transactions" 
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Add Transaction</h1>
          <p className="text-slate-400 text-xs">Record a new income or expense transaction.</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="glass-panel p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Transaction Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`
                flex items-center justify-center py-2.5 rounded-xl border font-semibold text-sm cursor-pointer transition-all duration-200
                ${selectedType === 'EXPENSE' 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-md shadow-rose-500/5' 
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'}
              `}>
                <input 
                  type="radio" 
                  value="EXPENSE" 
                  {...register('type')} 
                  className="sr-only" 
                />
                Expense
              </label>

              <label className={`
                flex items-center justify-center py-2.5 rounded-xl border font-semibold text-sm cursor-pointer transition-all duration-200
                ${selectedType === 'INCOME' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5' 
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'}
              `}>
                <input 
                  type="radio" 
                  value="INCOME" 
                  {...register('type')} 
                  className="sr-only" 
                />
                Income
              </label>
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be at least 0.01' }
              })}
              className="w-full glass-input"
            />
            {errors.amount && (
              <p className="text-rose-500 text-xs mt-1 font-medium">{errors.amount.message}</p>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              {...register('categoryId', { required: 'Please select a category' })}
              className="w-full glass-input appearance-none"
            >
              <option value="">Select Category</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-rose-500 text-xs mt-1 font-medium">{errors.categoryId.message}</p>
            )}
            <p className="text-[10px] text-slate-500 mt-1.5">
              Don't see your category? <Link to="/categories" className="text-blue-400 hover:underline">Manage Categories</Link>
            </p>
          </div>

          {/* Transaction Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Transaction Date
            </label>
            <input
              type="date"
              {...register('transactionDate', { required: 'Date is required' })}
              className="w-full glass-input"
            />
            {errors.transactionDate && (
              <p className="text-rose-500 text-xs mt-1 font-medium">{errors.transactionDate.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="Provide a short description..."
              rows="3"
              {...register('description', { maxLength: { value: 255, message: 'Max length is 255 characters' } })}
              className="w-full glass-input resize-none"
            />
            {errors.description && (
              <p className="text-rose-500 text-xs mt-1 font-medium">{errors.description.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Link to="/transactions" className="glass-btn-secondary flex-1 text-center py-2.5 text-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="glass-btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4.5 h-4.5" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
