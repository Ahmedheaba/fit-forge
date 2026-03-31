import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import api from '../../utils/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hi there! I'm FitForge AI. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = [...messages, userMessage];
      const res = await api.post('/chat', { messages: chatHistory });
      setMessages((prev) => [...prev, { role: 'model', text: res.data.text }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to my servers right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gold text-jet rounded-full shadow-xl flex items-center justify-center hover:bg-gold-2 transition-transform hover:scale-105 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <FiMessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 bg-jet-2 border border-jet-3 rounded-2xl overflow-hidden shadow-2xl z-50 flex flex-col"
            style={{ height: '500px', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="bg-jet px-5 py-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <FiMessageSquare className="text-gold" size={16} />
                </div>
                <div>
                  <h3 className="text-cream font-display text-lg tracking-wide leading-none">FitForge AI</h3>
                  <p className="text-cream-4/60 text-xs">Always here to help</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-cream-4/50 hover:text-cream transition-colors">
                <FiX size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-jet border-b border-white/5">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gold text-jet rounded-tr-sm font-medium shadow-sm' 
                      : 'bg-jet-3 text-cream-2 rounded-tl-sm border border-white/5 shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-jet-3 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-cream/40 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-cream/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-cream/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="bg-jet py-3 px-4">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-jet-3 text-cream text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-gold/30 placeholder-cream-4/30 border border-transparent focus:border-gold/20 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 w-8 h-8 bg-gold text-jet rounded-lg flex items-center justify-center hover:bg-gold-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <FiSend size={14} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
