import React from "react";
import { 
  Settings2, 
  User, 
  Accessibility, 
  Globe, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Volume2
} from "lucide-react";
import { LanguageCode } from "../types";

interface SettingsProps {
  userName: string;
  setUserName: (name: string) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isLargeText: boolean;
  setIsLargeText: (b: boolean) => void;
  t: any;
}

export default function Settings({
  userName,
  setUserName,
  language,
  setLanguage,
  isLargeText,
  setIsLargeText,
  t
}: SettingsProps) {
  const languages: { code: LanguageCode; label: string; desc: string }[] = [
    { code: "en", label: "English", desc: "Digital Civic Standard Interface" },
    { code: "hi", label: "हिन्दी (Hindi)", desc: "राष्ट्रीय सूचना प्रवेशिका" },
    { code: "ta", label: "தமிழ் (Tamil)", desc: "தமிழ் மாநில சேவைகள்" },
    { code: "te", label: "తెలుగు (Telugu)", desc: "ఆంధ్రప్రదేశ్ & తెలంగాణ సేవలు" },
    { code: "ml", label: "മലയാളം (Malayalam)", desc: "കേരള സംസ്ഥാന വിവരങ്ങൾ" },
    { code: "bn", label: "বাংলা (Bengali)", desc: "পশ্চিমবঙ্গ ও ত্রিপুরা নাগরিক তথ্য" }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Settings Header */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-1">
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-slate-700" />
          <span>System Settings & Accessibility</span>
        </h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
          Customize citizen identities, multilingual preferences, and senior-friendly visual ratios
        </p>
      </div>

      {/* Identity Configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <User className="w-4 h-4" />
          <span>Citizen Identity Card</span>
        </h3>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Authorized Citizen Name</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full max-w-sm bg-slate-50 border border-slate-250 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 text-[10px] font-black px-2.5 py-1.5 rounded-xl uppercase tracking-wider">
              ✓ State Sync'd
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold leading-normal">
            This name will dynamically personalize your welcoming dashboard tiles, greeting salutations, and official complaint statement drafting generators.
          </p>
        </div>
      </div>

      {/* Multi-language setup */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Globe className="w-4 h-4" />
          <span>Preferred Communication Language</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`p-4 border rounded-xl text-left flex items-start justify-between cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? "border-blue-500 bg-blue-50/20 shadow-sm" 
                    : "border-slate-150 hover:bg-slate-50"
                  }
                `}
              >
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-800">{lang.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold leading-none">{lang.desc}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessibility options */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Accessibility className="w-4 h-4" />
          <span>Accessibility Toggles</span>
        </h3>

        <div className="space-y-4">
          {/* Large text */}
          <div className="flex items-center justify-between gap-6 p-4 border border-slate-150 rounded-xl">
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-800">Senior-Citizen Large Text Mode</p>
              <p className="text-[10px] text-slate-400 font-bold leading-normal">
                Enlarges interface headings, text logs, and chat bubbles for readable visibility.
              </p>
            </div>
            <button
              onClick={() => setIsLargeText(!isLargeText)}
              className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center p-0.5 relative shrink-0 cursor-pointer
                ${isLargeText ? "bg-blue-600 justify-end" : "bg-slate-200 justify-start"}
              `}
            >
              <div className="w-5 h-5 bg-white rounded-full shadow-md border border-slate-100" />
            </button>
          </div>

          {/* Voice synthesiser (placeholder check) */}
          <div className="flex items-center justify-between gap-6 p-4 border border-slate-150 rounded-xl bg-slate-50/50">
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span>Text-To-Speech (TTS) Voice Auditing</span>
              </p>
              <p className="text-[10px] text-slate-400 font-bold leading-normal">
                Enables verbal readbacks of documents, guidelines, and chat responses.
              </p>
            </div>
            <button
              disabled
              className="w-12 h-6 rounded-full bg-slate-200 flex items-center p-0.5 relative shrink-0 cursor-not-allowed opacity-50"
            >
              <div className="w-5 h-5 bg-white rounded-full shadow-md" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
