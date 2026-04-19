import { Link } from 'react-router-dom';
import { Globe, AtSign } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-100 pt-24 pb-12 px-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24 mb-24">
          <div className="col-span-1">
            <Link to="/" className="text-3xl font-black text-[#5046e5] font-headline mb-8 block tracking-tight">
              Aura Finance
            </Link>
            <p className="text-slate-500 font-bold text-[15px] leading-relaxed mb-8 max-w-[280px]">
              Providing institutional-grade wealth management tools for the modern independent investor.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                <Globe size={18} className="text-slate-400" />
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                <AtSign size={18} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="md:pl-10">
            <h4 className="font-black text-slate-900 mb-8 font-headline text-lg tracking-tight">Product</h4>
            <ul className="space-y-4">
              <li><Link className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors" to="#">Wealth Engine</Link></li>
              <li><Link className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors" to="#">Risk Analysis</Link></li>
              <li><Link className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors" to="#">Global Markets</Link></li>
              <li><Link className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors" to="#">Enterprise</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 mb-8 font-headline text-lg tracking-tight">Company</h4>
            <ul className="space-y-4">
              <li><Link className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors" to="/about">About Us</Link></li>
              <li><Link className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors" to="#">Security</Link></li>
              <li><Link className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors" to="#">Careers</Link></li>
              <li><Link className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors" to="#">Press Kit</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 mb-8 font-headline text-lg tracking-tight">Connect</h4>
            <ul className="space-y-4">
              <li><Link className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors" to="#">Twitter</Link></li>
              <li><Link className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors" to="#">LinkedIn</Link></li>
              <li><Link className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors" to="/support">Contact Support</Link></li>
              <li><Link className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors" to="#">API Docs</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[13px] text-slate-400 font-bold">
            © 2024 Aura Finance Wealth Management. All rights reserved.
          </p>
          <div className="flex gap-10">
            <Link className="text-[13px] text-slate-400 hover:text-slate-600 font-bold transition-colors" to="/privacy">Privacy Policy</Link>
            <Link className="text-[13px] text-slate-400 hover:text-slate-600 font-bold transition-colors" to="/terms">Terms of Service</Link>
            <Link className="text-[13px] text-slate-400 hover:text-slate-600 font-bold transition-colors" to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
