import React, { useState } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Compass, 
  AlertOctagon, 
  FolderLock, 
  BotMessageSquare, 
  Settings2,
  Menu,
  X,
  ShieldCheck
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../translations";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  userName: string;
  language?: LanguageCode;
}

export default function Sidebar({ 
  activeSection, 
  setActiveSection, 
  userName,
  language = "en"
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const menuItems = [
    { id: "dashboard", label: t.sidebar?.dashboard || "Dashboard", icon: LayoutDashboard },
    { id: "services", label: t.sidebar?.services || "Government Services", icon: BookOpen },
    { id: "schemes", label: t.sidebar?.schemes || "Schemes & Benefits", icon: Compass },
    { id: "complaints", label: t.sidebar?.complaints || "Civic Complaints", icon: AlertOctagon },
    { id: "documents", label: t.sidebar?.documents || "Document Vault", icon: FolderLock },
    { id: "ai", label: t.sidebar?.fullScreenAi || "AI Companion", icon: BotMessageSquare },
    { id: "settings", label: t.sidebar?.settings || "Settings", icon: Settings2 },
  ];

  const handleSelect = (id: string) => {
    setActiveSection(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-slate-800 tracking-tight text-sm">SMART BHARAT</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Persistent Left Sidebar for Desktop & Slide-over for Mobile */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transform md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col border-r border-slate-800
          ${isOpen ? "translate-x-0" : "-translate-x-full md:relative"}
        `}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-white tracking-tight text-base leading-none animate-pulse">SMART BHARAT</h1>
              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-1 block">Civic Portal</span>
            </div>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white cursor-pointer" 
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-4 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-600/10">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Citizen Account</p>
            <p className="text-sm font-bold text-slate-200 truncate">{userName}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group cursor-pointer
                  ${isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-black" 
                    : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105
                  ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}
                `} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Navigation Footer */}
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-600 font-bold uppercase tracking-wider text-center">
          Smart Bharat Platform • v2.5
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-slate-950/60 z-20 md:hidden backdrop-blur-sm"
        />
      )}
    </>
  );
}
