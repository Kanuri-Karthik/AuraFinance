import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, Phone, Search, ChevronDown, CheckCircle2, LifeBuoy, ShieldCheck, Zap } from 'lucide-react';
import Footer from '../components/Layout/Footer';
import { useNotification } from '../context/NotificationContext';

const Support = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const faqs = [
    { q: "How secure is my financial data?", a: "We use AES-256 bank-grade encryption and never store your raw login credentials. Your data is anonymized and encrypted before it ever touches our servers." },
    { q: "Can I connect multiple bank accounts?", a: "Yes! Aura Finance supports over 15,000 global financial institutions. You can connect as many accounts as you need to get a complete picture of your wealth." },
    { q: "Is there a mobile app?", a: "Our web platform is fully responsive and optimized for mobile browsers. A native iOS and Android experience is currently in the late stages of our roadmap." },
    { q: "How does the AI assistant help me?", a: "Aura AI analyzes your spending patterns to identify savings opportunities, suspicious activity, and net worth trends you might have missed." },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    addNotification('Ticket Submitted', 'Our elite support team will contact you within 24 hours.', 'success');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-body transition-colors duration-500 overflow-x-hidden">
      {/* Header */}
      <section className="pt-32 pb-16 px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6"
          >
            <LifeBuoy size={14} /> Aura Concierge
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter text-slate-900 mb-8">How can we <span className="text-indigo-600">help you</span> today?</h1>
          
          <div className="max-w-2xl mx-auto relative mt-12">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for answers (e.g. 'encryption', 'payouts')..." 
              className="w-full h-16 pl-14 pr-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
            />
          </div>
        </div>
      </section>

      {/* Support Tiers */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <Mail size={28} />
            </div>
            <h3 className="text-xl font-black mb-2">Email Support</h3>
            <p className="text-sm text-slate-500 font-bold mb-6">Reach out to our specialists for complex inquiries.</p>
            <span className="text-indigo-600 font-black text-sm">support@aurafinance.io</span>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-indigo-100/50 flex flex-col items-center text-center scale-105 z-10">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-xl font-black mb-2">Live Concierge</h3>
            <p className="text-sm text-slate-500 font-bold mb-6">Instant support for Premium and Enterprise users.</p>
            <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-all">Start Chat</button>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <Phone size={28} />
            </div>
            <h3 className="text-xl font-black mb-2">Priority Call</h3>
            <p className="text-sm text-slate-500 font-bold mb-6">Scheduled callbacks for strategic account reviews.</p>
            <span className="text-slate-700 font-black text-sm">+1 (888) AURA-FIN</span>
          </div>
        </div>
      </section>

      {/* FAQ and Contact Form */}
      <section className="py-20 px-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
          
          <div>
            <h2 className="text-3xl font-black font-headline tracking-tight mb-12">Frequently Asked <span className="text-indigo-600">Questions</span></h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={20} className={`text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-5 text-sm text-slate-500 font-bold leading-relaxed border-t border-slate-50"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-200 shadow-inner">
              <h2 className="text-3xl font-black font-headline tracking-tight mb-4">Send a <span className="text-indigo-600">Message</span></h2>
              <p className="text-slate-500 font-bold mb-8">Can't find what you're looking for? Complete the request form below.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400 pl-2">Full Name</label>
                    <input 
                      type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full h-14 px-5 rounded-xl bg-white border border-slate-200 font-bold outline-none focus:border-indigo-500 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400 pl-2">Email Address</label>
                    <input 
                      type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full h-14 px-5 rounded-xl bg-white border border-slate-200 font-bold outline-none focus:border-indigo-500 shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 pl-2">Subject</label>
                  <input 
                    type="text" required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full h-14 px-5 rounded-xl bg-white border border-slate-200 font-bold outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 pl-2">How can we help?</label>
                  <textarea 
                    rows="4" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full p-5 rounded-xl bg-white border border-slate-200 font-bold outline-none focus:border-indigo-500 shadow-sm resize-none"
                  ></textarea>
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Send Submission
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Support;
