import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  AlertTriangle, Plus, ArrowRight, Calendar, Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
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

  useEffect(() => {
    fetchDashboardData();
  }, [month, year]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/dashboard/summary?month=${month}&year=${year}`);
      setData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      toast.error('Failed to load financial statistics.');
    } finally {
      setLoading(false);
    }
  };

  // Pie chart colors
  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#6B7280'];

  if (loading && !data) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const {
    totalIncome = 0,
    totalExpense = 0,
    currentBalance = 0,
    recentTransactions = [],
    categoryExpenses = [],
    monthlyTrends = [],
    budgetUsagePercentage = 0,
    remainingBudget = 0,
    overBudgetCategories = []
  } = data || {};

  // Format Recharts Pie data
  const pieData = categoryExpenses.map((c, index) => ({
    name: c.categoryName,
    value: parseFloat(c.amount),
    color: c.color || COLORS[index % COLORS.length]
  }));

  // Format Recharts Bar data
  const barData = monthlyTrends.map(t => ({
    name: t.monthName,
    Income: parseFloat(t.income),
    Expense: parseFloat(t.expense)
  }));

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Financial Summary</h1>
          <p className="text-slate-400 text-sm">Monitor your income, expenses, and monthly budget targets.</p>
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Month Selector */}
          <div className="relative">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="appearance-none bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 pr-10 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
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
              className="appearance-none bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 pr-10 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <Calendar className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          <Link to="/transactions/add" className="glass-btn-primary py-2 px-4 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add
          </Link>
        </div>
      </div>

      {/* Over-Budget Alert Banner */}
      {overBudgetCategories.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Over-budget warning!</span> You have exceeded your budget limits in{' '}
            <span className="font-semibold">{overBudgetCategories.map(c => c.categoryName).join(', ')}</span>.
          </div>
        </div>
      )}

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Net Balance Card */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute -top-3 -right-3 w-16 h-16 bg-blue-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Balance</span>
            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-400 border border-blue-500/10">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-white">${parseFloat(currentBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Lifetime net savings balance</span>
        </div>

        {/* Income Card */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute -top-3 -right-3 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Income</span>
            <div className="p-2 bg-emerald-600/10 rounded-lg text-emerald-400 border border-emerald-500/10">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-white">${parseFloat(totalIncome).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">{monthsList.find(m => m.value === month)?.name}</span> intake
          </span>
        </div>

        {/* Expenses Card */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute -top-3 -right-3 w-16 h-16 bg-rose-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Expenses</span>
            <div className="p-2 bg-rose-600/10 rounded-lg text-rose-400 border border-rose-500/10">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-white">${parseFloat(totalExpense).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1">
            <span className="text-rose-400 font-semibold">{monthsList.find(m => m.value === month)?.name}</span> expenditures
          </span>
        </div>

        {/* Remaining Budget Card */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute -top-3 -right-3 w-16 h-16 bg-purple-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Budget</span>
            <div className="p-2 bg-purple-600/10 rounded-lg text-purple-400 border border-purple-500/10">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-white">${parseFloat(remainingBudget).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="w-full bg-slate-800 rounded-full h-1 mt-2.5">
            <div 
              className={`h-1 rounded-full ${budgetUsagePercentage > 100 ? 'bg-red-500' : budgetUsagePercentage > 85 ? 'bg-amber-500' : 'bg-purple-500'}`} 
              style={{ width: `${Math.min(budgetUsagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-8 glass-panel p-5">
          <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Income vs Expenses Trends ({year})</h3>
          <div className="h-80 w-full text-xs">
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No trend data available.</div>
            )}
          </div>
        </div>

        {/* Expenses by Category Pie Chart */}
        <div className="lg:col-span-4 glass-panel p-5">
          <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Expenses by Category</h3>
          <div className="h-80 w-full text-xs relative flex flex-col justify-center items-center">
            {categoryExpenses.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Category Legends */}
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2 max-h-24 overflow-y-auto w-full px-2">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span className="truncate max-w-[80px]">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-slate-500 text-center">No expense categories available for this period.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions and Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-7 glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Recent Transactions</h3>
            <Link to="/transactions" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl hover:border-slate-700/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: `${t.category.color}15`, color: t.category.color }}>
                      {t.category.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{t.description || t.category.name}</p>
                      <span className="text-[10px] text-slate-500">{t.transactionDate}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">No recent transactions found.</div>
            )}
          </div>
        </div>

        {/* Budget usage list */}
        <div className="lg:col-span-5 glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Budget Status</h3>
            <Link to="/budgets" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
              Manage
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {categoryExpenses.length > 0 ? (
              // Display budget details for configured categories
              data.overBudgetCategories.length > 0 || data.remainingBudget > 0 ? (
                // If dashboard returns over budget or status info, use it. We'll fall back to listing budgets programmatically
                data.overBudgetCategories.concat(
                  categoryExpenses
                    .filter(c => !overBudgetCategories.some(o => o.categoryName === c.categoryName))
                    // map to status DTO style if possible or mock
                ).slice(0, 4).map((b, index) => {
                  const limit = parseFloat(b.limit || 0);
                  const spent = parseFloat(b.spent || b.amount || 0);
                  const pct = limit > 0 ? (spent / limit) * 100 : 0;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">{b.categoryName}</span>
                        <span className="text-slate-400">
                          ${spent.toFixed(0)} {limit > 0 ? `/ $${limit.toFixed(0)}` : '(No limit)'}
                        </span>
                      </div>
                      {limit > 0 ? (
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${pct > 100 ? 'bg-red-500' : pct > 85 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          ></div>
                        </div>
                      ) : (
                        <div className="w-full bg-slate-800/40 rounded-full h-1.5"></div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">No active budgets found for this month.</div>
              )
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">No expenses tracked yet for this month.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
