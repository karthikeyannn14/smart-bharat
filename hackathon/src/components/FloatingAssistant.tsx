import React, { useRef, useEffect } from "react";
import { 
  BotMessageSquare, 
  X, 
  Send, 
  RefreshCw, 
  Sparkles,
  Volume2
} from "lucide-react";
import { Message } from "../types";
import { TRANSLATIONS } from "../translations";

interface FloatingAssistantProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: (val: string) => void;
  loading: boolean;
  onSendMessage: (customText?: string) => void;
  language: "en" | "hi" | "ta" | "te" | "ml" | "bn";
}

export default function FloatingAssistant({
  isOpen,
  setIsOpen,
  messages,
  setMessages,
  input,
  setInput,
  loading,
  onSendMessage,
  language
}: FloatingAssistantProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage();
  };

  const handleQuickQuestion = (text: string) => {
    onSendMessage(text);
  };

  const quickQuestions: Record<string, string[]> = {
    en: [
      "How to apply for Aadhaar Card?",
      "Required documents for Passport?",
      "Am I eligible for PM-KISAN?"
    ],
    hi: [
      "आधार कार्ड के लिए कैसे आवेदन करें?",
      "पासपोर्ट के लिए आवश्यक दस्तावेज?",
      "क्या मैं पीएम-किसान के लिए पात्र हूँ?"
    ],
    ta: [
      "ஆதார் அட்டைக்கு விண்ணப்பிப்பது எப்படி?",
      "பாஸ்போர்ட்டிற்கு தேவையான ஆவணங்கள்?",
      "நான் பிஎம்-கிசான் திட்டத்திற்கு தகுதியானவரா?"
    ],
    te: [
      "ఆధార్ కార్డ్ కోసం ఎలా దరఖాస్తు చేయాలి?",
      "పాస్‌పోర్ట్ కోసం అవసరమైన పత్రాలు?",
      "నేను పిఎం-కిసాన్‌కు అర్హుడనా?"
    ],
    ml: [
      "ആധാർ കാർഡിന് എങ്ങനെ അപേക്ഷിക്കാം?",
      "പാസ്‌പോർട്ടിന് ആവശ്യമായ രേഖകൾ?",
      "ഞാൻ പിഎം-കിസാന് അർഹനാണോ?"
    ],
    bn: [
      "আধার কার্ডের জন্য কীভাবে আবেদন করব?",
      "পাসপোর্টের জন্য প্রয়োজনীয় নথি?",
      "আমি কি পিএম-কিষানের জন্য যোগ্য?"
    ]
  };

  const activeQuestions = quickQuestions[language] || quickQuestions.en;
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Custom greeting based on hours
  const [timeGreeting, setTimeGreeting] = React.useState("Hello");
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setTimeGreeting("Good morning");
    } else if (hours < 17) {
      setTimeGreeting("Good afternoon");
    } else {
      setTimeGreeting("Good evening");
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[360px] md:w-[400px] h-[520px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-fade-in ring-1 ring-black/5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/10 p-2 rounded-xl border border-white/10 shrink-0">
                <BotMessageSquare className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-tight leading-tight">
                  {t.chat?.header || "AI Civic Companion"}
                </h4>
                <p className="text-[9px] text-blue-200 font-bold uppercase tracking-wider">
                  {t.chat?.powerText || "Powered by Gemini 3.5"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                  <BotMessageSquare className="w-8 h-8 animate-bounce text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-800 leading-normal whitespace-pre-line">
                    {timeGreeting === "Good morning" ? "Good Morning 👋" : timeGreeting === "Good afternoon" ? "Good Afternoon ☀️" : "Good Evening 🌙"}
                    {"\n\n"}
                    I'm Smart Bharat AI.
                    {"\n\n"}
                    How can I assist you today?
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold leading-normal max-w-[240px] pt-1">
                    Ask about document procedures, central welfare eligibility, and RTO/Passport timelines.
                  </p>
                </div>

                {/* Quick questions pills */}
                <div className="w-full pt-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider text-left mb-2">
                    {t.chat?.quickAskTitle || "Try asking:"}
                  </p>
                  <div className="flex flex-col gap-2">
                    {activeQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(q)}
                        className="text-left bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 p-2.5 rounded-xl text-[11px] font-bold text-slate-700 transition-all cursor-pointer shadow-sm hover:shadow"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.sender === "user";
                return (
                  <div 
                    key={index} 
                    className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <BotMessageSquare className="w-4 h-4 text-amber-300" />
                      </div>
                    )}
                    <div 
                      className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs font-bold leading-relaxed shadow-sm border
                        ${isUser 
                          ? "bg-slate-950 border-slate-950 text-slate-100 rounded-tr-none font-medium" 
                          : "bg-white border-slate-200 text-slate-800 rounded-tl-none whitespace-pre-line"
                        }
                      `}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <BotMessageSquare className="w-4 h-4 text-amber-300 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 text-slate-500 px-4 py-2.5 rounded-2xl rounded-tl-none text-xs font-bold flex items-center gap-1.5 shadow-sm animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>{t.chat?.generating || "Generating guidance..."}</span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              disabled={loading}
              placeholder={t.chat?.placeholder || "Ask me anything..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-250 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-md shadow-blue-600/10 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Launcher Bubble Button (Circular with hover tooltip) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant"
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/10 cursor-pointer group relative"
      >
        <BotMessageSquare className="w-6 h-6 text-amber-300 group-hover:rotate-12 transition-transform" />
        <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-800">
          AI Assistant
        </span>
      </button>

    </div>
  );
}
