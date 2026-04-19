import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import Footer from '../components/Layout/Footer';
import { ChevronRight, Printer, Share2, ArrowUp } from 'lucide-react';

const LegalLayout = ({ title, lastUpdated, sections, children }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [activeSection, setActiveSection] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      
      const sectionElements = sections.map(s => document.getElementById(s.id));
      const currentSection = sectionElements.find(el => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= 300;
      });
      
      if (currentSection) setActiveSection(currentSection.id);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-body transition-colors duration-500 overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-indigo-600 origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Header */}
      <section className="pt-32 pb-16 px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6"
            >
              Legal Hub / {title}
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-slate-900 mb-4">{title}</h1>
            <p className="text-slate-500 font-bold">Effective Date: {lastUpdated}</p>
          </div>
          <div className="flex gap-4">
            <button className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
              <Printer size={20} />
            </button>
            <button className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
          
          {/* Sticky TOC Sidebar */}
          <aside className="lg:w-1/4">
            <div className="sticky top-32 space-y-8">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Navigation</h4>
                <nav className="flex flex-col gap-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollTo(section.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeSection === section.id 
                          ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100' 
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ChevronRight size={14} className={`transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-200">
                <h5 className="font-black mb-2">Need help?</h5>
                <p className="text-xs text-indigo-100 font-bold mb-4 leading-relaxed">Have questions about our legal terms? Reach out to our concierge team.</p>
                <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-xs">Contact Support</button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:w-3/4 max-w-3xl">
            <div className="prose prose-slate prose-lg max-w-none">
              {children}
            </div>
          </div>

        </div>
      </section>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-10 right-10 w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl z-50"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export const Privacy = () => (
  <LegalLayout 
    title="Privacy Policy" 
    lastUpdated="April 12, 2024"
    sections={[
      { id: 'data-coll', title: 'Data Collection' },
      { id: 'data-use', title: 'Use of Information' },
      { id: 'data-share', title: 'Data Sharing' },
      { id: 'security', title: 'Security Measures' }
    ]}
  >
    <div className="space-y-20">
      <section id="data-coll">
        <h2 className="text-3xl font-black text-slate-900 mb-6 font-headline">1. Data Collection</h2>
        <p className="text-slate-600 font-bold leading-relaxed text-lg">Aura Finance collects information to provide better services to all our users. This includes financial transaction data, account balances, and identifiers provided during sign-up. We use bank-grade encryption to ensure this data remains private.</p>
        <div className="mt-8 p-6 rounded-3xl bg-slate-50 border border-slate-100">
           <p className="text-sm text-slate-500 font-bold italic">Note: We never sell your personal financial data to third parties. Your privacy is our institutional priority.</p>
        </div>
      </section>

      <section id="data-use">
        <h2 className="text-3xl font-black text-slate-900 mb-6 font-headline">2. Use of Information</h2>
        <p className="text-slate-600 font-bold leading-relaxed text-lg">We use the information we collect to maintain and improve our services, develop new features, and protect Aura Finance and our users. For instance, our AI engine uses your transaction history to provide personalized financial insights.</p>
        <ul className="mt-6 space-y-4 text-slate-600 font-bold">
          <li className="flex gap-3"><span className="text-indigo-500">✔</span> Personalizing your dashboard experience</li>
          <li className="flex gap-3"><span className="text-indigo-500">✔</span> Improving our AI Pattern Recognition</li>
          <li className="flex gap-3"><span className="text-indigo-500">✔</span> Detecting fraudulent account activity</li>
        </ul>
      </section>

      <section id="data-share">
        <h2 className="text-3xl font-black text-slate-900 mb-6 font-headline">3. Data Sharing</h2>
        <p className="text-slate-600 font-bold leading-relaxed text-lg">We do not share your personal information with companies, organizations, or individuals outside of Aura Finance except in the following cases: with your consent, for external processing (like bank sync providers), or for legal reasons.</p>
      </section>

      <section id="security">
        <h2 className="text-3xl font-black text-slate-900 mb-6 font-headline">4. Security Measures</h2>
        <p className="text-slate-600 font-bold leading-relaxed text-lg">We work hard to protect Aura Finance and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold. This includes AES-256 encryption and multi-factor authentication protocols.</p>
      </section>
    </div>
  </LegalLayout>
);

export const Terms = () => (
  <LegalLayout 
    title="Terms of Service" 
    lastUpdated="April 12, 2024"
    sections={[
      { id: 'acceptance', title: 'Acceptance of Terms' },
      { id: 'license', title: 'Use License' },
      { id: 'disclaimer', title: 'Disclaimer' },
      { id: 'limits', title: 'Limitations' }
    ]}
  >
    <div className="space-y-20">
      <section id="acceptance">
        <h2 className="text-3xl font-black text-slate-900 mb-6 font-headline">1. Acceptance of Terms</h2>
        <p className="text-slate-600 font-bold leading-relaxed text-lg">By accessing or using Aura Finance, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
      </section>

      <section id="license">
        <h2 className="text-3xl font-black text-slate-900 mb-6 font-headline">2. Use License</h2>
        <p className="text-slate-600 font-bold leading-relaxed text-lg">Permission is granted to temporarily download one copy of the materials on Aura Finance's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
      </section>

      <section id="disclaimer">
        <h2 className="text-3xl font-black text-slate-900 mb-6 font-headline">3. Disclaimer</h2>
        <p className="text-slate-600 font-bold leading-relaxed text-lg">The materials on Aura Finance's website are provided on an 'as is' basis. Aura Finance makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
      </section>

      <section id="limits">
        <h2 className="text-3xl font-black text-slate-900 mb-6 font-headline">4. Limitations</h2>
        <p className="text-slate-600 font-bold leading-relaxed text-lg">In no event shall Aura Finance or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Aura Finance's website.</p>
      </section>
    </div>
  </LegalLayout>
);

export const Cookies = () => (
  <LegalLayout 
    title="Cookie Policy" 
    lastUpdated="April 12, 2024"
    sections={[
      { id: 'what', title: 'What are cookies?' },
      { id: 'how', title: 'How we use them' },
      { id: 'types', title: 'Types of cookies' },
      { id: 'manage', title: 'Managing cookies' }
    ]}
  >
    <div className="space-y-20">
      <section id="what">
        <h2 className="text-3xl font-black text-slate-900 mb-6 font-headline">1. What are cookies?</h2>
        <p className="text-slate-600 font-bold leading-relaxed text-lg">Cookies are small text files that are stored on your computer or mobile device when you visit a website. They help the website recognize your device and remember information about your visit.</p>
      </section>

      <section id="how">
        <h2 className="text-3xl font-black text-slate-900 mb-6 font-headline">2. How we use cookies</h2>
        <p className="text-slate-600 font-bold leading-relaxed text-lg">We use cookies to understand how you use our site and to improve your experience. This includes keeping you logged in, remembering your preferences (like currency and theme), and analyzing site traffic.</p>
      </section>

      <section id="types">
        <h2 className="text-3xl font-black text-slate-900 mb-6 font-headline">3. Types of cookies we use</h2>
        <p className="text-slate-600 font-bold leading-relaxed text-lg">We use both session cookies (which expire once you close your web browser) and persistent cookies (which stay on your device until you delete them or they expire). These include essential cookies, preference cookies, and analytics cookies.</p>
      </section>

      <section id="manage">
        <h2 className="text-3xl font-black text-slate-900 mb-6 font-headline">4. Managing cookies</h2>
        <p className="text-slate-600 font-bold leading-relaxed text-lg">You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies. You do this through your browser settings. If you turn cookies off, some features of Aura Finance may not function properly.</p>
      </section>
    </div>
  </LegalLayout>
);

