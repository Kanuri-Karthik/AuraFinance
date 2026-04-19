import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Bell, Settings, BarChart3, Eye, Wallet, PieChart, Rocket, 
  TrendingUp, BrainCircuit, Shield, Target, Building2, Bot, 
  Bitcoin, Users, Globe, AtSign, MessageSquare, X
} from 'lucide-react';
import Modal from '../components/UI/Modal';
import Typewriter from '../components/UI/Typewriter';
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';
import AIChatbot from '../components/UI/AIChatbot';
import Footer from '../components/Layout/Footer';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { currentUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const authType = searchParams.get('auth');
    if (authType === 'login' || authType === 'signup') {
      setAuthMode(authType);
      setIsAuthModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setInterval(() => {
       setCurrentSlide((prev) => (prev + 1) % 5);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
    if (searchParams.has('auth')) {
      navigate('/', { replace: true });
    }
  };

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const slideVariants = {
    enter: { opacity: 0, y: 30, scale: 0.95 },
    center: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -30, scale: 0.95 }
  };

  return (
    <div className="min-h-screen text-slate-800 font-body selection:bg-indigo-500 selection:text-white overflow-x-hidden relative bg-sky-50/50 flex flex-col">
      
      {/* Background Video Layer */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-40 blur-[2px]"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-blue-and-pink-liquid-background-animation-32598-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
      </div>

      {/* Massive Vibrant Background Mesh for Landing */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[50rem] h-[50rem] bg-indigo-500/40 rounded-full blur-[140px] mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] left-[-10%] w-[45rem] h-[45rem] bg-sky-400/50 rounded-full blur-[130px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] right-[10%] w-[40rem] h-[40rem] bg-fuchsia-400/30 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[55rem] h-[55rem] bg-purple-500/30 rounded-full blur-[150px] mix-blend-multiply animate-blob"></div>
      </div>

      {/* Container that blurs when Modal is open */}
      <div className={`transition-all duration-500 ease-in-out ${isAuthModalOpen ? 'blur-[3px] brightness-[0.85] transform scale-[0.99] pointer-events-none' : ''}`}>
        
        {/* TopNavBar */}
        <nav className="fixed top-0 w-full z-40 flex justify-between items-center px-4 md:px-8 h-20 bg-white/60 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="flex items-center gap-4 md:gap-12">
          <span className="text-xl md:text-2xl font-black tracking-tight text-indigo-600 font-headline whitespace-nowrap">Aura Finance</span>
          <div className="hidden md:flex gap-8 items-center">
            <Link to="/dashboard" className="text-indigo-600 font-black font-label text-sm transition-all duration-300 hover:text-indigo-700">Dashboard</Link>
            <a className="text-slate-500 font-bold hover:text-slate-800 px-3 py-1.5 transition-all duration-300 font-label text-sm" href="#features">Features</a>
            <a className="text-slate-500 font-bold hover:text-slate-800 px-3 py-1.5 transition-all duration-300 font-label text-sm" href="#roadmap">Roadmap</a>
            <a className="text-slate-500 font-bold hover:text-slate-800 px-3 py-1.5 transition-all duration-300 font-label text-sm" href="#pricing">Pricing</a>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-3 md:gap-6 text-slate-700">
            {currentUser?.role === 'Super Admin' && (
              <Link to="/admin" className="text-indigo-600 hover:text-indigo-800 font-label text-xs md:text-sm transition-all duration-300 flex items-center gap-1.5 font-black border border-indigo-200 px-3 md:px-4 py-2 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 shadow-sm backdrop-blur-md">
                <Shield size={16} strokeWidth={2.5}/> <span className="hidden sm:inline">Admin Portal</span><span className="sm:hidden">Admin</span>
              </Link>
            )}
          </div>
          <button 
            onClick={openLogin}
            className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-black font-label text-xs md:text-sm shadow-md shadow-indigo-200 hover:-translate-y-0.5 active:scale-95 border border-indigo-400 transition-all duration-200 whitespace-nowrap"
          >
            Sign In
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col pt-24 min-h-screen lg:min-h-0">
        
        <section className="max-w-[1600px] w-full mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-24 flex-1 py-10 lg:py-0 min-h-[calc(100vh-100px)]">
          {/* Left Hero Content */}
          <div className="w-full lg:w-5/12 text-left z-20 flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md shadow-sm border border-white mb-8 w-max"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_5px_rgba(99,102,241,0.5)]"></span>
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-600">Intelligence in Motion</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-black font-headline tracking-tighter text-slate-800 mb-8 leading-[1.1] min-h-[140px] lg:min-h-[180px]"
            >
              Master Your Money with <br />
              <Typewriter 
                words={['Aura Finance', 'AI Intelligence', 'Absolute Clarity', 'Elite Tools']} 
                className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-indigo-500 to-sky-500 drop-shadow-xl"
              />
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-bold text-slate-500 max-w-xl mb-12 font-body leading-relaxed"
            >
              Experience the future of personal finance. A high-end digital curatorship where your data glows with actionable intelligence and absolute security.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-5"
            >
              <button 
                onClick={openSignup}
                className="px-8 py-4 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white rounded-2xl font-black text-lg shadow-[0_20px_40px_rgba(139,92,246,0.3)] border border-indigo-400 hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(139,92,246,0.4)] transition-all duration-300 w-full sm:w-auto"
              >
                Start Tracking Now
              </button>
              <Link to="/dashboard" className="px-8 py-4 bg-white/40 backdrop-blur-2xl hover:bg-white/80 text-indigo-900 border-2 border-white/60 hover:text-indigo-600 rounded-2xl font-black text-lg shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 w-full sm:w-auto text-center">
                View Demo
              </Link>
            </motion.div>
          </div>

          {/* Right Presentation Slideshow */}
          <div className="w-full lg:w-7/12 min-h-[600px] lg:min-h-[800px] relative z-20 flex items-center justify-center py-10">
            
            {/* Slide Navigation Dots */}
            <div className="absolute -left-6 lg:-left-12 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30 hidden sm:flex">
              {[0, 1, 2, 3, 4].map((idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-indigo-600 scale-125' : 'bg-slate-300 hover:bg-slate-400'}`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* SLIDE 0: At A Glance */}
              {currentSlide === 0 && (
                <motion.div 
                  key="slide-0"
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit" transition={{ duration: 0.5, type: 'spring' }}
                  className="w-full max-w-3xl"
                >
                  <div className="mb-6">
                    <h2 className="text-3xl font-headline font-black text-slate-800">At a Glance</h2>
                    <p className="text-slate-500 font-bold mb-6">Three pillars of financial dominance, unified in one glowing interface.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 rounded-[2rem] bg-white/40 backdrop-blur-3xl border-2 border-white/60 shadow-sm float-animation">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 mb-4 flex items-center justify-center border border-white"><Eye className="text-indigo-600" size={24}/></div>
                      <h3 className="text-xl font-headline font-black text-slate-800 mb-2">Real-time Tracking</h3>
                      <p className="text-slate-600 font-bold text-sm">Automatic sync with 15k+ banks instantly.</p>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-white/40 backdrop-blur-3xl border-2 border-white/60 shadow-sm float-animation animation-delay-2000">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 mb-4 flex items-center justify-center border border-white"><PieChart className="text-purple-600" size={24}/></div>
                      <h3 className="text-xl font-headline font-black text-slate-800 mb-2">Smart Budgeting</h3>
                      <p className="text-slate-600 font-bold text-sm">Dynamic limits tracking your lifestyle goals.</p>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-white/40 backdrop-blur-3xl border-2 border-white/60 shadow-sm sm:col-span-2 float-animation animation-delay-4000">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 mb-4 flex items-center justify-center border border-white"><TrendingUp className="text-sky-500" size={24}/></div>
                      <h3 className="text-xl font-headline font-black text-slate-800 mb-2">Deep Analytics</h3>
                      <p className="text-slate-600 font-bold text-sm">Predictive trends and net worth forecasting powered by our proprietary neural engine.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 1: Precision Engineering */}
              {currentSlide === 1 && (
                <motion.div 
                  key="slide-1"
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit" transition={{ duration: 0.5, type: 'spring' }}
                  className="w-full max-w-3xl"
                >
                  <div className="mb-6">
                    <h2 className="text-3xl font-headline font-black text-slate-800">Precision Engineering</h2>
                    <p className="text-slate-500 font-bold mb-6">Built for those who demand clarity from their complexity.</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 rounded-[2.5rem] p-8 border border-white/20 shadow-lg relative overflow-hidden text-white float-animation">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center mb-4"><BrainCircuit size={24}/></div>
                      <h3 className="text-2xl font-black mb-2">AI-Driven Intelligence</h3>
                      <p className="text-white/80 font-bold text-sm mb-6 max-w-md">Our neural engine identifies patterns you didn't know you had, providing proactive insights daily.</p>
                      <div className="flex flex-col sm:flex-row gap-4">
                         <div className="flex-1 bg-white/10 p-4 rounded-2xl shadow-inner border border-white/20">
                            <span className="text-[10px] text-sky-200 uppercase font-black">Prediction</span>
                            <div className="text-xl font-black">+ $1,240 Savings</div>
                         </div>
                         <div className="flex-1 bg-white/10 p-4 rounded-2xl shadow-inner border border-white/20">
                            <span className="text-[10px] text-fuchsia-200 uppercase font-black">Next Month</span>
                            <div className="text-xl font-black">4.2% Growth</div>
                         </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] p-6 border border-white/60 float-animation animation-delay-2000">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3"><Shield className="text-teal-600" size={20}/></div>
                        <h4 className="font-black text-slate-800 text-base mb-1">Secure Vault</h4>
                        <p className="text-xs font-bold text-slate-500">AES-256 encryption ensuring safety.</p>
                      </div>
                      <div className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] p-6 border border-white/60 float-animation animation-delay-4000">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-3"><Target className="text-rose-500" size={20}/></div>
                        <h4 className="font-black text-slate-800 text-base mb-1">Focused Goals</h4>
                        <p className="text-xs font-bold text-slate-500">Intelligent markers routing your future.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 2: Roadmap */}
              {currentSlide === 2 && (
                <motion.div 
                  key="slide-2"
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit" transition={{ duration: 0.5, type: 'spring' }}
                  className="w-full max-w-2xl bg-white/40 backdrop-blur-3xl p-6 sm:p-10 rounded-[3rem] border border-white/60 shadow-md float-animation"
                >
                  <div className="mb-10 text-center">
                    <span className="text-indigo-600 font-black tracking-widest text-[10px] uppercase block mb-1">The Future</span>
                    <h2 className="text-3xl font-headline font-black text-slate-800">Innovation Roadmap</h2>
                  </div>
                  
                  <div className="flex flex-col gap-8 relative border-l-2 border-indigo-100 ml-6 pl-8">
                    <div className="relative">
                      <div className="absolute -left-[41px] top-1 w-4 h-4 bg-indigo-500 rounded-full border-[3px] border-white shadow-sm"></div>
                      <span className="text-xs font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full absolute -top-3 right-0">Q4 2024</span>
                      <h3 className="font-black text-slate-800 text-xl flex items-center gap-2 mb-2"><Bot className="text-indigo-500" size={20}/> AI Wealth Advisor</h3>
                      <p className="text-sm text-slate-500 font-bold max-w-sm">Generative financial planning building custom strategies based on your spending.</p>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute -left-[41px] top-1 w-4 h-4 bg-sky-500 rounded-full border-[3px] border-white shadow-sm"></div>
                      <span className="text-xs font-black text-sky-500 bg-sky-50 px-3 py-1 rounded-full absolute -top-3 right-0">Q1 2025</span>
                      <h3 className="font-black text-slate-800 text-xl flex items-center gap-2 mb-2"><Bitcoin className="text-sky-500" size={20}/> Crypto Vault</h3>
                      <p className="text-sm text-slate-500 font-bold max-w-sm">Direct wallet tracking and DeFi yield monitoring.</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[41px] top-1 w-4 h-4 bg-rose-500 rounded-full border-[3px] border-white shadow-sm"></div>
                      <span className="text-xs font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full absolute -top-3 right-0">Q2 2025</span>
                      <h3 className="font-black text-slate-800 text-xl flex items-center gap-2 mb-2"><Users className="text-rose-500" size={20}/> Family Sharing</h3>
                      <p className="text-sm text-slate-500 font-bold max-w-sm">Collaborative vaults for households with granular controls.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 3: CTA */}
              {currentSlide === 3 && (
                <motion.div 
                  key="slide-3"
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit" transition={{ duration: 0.5, type: 'spring' }}
                  className="w-full max-w-2xl bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-rose-500 rounded-[3rem] p-6 sm:p-10 border border-white/20 shadow-2xl relative overflow-hidden float-animation"
                >
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-[40px]"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-[40px]"></div>
                  
                  <div className="relative z-10 text-center py-6 sm:py-10">
                    <h2 className="text-4xl font-headline font-black text-white mb-6">Ready to step into the vault?</h2>
                    <p className="text-white/80 font-bold mb-10 max-w-md mx-auto">Join 50,000+ elite investors who have already optimized their financial trajectory.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button onClick={openSignup} className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-black shadow-lg hover:scale-105 transition-transform w-full sm:w-auto">
                        Get Access Now
                      </button>
                      <button onClick={openLogin} className="px-8 py-4 bg-transparent border border-white/50 text-white rounded-xl font-black hover:bg-white/10 transition-colors w-full sm:w-auto">
                        Login
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 4: Privacy & Security */}
              {currentSlide === 4 && (
                <motion.div 
                  key="slide-4"
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit" transition={{ duration: 0.5, type: 'spring' }}
                  className="w-full max-w-4xl"
                >
                  <div className="mb-8 text-center sm:text-left">
                    <h2 className="text-3xl font-headline font-black text-slate-800">Privacy-First Design</h2>
                    <p className="text-slate-500 font-bold">Your data is yours alone. Enable "Vault Mode" to instantly cloak sensitive identifiers and balances.</p>
                  </div>

                  <div className="relative group overflow-hidden rounded-[2.5rem] bg-white border border-white shadow-xl max-w-4xl mx-auto ring-1 ring-slate-200/50 min-h-[500px] flex items-center justify-center">
                    {/* Fallback pattern while loading */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
                    
                    {/* The Actual Image */}
                    <img 
                      src="dashboard-preview.png" 
                      alt="Aura Finance Dashboard Preview" 
                      className="w-full h-full object-contain relative z-10"
                      onError={(e) => { e.target.style.display = 'none'; document.getElementById('img-error').classList.remove('hidden'); }}
                    />
                    
                    <div id="img-error" className="hidden absolute inset-0 flex items-center justify-center text-slate-400 font-bold">
                       Image asset not found. Please refresh.
                    </div>

                    {/* Blur Overlays for Privacy - Targetted at specific data/credentials */}
                    {/* Top Right Profile Info */}
                    <div className="absolute top-[2%] right-[2%] w-[16%] h-[8%] backdrop-blur-2xl bg-white/10 rounded-xl border border-white/20 shadow-sm z-20"></div>
                    
                    {/* Sidebar User Email */}
                    <div className="absolute top-[76.5%] left-[2.5%] w-[12%] h-[4.5%] backdrop-blur-2xl bg-white/20 rounded-lg z-20"></div>
                    
                    {/* Header Statistics (Growth % and Streak) */}
                    <div className="absolute top-[22.5%] left-[41%] w-[4%] h-[3.5%] backdrop-blur-lg bg-white/5 rounded-md z-20"></div>
                    <div className="absolute top-[22.5%] left-[45.5%] w-[8%] h-[3.5%] backdrop-blur-lg bg-white/5 rounded-md z-20"></div>

                    {/* Financial Balances in Row 4 (Main Balances) */}
                    <div className="absolute top-[53.5%] left-[23.5%] w-[12%] h-[7%] backdrop-blur-xl bg-white/5 rounded-2xl z-20"></div>
                    <div className="absolute top-[53.5%] left-[39.5%] w-[12%] h-[7%] backdrop-blur-xl bg-white/5 rounded-2xl z-20"></div>
                    {/* Growth percentages in Row 4 */}
                    <div className="absolute top-[59%] left-[23.5%] w-[8%] h-[2%] backdrop-blur-sm bg-white/5 rounded-md z-20"></div>
                    <div className="absolute top-[59%] left-[39.5%] w-[8%] h-[2%] backdrop-blur-sm bg-white/5 rounded-md z-20"></div>

                    {/* Financial Balances in Row 5 (Expenses & Savings) */}
                    {/* Overview Expenses ($0.00) */}
                    <div className="absolute top-[72.5%] left-[23.5%] w-[10%] h-[7%] backdrop-blur-xl bg-white/5 rounded-2xl z-20"></div>
                    {/* Total Savings ($15,000.0) */}
                    <div className="absolute top-[72.5%] left-[39.5%] w-[14%] h-[7%] backdrop-blur-xl bg-white/5 rounded-2xl z-20"></div>
                    {/* Progress percentage in Savings card */}
                    <div className="absolute top-[78%] left-[39.5%] w-[8%] h-[2%] backdrop-blur-sm bg-white/5 rounded-md z-20"></div>
                    
                    {/* Alert Amounts in Row 3 */}
                    <div className="absolute top-[34.5%] left-[49.5%] w-[7%] h-[3.5%] backdrop-blur-lg bg-white/5 rounded-md z-20"></div>
                    <div className="absolute top-[34.5%] left-[77%] w-[7%] h-[3.5%] backdrop-blur-lg bg-white/5 rounded-md z-20"></div>
                    
                    {/* Portfolio Chart Axis Data */}
                    <div className="absolute top-[58%] left-[53%] w-[3.5%] h-[20%] backdrop-blur-md bg-white/5 rounded-md z-20"></div>
                    <div className="absolute top-[78%] left-[56%] w-[30%] h-[2.5%] backdrop-blur-sm bg-white/5 rounded-md z-20"></div>

                    {/* Bottom Section Chart Data ($10k etc) */}
                    <div className="absolute bottom-[6%] left-[23.5%] w-[4%] h-[2.5%] backdrop-blur-md bg-white/5 rounded-md z-20"></div>
                    
                    {/* Bottom Right Expense Data Chart area */}
                    <div className="absolute bottom-[4%] right-[4%] w-[18%] h-[12%] backdrop-blur-2xl bg-white/10 rounded-[2rem] z-20"></div>

                    {/* Status Badge */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-8 py-4 bg-indigo-600/90 backdrop-blur-md text-white rounded-2xl text-lg font-black shadow-2xl flex items-center gap-4 border border-indigo-400/50"
                      >
                        <Shield className="w-8 h-8"/> VAULT MODE ACTIVE
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </section>
      </main>

      <Footer />
      </div>

      {/* Auth Modal */}
      <Modal 
        isOpen={isAuthModalOpen} 
        onClose={handleCloseAuth}
      >
        {authMode === 'login' ? (
          <LoginForm onToggleAuth={() => setAuthMode('signup')} />
        ) : (
          <SignupForm onToggleAuth={() => setAuthMode('login')} />
        )}
      </Modal>

      {/* Global Landing Chatbot */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center text-white overflow-hidden transition-colors duration-500 ${
          isChatOpen ? 'bg-slate-900 shadow-slate-900/40' : 'bg-[#2563eb] shadow-blue-600/40'
        } border border-white/20`}
      >
        <AnimatePresence>
          {!isChatOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.2 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              className="absolute inset-0 bg-white rounded-full pointer-events-none"
            />
          )}
        </AnimatePresence>
        <motion.div
          animate={{ rotate: isChatOpen ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative z-10 flex items-center justify-center"
        >
          {isChatOpen ? <X size={32} strokeWidth={2.5} /> : <MessageSquare size={30} fill="currentColor" strokeWidth={1} />}
        </motion.div>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
      </motion.button>

      <AIChatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
};

export default Landing;
