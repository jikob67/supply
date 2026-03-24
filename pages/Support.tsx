import React, { useState } from 'react';
import { Send, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { getSupportResponse } from '../services/geminiService';
import { SUPPORT_EMAIL, SUPPORT_LINKS } from '../constants';

const Support: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'مرحباً! أنا المساعد الذكي لتطبيق supply. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    const response = await getSupportResponse(userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
      {/* Header */}
      <div className="bg-primary text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot /> الدعم الفني الذكي
          </h2>
        </div>
        <div className="hidden md:block text-sm text-right text-white/70">
           في حال لم يتم حل المشكلة، سيتم تحويلك للدعم البشري
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-gray-100 text-gray-800 rounded-tr-none' 
                  : 'bg-primary text-white rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-end">
              <div className="bg-primary/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-primary">
                <Loader2 className="animate-spin" size={16} />
                <span>جاري الكتابة...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب مشكلتك هنا..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-primary text-white p-3 rounded-xl hover:bg-secondary disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-red-800">
        <div className="flex items-center gap-2">
           <AlertCircle size={18} />
           <span>لم يتم حل المشكلة؟ تواصل معنا مباشرة:</span>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold hover:underline">{SUPPORT_EMAIL}</a>
          <div className="h-4 w-px bg-red-200 hidden md:block"></div>
          {SUPPORT_LINKS.map((link, i) => (
            <a key={i} href={link} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              رابط دعم {i + 1}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;