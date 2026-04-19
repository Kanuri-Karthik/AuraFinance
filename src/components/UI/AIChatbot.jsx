import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User } from 'lucide-react';

const AIChatbot = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Hi there! I'm the Aura Finance AI Assistant. Have any questions about your money or features?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey.includes('sk-proj')) {
        throw new Error("Missing Groq API Key");
      }

      const systemDirective = "You are the Aura Finance AI Assistant. Aura Finance is an elite web platform allowing users to track expenses and set strict budgets. Be highly concise, maximum 2 short sentences. Do not use markdown format.";
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemDirective },
            { role: 'user', content: userMessage.text }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Groq Network Error");
      }
      
      const aiResponseText = data.choices[0].message.content;

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiResponseText }]);
    } catch (error) {
      console.error("Groq Chatbot Error:", error);
      let errorMsg = `Groq Connection Failed: ${error.message}`;
      if (error.message === "Missing Groq API Key") {
        errorMsg = "Configuration needed! Please paste your VITE_GROQ_API_KEY into the .env file.";
      }
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute bottom-20 right-0 w-80 md:w-96 shadow-2xl origin-bottom-right pointer-events-auto"
          >
            <div className="flex flex-col h-[500px] p-0 overflow-hidden bg-white/70 backdrop-blur-3xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[32px]">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md border border-white/30 shadow-inner">
                    <Bot size={22} />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-sm tracking-wide">Aura AI</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                      <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest">Online Assistant</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-blue-50 text-blue-600'}`}>
                        {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`p-4 rounded-2xl text-[13px] font-bold shadow-sm leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-sm border border-blue-400/30' 
                          : 'bg-white/80 border border-white text-slate-700 rounded-bl-sm shadow-[0_4px_12px_rgba(0,0,0,0.03)]'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2.5 max-w-[85%]">
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white border border-blue-50 text-blue-600 flex items-center justify-center shadow-md">
                        <Bot size={16} />
                      </div>
                      <div className="p-4 rounded-2xl bg-white/80 border border-white shadow-sm rounded-bl-sm flex gap-2 items-center h-[50px]">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-5 border-t border-blue-100/50 bg-white/40 backdrop-blur-md">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                  <div className="relative flex-1 group">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask Aura anything..."
                      className="w-full bg-white/90 border border-blue-100 rounded-2xl py-3.5 pl-5 pr-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all placeholder-slate-400 shadow-sm"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="flex-shrink-0 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] active:scale-90"
                  >
                    <Send size={18} className="translate-x-0.5 -translate-y-0.5" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatbot;
