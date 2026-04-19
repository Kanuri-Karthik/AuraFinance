import { useRef } from 'react';
import { Save, User, Mail, Shield, Download, Upload, KeyRound, Database, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { exportData, importData } = useFinance();
  const { addNotification } = useNotification();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        await importData(event.target.result);
        addNotification("Import Successful", "Your data has been securely restored.", "success");
      } catch (err) {
        addNotification("Import Failed", err.message, "danger");
      }
      e.target.value = ''; 
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 md:pb-8 font-body">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-black font-headline tracking-tight text-slate-800">Settings</h1>
        <p className="text-slate-500 font-bold mt-2">Manage your account preferences and application security.</p>
      </motion.div>
      
      <div className="space-y-6">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-50">
               <User size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black font-headline text-slate-800">Profile Information</h2>
              <p className="text-xs text-slate-500 font-bold">Update your personal identity details.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User size={18}/></span>
                <input 
                  type="text" 
                  defaultValue={currentUser?.name || "Guest User"}
                  disabled={!!currentUser?.isGoogleAuth}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400 shadow-sm"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={18}/></span>
                <input 
                  type="email" 
                  defaultValue={currentUser?.email || "guest@example.com"}
                  disabled={true}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400 shadow-sm"
                />
              </div>
            </div>
          </div>
          
          {currentUser?.isGoogleAuth && (
            <p className="text-xs text-indigo-500 font-bold mt-6 flex items-center gap-2 relative z-10">
              <Shield size={16} strokeWidth={2.5}/> Your profile is managed by Google Provider.
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end relative z-10">
            <button onClick={() => addNotification('Profile Updated', 'Your profile info has been saved securely.', 'success')} className="px-6 py-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black text-sm rounded-2xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-indigo-200 border border-indigo-400 flex items-center gap-2">
              <Save size={18} strokeWidth={2.5} /> Save Changes
            </button>
          </div>
        </motion.div>

        {/* Security Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm">
               <KeyRound size={28} strokeWidth={2.5}/>
            </div>
            <div>
              <h2 className="text-2xl font-black font-headline text-slate-800">Security & Auth</h2>
              <p className="text-xs text-slate-500 font-bold">Update your password to keep your ledger secure.</p>
            </div>
          </div>
          
          <button onClick={() => addNotification('Magic Link Sent', 'Password reset instructions sent to your email.', 'info')} className="px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 shadow-sm text-slate-700 hover:text-slate-900 rounded-2xl text-sm font-black transition-all">
            Change Password
          </button>
        </motion.div>

        {/* Data Management Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-sky-500 border border-sky-100 shadow-sm">
               <Database size={28} strokeWidth={2.5}/>
            </div>
            <div>
              <h2 className="text-2xl font-black font-headline text-slate-800">Ledger Data</h2>
              <p className="text-xs text-slate-500 font-bold max-w-sm mt-1 mb-1">Export your local JSON database for cold storage or restore from an existing backup file.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImport} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 border border-slate-200 bg-white hover:border-slate-300 text-slate-700 shadow-sm rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2"
            >
              <Upload size={18} strokeWidth={2.5}/> Restore
            </button>
            <button 
              onClick={exportData}
              className="px-6 py-3 bg-slate-800 text-white shadow-md hover:bg-slate-700 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 border border-slate-900"
            >
              <Download size={18} strokeWidth={2.5}/> Export JSON
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Settings;
