import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { User, Mail, Calendar, Shield, Loader2, Award, Activity } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      // Get summary stats
      const today = new Date();
      const response = await apiClient.get(`/api/dashboard/summary?month=${today.getMonth() + 1}&year=${today.getFullYear()}`);
      
      // Get categories count
      const catRes = await apiClient.get('/api/categories');
      
      setStats({
        balance: parseFloat(response.data.currentBalance),
        categoriesCount: catRes.data.length
      });
    } catch (error) {
      console.error('Failed to load profile statistics', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Profile Settings</h1>
        <p className="text-slate-400 text-sm">Manage your profile context details and security configurations.</p>
      </div>

      {/* Profile Overview Card */}
      <div className="glass-panel p-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-3xl text-white shadow-xl shadow-blue-500/10">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-slate-100">{user?.name}</h2>
            <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              {user?.email}
            </p>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-2 pt-1">
              <Calendar className="w-4 h-4 text-slate-650" />
              Member since: {formatDate(user?.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Account Stats Panel */}
      <div className="grid grid-cols-2 gap-4">
        {/* Lifetime savings balance */}
        <div className="glass-panel p-5 space-y-2 relative overflow-hidden">
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-emerald-500/5 rounded-full blur-xl"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Net Savings Value</span>
          {loading ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <p className="text-xl font-bold text-slate-200">${stats?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</p>
          )}
        </div>

        {/* Categories configured */}
        <div className="glass-panel p-5 space-y-2 relative overflow-hidden">
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-purple-500/5 rounded-full blur-xl"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Categories</span>
          {loading ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <p className="text-xl font-bold text-slate-200">{stats?.categoriesCount || 0} Categories</p>
          )}
        </div>
      </div>

      {/* Security Info Card */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Security & Session</h3>
        </div>

        <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
          <p>
            Your account is secured using standard <span className="font-semibold text-slate-350">JWT stateless authentication</span>. 
            All transactions and personal finance records are encrypted and bounded dynamically at the database level by user identifiers.
          </p>
          <p className="text-slate-500 italic text-[11px]">
            Password updates and accounts settings are locked under read-only mode for safety.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
