import React, { useState, useEffect } from "react";
import { Globe, User, Bell, Clock, HelpCircle, LogOut, FolderLock, AlertOctagon, Settings2, ChevronDown } from "lucide-react";
import { LanguageCode } from "../types";

interface TopBarProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  userName: string;
  onOpenAssistant: () => void;
  setActiveSection: (sec: string) => void;
  onLogout: () => void;
}

export default function TopBar({
  language,
  setLanguage,
  userName,
  onOpenAssistant,
  setActiveSection,
  onLogout
}: TopBarProps) {
  const [greeting, setGreeting] = useState("Hello");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting("Good morning");
    } else if (hours < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  const languageFlags = {
    en: "EN",
    hi: "HI",
    ta: "TA",
    te: "TE",
    ml: "ML",
    bn: "BN"
  };

  const handleLangToggle = () => {
    const codes: LanguageCode[] = ["en", "hi", "ta", "te", "ml", "bn"];
    const currentIdx = codes.indexOf(language);
    const nextIdx = (currentIdx + 1) % codes.length;
    setLanguage(codes[nextIdx]);
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      {/* User Greeting */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex w-10 h-10 rounded-xl bg-blue-50 text-blue-600 items-center justify-center border border-blue-100 shadow-sm">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-800 tracking-tight text-sm md:text-base leading-none">
            {greeting}, <span className="text-blue-700 font-black">{userName}</span>
          </h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
            National ID Verification Active
          </span>
        </div>
      </div>

      {/* Quick Settings: Language, Notifications & User Dropdown */}
      <div className="flex items-center gap-2 relative">
        {/* Toggle language quickly */}
        <button
          onClick={handleLangToggle}
          title="Switch Portal Language"
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-black text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer h-10"
        >
          <Globe className="w-4 h-4 text-blue-500" />
          <span>{languageFlags[language] || "Language"}</span>
        </button>

        {/* Notifications Icon */}
        <button
          title="Notifications"
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-black text-xs p-2.5 rounded-xl transition-all flex items-center justify-center shadow-sm cursor-pointer h-10 w-10"
        >
          <Bell className="w-4 h-4 text-slate-500" />
        </button>

        {/* User/Profile Dropdown Trigger Button */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="Citizen Account Profile Menu"
            className="bg-blue-50 hover:bg-blue-100/80 text-blue-700 border border-blue-200 font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm h-10 cursor-pointer select-none transition-all active:scale-95"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="hidden md:inline font-bold text-slate-700 max-w-[120px] truncate">
              {userName}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* User Profile Dropdown Content */}
          {dropdownOpen && (
            <>
              {/* Click background overlay to auto close */}
              <div 
                className="fixed inset-0 z-30 cursor-default" 
                onClick={() => setDropdownOpen(false)}
              />
              
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header Profile Title */}
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate leading-tight">
                      {userName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                      {userName ? `${userName.toLowerCase().replace(/\s+/g, "")}@gmail.com` : ""}
                    </p>
                  </div>
                </div>

                {/* Dropdown Items */}
                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveSection("settings");
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveSection("documents");
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <FolderLock className="w-4 h-4 text-slate-400" />
                    <span>Saved Documents</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveSection("complaints");
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <AlertOctagon className="w-4 h-4 text-slate-400" />
                    <span>Complaint History</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveSection("settings");
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <Settings2 className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Separator */}
                <div className="border-t border-slate-100 my-1"></div>

                {/* Logout Button */}
                <div className="p-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
