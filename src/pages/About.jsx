import { motion } from 'framer-motion';
import { Shield, Target, Users, Globe, Rocket, Heart } from 'lucide-react';
import Footer from '../components/Layout/Footer';
import { Link } from 'react-router-dom';

const About = () => {
  const team = [
    { name: 'Marcus Sterling', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
    { name: 'Elena Vance', role: 'Head of AI Engineering', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
    { name: 'Julian Thorne', role: 'Director of Security', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-body transition-colors duration-500 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6"
          >
            <Globe size={14} /> Our Mission
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-slate-900 mb-8"
          >
            Democratizing <span className="text-indigo-600">Wealth Intelligence</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-bold max-w-3xl mx-auto leading-relaxed"
          >
            Aura Finance was born from a simple belief: institutional-grade financial tools shouldn't be reserved for the 1%. We're building the infrastructure for the next generation of independent wealth.
          </motion.p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-8">
                <Shield size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4 font-headline uppercase tracking-tight">Radical Security</h3>
              <p className="text-slate-500 font-bold leading-relaxed">We employ bank-grade encryption and decentralized data protocols to ensure your financial identity belongs to you, and only you.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-8">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4 font-headline uppercase tracking-tight">Deep Clarity</h3>
              <p className="text-slate-500 font-bold leading-relaxed">Our AI intelligence cuts through the noise of raw data to provide actionable, easy-to-understand insights that drive growth.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mb-8">
                <Heart size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4 font-headline uppercase tracking-tight">User Centric</h3>
              <p className="text-slate-500 font-bold leading-relaxed">Every feature we build starts with a human need. We're not just building software; we're building better financial futures.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-slate-900 mb-4">The Minds Behind <span className="text-indigo-600">Aura</span></h2>
            <p className="text-slate-500 font-bold">A global team of engineers, designers, and financial experts.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-[3rem] bg-white p-4 shadow-xl shadow-slate-200/50"
              >
                <div className="aspect-square overflow-hidden rounded-[2.5rem] mb-6">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <div className="px-4 pb-4">
                  <h3 className="text-xl font-black text-slate-800">{member.name}</h3>
                  <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black mb-8 font-headline tracking-tight">Ready to see what <span className="text-indigo-600">Aura</span> can do for you?</h2>
          <Link to="/" className="inline-block px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all hover:scale-105">
            Get Started Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
