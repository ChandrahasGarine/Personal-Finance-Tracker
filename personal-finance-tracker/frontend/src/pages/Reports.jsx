import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { FileText, Download, Calendar, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Reports = () => {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [preview, setPreview] = useState(null);

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
    fetchReportPreview();
  }, [month, year]);

  const fetchReportPreview = async () => {
    setLoadingPreview(true);
    try {
      const response = await apiClient.get(`/api/dashboard/summary?month=${month}&year=${year}`);
      setPreview(response.data);
    } catch (error) {
      console.error('Failed to load summary preview', error);
      toast.error('Failed to retrieve statement preview.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await apiClient.get(`/api/reports/monthly/pdf?month=${month}&year=${year}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `WealthWise_Report_${year}_${month}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PDF statement downloaded successfully!');
    } catch (error) {
      console.error('Failed to download PDF report', error);
      toast.error('Failed to download PDF report statement.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadCSV = async () => {
    setDownloadingCSV(true);
    try {
      const response = await apiClient.get(`/api/reports/monthly/csv?month=${month}&year=${year}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `WealthWise_Report_${year}_${month}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV statement downloaded successfully!');
    } catch (error) {
      console.error('Failed to download CSV report', error);
      toast.error('Failed to download CSV report statement.');
    } finally {
      setDownloadingCSV(false);
    }
  };

  const currentMonthName = monthsList.find(m => m.value === month)?.name;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Statements & Reports</h1>
        <p className="text-slate-400 text-sm">Download comprehensive monthly financial statements in CSV or PDF formats.</p>
      </div>

      {/* Select Month and Year Card */}
      <div className="glass-panel p-5 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Export Period Settings</h3>
            <p className="text-[10px] text-slate-500">Pick target statement month and year.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Month Selector */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="appearance-none w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 pr-10 text-sm text-slate-200 focus:outline-none"
            >
              {monthsList.map(m => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
            <Calendar className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          {/* Year Selector */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="appearance-none w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 pr-10 text-sm text-slate-200 focus:outline-none"
            >
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <Calendar className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid: Preview and Download Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Preview Panel (Span 2) */}
        <div className="md:col-span-2 glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Statement Preview: {currentMonthName} {year}
          </h3>

          {loadingPreview ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : preview ? (
            <div className="space-y-5">
              {/* Preview Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Income</span>
                  <span className="text-sm font-bold text-emerald-400">${parseFloat(preview.totalIncome).toFixed(2)}</span>
                </div>
                <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Expenses</span>
                  <span className="text-sm font-bold text-rose-400">${parseFloat(preview.totalExpense).toFixed(2)}</span>
                </div>
                <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Net Flow</span>
                  <span className={`text-sm font-bold ${preview.totalIncome - preview.totalExpense >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${(preview.totalIncome - preview.totalExpense).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Top Expenses Category */}
              <div className="p-4 bg-slate-900/10 border border-slate-850/50 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category Expenses breakdown</h4>
                {preview.categoryExpenses.length > 0 ? (
                  <div className="space-y-2">
                    {preview.categoryExpenses.slice(0, 3).map((cat, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                          <span className="text-slate-300 font-semibold">{cat.categoryName}</span>
                        </div>
                        <span className="text-slate-400 font-bold">${parseFloat(cat.amount).toFixed(2)} ({cat.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <AlertCircle className="w-4 h-4" />
                    No expense records found for this period.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Download triggers panel */}
        <div className="glass-panel p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Export formats</h3>
            <p className="text-xs text-slate-500">Choose your preferred format. All files are generated dynamically from your database records.</p>
          </div>

          <div className="space-y-3">
            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF || downloadingCSV || loadingPreview}
              className="w-full glass-btn-primary py-3 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {downloadingPDF ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4.5 h-4.5" />
                  Download PDF Report
                </>
              )}
            </button>

            {/* Download CSV */}
            <button
              onClick={handleDownloadCSV}
              disabled={downloadingPDF || downloadingCSV || loadingPreview}
              className="w-full glass-btn-secondary py-3 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {downloadingCSV ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Generating CSV...
                </>
              ) : (
                <>
                  <Download className="w-4.5 h-4.5" />
                  Download CSV Ledger
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
