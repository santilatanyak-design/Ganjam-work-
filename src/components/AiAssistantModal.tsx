import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { X, Sparkles, Send, Bot, User, Loader2, Volume2, HelpCircle } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  const t = translations[language];

  const initialMsg: Message = {
    id: 'msg_init',
    sender: 'ai',
    text: language === 'or'
      ? 'ଜୟ ଜଗନ୍ନାଥ! ମୁଁ ଗଞ୍ଜାମ ମିତ୍ର AI। ଆପଣଙ୍କୁ ଫସଲ ଚାଷ, ରୋଗ ପୋକ ନିୟନ୍ତ୍ରଣ, ଆଜିର ହାଟ ଦର, କିମ୍ବା ସ୍ଥାନୀୟ କାରିଗର/ମିସ୍ତ୍ରୀ ଖୋଜିବାରେ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?'
      : 'Greetings! I am Ganjam Mitra AI. How can I assist you today with crop health advice, mandi rates, or finding local skilled mechanics in Ganjam?',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<Message[]>([initialMsg]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          language,
          context: {
            district: 'Ganjam, Odisha',
            markets: ['Berhampur', 'Aska', 'Hinjilicut', 'Bhanjanagar', 'Chatrapur']
          }
        })
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.text || data.response || (language === 'or' ? 'ଉତ୍ତର ପ୍ରସେସ୍ ହୋଇପାରିଲା ନାହିଁ।' : 'Failed to process request.'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: language === 'or' 
            ? 'ଦୁଃଖିତ, ସଂଯୋଗ ବିଚ୍ଛିନ୍ନ ହୋଇଛି। ଦୟାକରି ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।' 
            : 'Network error. Please try again in a moment.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Chips
  const quickQuestions = language === 'or'
    ? [
        "🌾 ଧାନ ଗଛରେ ପୋକ ଲାଗିଲେ କ'ଣ କରିବି?",
        "📊 ଆଜି ବ୍ରହ୍ମପୁରରେ ବାଇଗଣ ଦର କେତେ?",
        "⚡ ଆସିକାରେ ଜଣେ ଭଲ ଇଲେକ୍ଟ୍ରିସିଆନ୍ ଦରକାର",
        "🚜 ଟ୍ରାକ୍ଟର ଭଡ଼ାର ସାଧାରଣ ଦର କେତେ?"
      ]
    : [
        "🌾 How to cure paddy stem borer pest?",
        "📊 Today's Brinjal mandi price in Berhampur?",
        "⚡ Need reliable electrician in Aska",
        "🚜 What is the standard tractor hourly rate?"
      ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-xl text-amber-400">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">{t.aiTitle}</h3>
              <p className="text-xs text-emerald-200">{t.aiSub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Questions Bar */}
        <div className="bg-emerald-950 p-2.5 overflow-x-auto no-scrollbar flex items-center gap-2 flex-shrink-0 border-b border-emerald-800">
          <span className="text-[10px] text-amber-300 font-bold uppercase whitespace-nowrap flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            {language === 'or' ? 'ଦ୍ରୁତ ପ୍ରଶ୍ନ:' : 'Quick Ask:'}
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="bg-emerald-900/90 hover:bg-emerald-800 text-emerald-100 font-medium text-xs px-2.5 py-1 rounded-lg whitespace-nowrap border border-emerald-700/60 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages Log */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${
                m.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-800 text-white'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                <p>{m.text}</p>
                <span className="text-[10px] opacity-60 block mt-1 text-right">
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold bg-emerald-50 p-3 rounded-xl border border-emerald-200 w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>
                {language === 'or' ? 'ଗଞ୍ଜାମ ମିତ୍ର ଉତ୍ତର ପ୍ରସ୍ତୁତ କରୁଛନ୍ତି...' : 'Ganjam Mitra is thinking...'}
              </span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.aiPlaceholder}
              disabled={isLoading}
              className="flex-grow bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold p-2.5 rounded-xl transition shadow-md flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
