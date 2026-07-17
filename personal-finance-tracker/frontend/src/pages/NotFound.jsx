import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowRight } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6 px-4">
      <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-xl shadow-blue-500/5">
        <HelpCircle className="w-10 h-10 animate-bounce" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-white">404 - Not Found</h1>
        <p className="text-slate-400 text-sm max-w-sm">
          The page you are looking for doesn't exist or has been moved to another location.
        </p>
      </div>

      <Link to="/" className="glass-btn-primary py-2.5 px-6 flex items-center gap-2 text-sm">
        Return Home
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default NotFound;
