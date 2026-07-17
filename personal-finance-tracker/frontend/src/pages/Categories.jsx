import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '../api/apiClient';
import { Plus, Edit2, Trash2, Tag, Loader2, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';

const Categories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form for Add/Edit
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      type: 'EXPENSE',
      color: '#3B82F6',
      icon: 'Folder'
    }
  });

  const selectedType = watch('type');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories', error);
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingCategory) {
        // Edit category
        await apiClient.put(`/api/categories/${editingCategory.id}`, data);
        toast.success('Category updated successfully!');
      } else {
        // Add category
        await apiClient.post('/api/categories', data);
        toast.success('Category created successfully!');
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category', error);
      toast.error(error.response?.data?.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setValue('name', cat.name);
    setValue('type', cat.type);
    setValue('color', cat.color || '#3B82F6');
    setValue('icon', cat.icon || 'Folder');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await apiClient.delete(`/api/categories/${id}`);
      toast.success('Category deleted successfully!');
      fetchCategories();
      if (editingCategory?.id === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Failed to delete category', error);
      // Show meaningful message from backend
      toast.error(error.response?.data?.message || 'Cannot delete category because it is in use.');
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    reset({
      name: '',
      type: 'EXPENSE',
      color: '#3B82F6',
      icon: 'Folder'
    });
  };

  // Common colors to pick
  const colorPalette = [
    '#EF4444', '#F59E0B', '#10B981', '#06B6D4', 
    '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', 
    '#64748B', '#14B8A6'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Categories</h1>
        <p className="text-slate-400 text-sm">Create and modify income and expense classification categories.</p>
      </div>

      {/* Main Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Categories List (Span 2) */}
        <div className="lg:col-span-2 glass-panel p-5">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Your Categories</h3>

          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className={`
                    p-4 rounded-xl border flex items-center justify-between transition-all duration-200
                    ${editingCategory?.id === cat.id 
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-md shadow-blue-500/5' 
                      : 'bg-slate-900/20 border-slate-800 hover:border-slate-700/60'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    >
                      {cat.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">{cat.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block
                        ${cat.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}
                      `}>
                        {cat.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800/60 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-800/60 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Tag className="w-12 h-12 text-slate-600" />
              <p className="font-semibold text-slate-400 text-sm">No custom categories found.</p>
              <p className="text-xs text-slate-500">Create one on the right to start grouping transactions.</p>
            </div>
          )}
        </div>

        {/* Right Side: Add/Edit Form (Span 1) */}
        <div className="glass-panel p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>
            {editingCategory && (
              <button 
                onClick={resetForm}
                className="p-1 rounded-lg hover:bg-slate-850 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Category Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Groceries, Dividends"
                {...register('name', { required: 'Category name is required' })}
                className="w-full glass-input"
              />
              {errors.name && (
                <p className="text-rose-500 text-xs mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Category Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Category Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`
                  flex items-center justify-center py-2 rounded-lg border font-semibold text-xs cursor-pointer transition-all duration-200
                  ${selectedType === 'EXPENSE' 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-md shadow-rose-500/5' 
                    : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:border-slate-700'}
                `}>
                  <input type="radio" value="EXPENSE" {...register('type')} className="sr-only" />
                  Expense
                </label>
                <label className={`
                  flex items-center justify-center py-2 rounded-lg border font-semibold text-xs cursor-pointer transition-all duration-200
                  ${selectedType === 'INCOME' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5' 
                    : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:border-slate-700'}
                `}>
                  <input type="radio" value="INCOME" {...register('type')} className="sr-only" />
                  Income
                </label>
              </div>
            </div>

            {/* Color Palette Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Theme Color
              </label>
              <div className="flex flex-wrap gap-2.5">
                {colorPalette.map((col) => (
                  <label 
                    key={col} 
                    className="w-6 h-6 rounded-full cursor-pointer border border-transparent hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
                    style={{ backgroundColor: col }}
                  >
                    <input 
                      type="radio" 
                      value={col} 
                      {...register('color')} 
                      className="sr-only" 
                    />
                    {watch('color') === col && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Icon Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Icon Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Utensils, Home, Zap"
                {...register('icon')}
                className="w-full glass-input"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {editingCategory && (
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
                    {editingCategory ? 'Update' : 'Create'}
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

export default Categories;
