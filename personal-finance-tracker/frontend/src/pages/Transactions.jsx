import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { 
  Plus, Edit2, Trash2, Search, Filter, Calendar, 
  ChevronLeft, ChevronRight, Loader2, ArrowLeftRight
} from 'lucide-react';
import { toast } from 'react-toastify';

const Transactions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filtering & Pagination State
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('transactionDate');
  const [direction, setDirection] = useState('DESC');

  // Delete Confirm Dialog State
  const [showConfirm, setShowConfirm] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [type, category, startDate, endDate, page, sortBy, direction]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = `/api/transactions?page=${page}&size=${pageSize}&sortBy=${sortBy}&direction=${direction}`;
      if (type) url += `&type=${type}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await apiClient.get(url);
      setTransactions(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to load transactions', error);
      toast.error('Failed to retrieve transactions list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setType('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setPage(0);
  };

  const openDeleteConfirm = (tx) => {
    setTxToDelete(tx);
    setShowConfirm(true);
  };

  const handleDeleteTransaction = async () => {
    if (!txToDelete) return;
    try {
      await apiClient.delete(`/api/transactions/${txToDelete.id}`);
      toast.success('Transaction deleted successfully!');
      fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction', error);
      toast.error('Failed to delete transaction.');
    } finally {
      setShowConfirm(false);
      setTxToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Transactions</h1>
          <p className="text-slate-400 text-sm">View, search, and manage your financial transactions ledger.</p>
        </div>
        <Link 
          to="/transactions/add" 
          className="glass-btn-primary flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </Link>
      </div>

      {/* Filter and Search Box */}
      <div className="glass-panel p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input pl-10"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(0); }}
              className="w-full glass-input appearance-none"
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(0); }}
              className="w-full glass-input appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name} ({cat.type})</option>
              ))}
            </select>
          </div>

          {/* Search Trigger Buttons */}
          <div className="flex gap-2">
            <button type="submit" className="glass-btn-primary flex-1 text-sm py-2">
              Apply
            </button>
            <button 
              type="button" 
              onClick={handleResetFilters}
              className="glass-btn-secondary text-sm py-2 px-3"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Date Filters */}
        <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-slate-800/40 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
              className="glass-input py-1.5 px-3 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
              className="glass-input py-1.5 px-3 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-medium">
                      {tx.transactionDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}
                      `}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tx.category.color }}></div>
                        <span className="text-slate-300">{tx.category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                      {tx.description || <span className="text-slate-600 italic">No description</span>}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold 
                      ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}
                    `}>
                      {tx.type === 'INCOME' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/transactions/edit/${tx.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-850 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-850 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <ArrowLeftRight className="w-12 h-12 text-slate-600" />
            <p className="font-semibold text-slate-400 text-sm">No transactions matches found.</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page <span className="font-semibold text-slate-300">{page + 1}</span> of{' '}
              <span className="font-semibold text-slate-300">{totalPages}</span>
            </span>

            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                className="p-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/50 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                className="p-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/50 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-panel p-6 space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Delete Transaction</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete this transaction of{' '}
                <span className="font-bold text-slate-300">
                  ${parseFloat(txToDelete?.amount).toFixed(2)}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="glass-btn-secondary flex-1 text-sm py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTransaction}
                className="bg-rose-600 hover:bg-rose-500 text-white font-medium flex-1 text-sm py-2 rounded-xl active:scale-98 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
