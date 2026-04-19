import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const { addNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "Guest User",
        email: currentUser.email || "guest@example.com"
      });
    }
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (updateProfile) {
      updateProfile({ name: formData.name, email: formData.email });
    }
    addNotification('Profile Saved', 'Your basic information has been updated successfully.', 'success');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 md:pb-8 font-body relative">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-black font-headline tracking-tight text-slate-800">My Profile</h1>
        <p className="text-slate-500 font-bold mt-2">Manage your personal information and identity preferences.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Identity Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="md:col-span-4 bg-white/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white relative overflow-hidden flex flex-col items-center justify-center text-center group shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none"></div>
          
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center text-4xl font-headline font-black text-indigo-600 shadow-lg border-4 border-white overflow-hidden relative mb-6">
            {currentUser?.picture ? (
              <img src={currentUser.picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U')
            )}
            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          
          <h2 className="text-2xl font-black font-headline text-slate-800 mb-1">{currentUser?.name || "Guest User"}</h2>
          <p className="text-sm font-bold text-slate-500 mb-6">{currentUser?.email || "guest@example.com"}</p>
          
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black font-headline uppercase tracking-widest rounded-full border border-indigo-100 shadow-sm">
            {currentUser?.isGoogleAuth ? <Shield size={14} strokeWidth={2.5}/> : <User size={14} strokeWidth={2.5}/>}
            {currentUser?.isGoogleAuth ? "Google Auth" : "Standard Account"}
          </div>
        </motion.div>

        {/* Edit Profile Form */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="md:col-span-8 bg-white/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6 relative z-10">
             <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-sky-500 border border-sky-100 shadow-sm">
               <User size={28} strokeWidth={2.5}/>
             </div>
             <h3 className="text-2xl font-black font-headline text-slate-800">Personal Information</h3>
          </div>
          
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-3 col-span-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User size={18}/></span>
                  <input 
                    type="text" 
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={false}
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400 shadow-sm"
                  />
                </div>
              </div>
              
               <div className="space-y-3 col-span-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={18}/></span>
                  <input 
                    type="email" 
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={false}
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400 shadow-sm"
                  />
                  {currentUser?.isGoogleAuth && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500" title="Verified by Google"><CheckCircle size={18} strokeWidth={2.5}/></div>}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 flex justify-end">
              <button 
                type="submit" 
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black text-sm rounded-2xl disabled:opacity-50 hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-indigo-200 border border-indigo-400 flex items-center justify-center gap-2"
              >
                <Save size={18} strokeWidth={2.5}/> Save Changes
              </button>
            </div>
          </form>
        </motion.div>
        
      </div>
    </div>
  );
};

export default Profile;
