import React, { useState, useEffect } from "react";
import { 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldAlert, 
  Sparkles,
  MapPin,
  ClipboardList,
  Upload,
  ArrowUpRight,
  ExternalLink,
  Bot
} from "lucide-react";
import { INDIAN_SERVICES } from "../servicesData";
import { Complaint, UploadedDocument, LanguageCode } from "../types";
import { TRANSLATIONS } from "../translations";

interface DashboardProps {
  userName: string;
  onNavigate: (section: string, arg?: any) => void;
  complaints: Complaint[];
  documents: UploadedDocument[];
  eligibleSchemesCount: number;
  recentActivities: string[];
  language?: LanguageCode;
}

export default function Dashboard({ 
  userName, 
  onNavigate, 
  complaints, 
  documents, 
  eligibleSchemesCount,
  recentActivities,
  language = "en"
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Live suggestions filtering
  const suggestions = debouncedSearchQuery.trim().length > 0
    ? INDIAN_SERVICES.filter(s => 
        s.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const popularServices = [
    { name: "Passport", id: "passport", desc: "Apply for a new passport or renew your travel document.", icon: "✈️" },
    { name: "Aadhaar", id: "aadhaar_update", desc: "Update your biometric or demographic details securely.", icon: "🆔" },
    { name: "PAN Card", id: "caste_income_cert", desc: "Apply for Permanent Account Number for tax compliance.", icon: "💳" },
    { name: "Birth Certificate", id: "birth_death_cert", desc: "Register births or obtain certificates online.", icon: "👶" },
    { name: "Ration Card", id: "ration_card", desc: "Get subsidized food grains and food security support.", icon: "🌾" },
    { name: "Driving Licence", id: "driving_license", desc: "Apply for permanent or learner vehicle licences.", icon: "🚗" },
  ];

  const quickActions = [
    { title: "Apply for Service", icon: ClipboardList, color: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100", targetSection: "services" },
    { title: "Verify Documents", icon: Upload, color: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100", targetSection: "documents" },
    { title: "Report Civic Issue", icon: ShieldAlert, color: "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100", targetSection: "complaints", stateArg: "new" },
    { title: "Find Govt Office", icon: MapPin, color: "bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100", targetSection: "dashboard", scrollArg: "nearby-offices" },
    { title: "Find Eligible Schemes", icon: Sparkles, color: "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100", targetSection: "schemes" },
    { title: "Track Complaint", icon: Clock, color: "bg-slate-50 text-slate-700 border-slate-150 hover:bg-slate-100", targetSection: "complaints" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate("services", searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name: string) => {
    onNavigate("services", name);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (action.scrollArg) {
      const el = document.getElementById(action.scrollArg);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        onNavigate(action.targetSection);
      }
    } else {
      onNavigate(action.targetSection, action.stateArg);
    }
  };

  // Extract counts
  const pendingComplaints = complaints.filter(c => c.status !== "Resolved");
  const verifiedDocs = documents.filter(d => d.status === "Clear image");

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white rounded-3xl p-8 md:p-10 shadow-xl border border-blue-600/20">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/10">
          <Sparkles className="w-96 h-96" />
        </div>
        <div className="max-w-3xl space-y-4">
          <span className="bg-blue-500/30 text-blue-100 border border-blue-400/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            National Digital Infrastructure
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Welcome Back, <span className="text-amber-300">{userName}</span> 👋
          </h2>
          <p className="text-blue-100 font-medium text-sm md:text-base max-w-xl leading-relaxed">
            {t.dashboard?.subtitle || "Secure digital doorway to verify documents, report public grievances, and discover eligible central benefits."}
          </p>

          {/* Search Bar with live debounced suggestions */}
          <div className="pt-2 relative">
            <form onSubmit={handleSearchSubmit} className="relative z-30">
              <div className="relative bg-white text-slate-900 rounded-2xl flex items-center p-1.5 shadow-lg max-w-2xl border border-slate-200">
                <div className="pl-4 text-slate-400 shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder={t.services?.searchPlaceholder || "Search government service (e.g. Passport, Aadhaar, DL)..."}
                  value={searchQuery}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  className="w-full bg-transparent border-none outline-none px-3 py-2 text-sm md:text-base text-slate-800 font-bold placeholder:text-slate-400 focus:ring-0"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-2.5 rounded-xl transition-all text-sm shrink-0 flex items-center gap-1.5 shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Floating Live suggestions card */}
            {showSuggestions && suggestions.length > 0 && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowSuggestions(false)} 
                />
                <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-w-2xl z-30 divide-y divide-slate-100 animate-slide-up">
                  <div className="px-4 py-2 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider flex justify-between items-center">
                    <span>{t.services?.suggestionsTitle || "Live Suggestions"}</span>
                    <span className="text-blue-600 text-[9px]">Debounced Match</span>
                  </div>
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSuggestionClick(s.name)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50/50 flex items-center justify-between transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl p-1 bg-slate-100 rounded group-hover:bg-blue-50">
                          {s.icon || "📄"}
                        </span>
                        <div>
                          <p className="text-xs font-black text-slate-800 group-hover:text-blue-700">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold truncate max-w-xs md:max-w-md">
                            {s.description}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid Stats Cards ("Alive" with lists of real items & "View all" links) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Applications */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between hover:border-blue-300 transition-all hover:shadow-md group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 font-black text-[10px] uppercase tracking-wider">
                Pending Actions
              </span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-slate-900 tracking-tight">2</p>
              <p className="text-xs text-slate-500 font-bold">Applications currently active</p>
            </div>
            
            {/* Inner Live List */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>Passport - Under review</span>
              </div>
              <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>Driving License - Approved</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigate("services")}
            className="mt-5 w-full text-center text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 rounded-xl transition-all cursor-pointer"
          >
            {t.dashboard?.viewAll || "View all"}
          </button>
        </div>

        {/* Card 2: Document Vault */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-300 transition-all hover:shadow-md group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 font-black text-[10px] uppercase tracking-wider">
                {t.dashboard?.documentsTitle || "Verified Documents"}
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {verifiedDocs.length}
              </p>
              <p className="text-xs text-slate-500 font-bold">Authenticated credential records</p>
            </div>

            {/* Inner Live List */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 min-h-[40px]">
              {verifiedDocs.length > 0 ? (
                verifiedDocs.slice(0, 2).map(doc => (
                  <div key={doc.id} className="text-[10px] font-bold text-slate-600 truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{doc.name} ({doc.verifiedType})</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 font-medium italic">No verified credentials uploaded</p>
              )}
            </div>
          </div>

          <button 
            onClick={() => onNavigate("documents")}
            className="mt-5 w-full text-center text-[10px] font-black uppercase tracking-wider text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 py-2 rounded-xl transition-all cursor-pointer"
          >
            {t.dashboard?.viewAll || "View all"}
          </button>
        </div>

        {/* Card 3: Complaints */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between hover:border-rose-300 transition-all hover:shadow-md group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 font-black text-[10px] uppercase tracking-wider">
                {t.dashboard?.complaintsTitle || "Active Complaints"}
              </span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {pendingComplaints.length}
              </p>
              <p className="text-xs text-slate-500 font-bold">Active grievances in register</p>
            </div>

            {/* Inner Live List */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 min-h-[40px]">
              {pendingComplaints.length > 0 ? (
                pendingComplaints.slice(0, 2).map(comp => (
                  <div key={comp.id} className="text-[10px] font-bold text-slate-600 truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span className="font-mono">{comp.id}</span> - {comp.location.split(",")[0]}
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 font-medium italic">No active grievances filed</p>
              )}
            </div>
          </div>

          <button 
            onClick={() => onNavigate("complaints")}
            className="mt-5 w-full text-center text-[10px] font-black uppercase tracking-wider text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 py-2 rounded-xl transition-all cursor-pointer"
          >
            {t.dashboard?.viewAll || "View all"}
          </button>
        </div>

        {/* Card 4: Schemes */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between hover:border-amber-300 transition-all hover:shadow-md group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 font-black text-[10px] uppercase tracking-wider">
                {t.dashboard?.schemesTitle || "Eligible Schemes"}
              </span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {eligibleSchemesCount}
              </p>
              <p className="text-xs text-slate-500 font-bold">Identified based on profile</p>
            </div>

            {/* Inner Live List */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>PM-KISAN Nidhi Yojana</span>
              </div>
              <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Ayushman Bharat health benefit</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigate("schemes")}
            className="mt-5 w-full text-center text-[10px] font-black uppercase tracking-wider text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 py-2 rounded-xl transition-all cursor-pointer"
          >
            {t.dashboard?.viewAll || "View all"}
          </button>
        </div>

      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
          ⚡ Quick Portal Utilities
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => handleQuickAction(action)}
                className={`flex flex-col items-center justify-center text-center p-5 rounded-2xl border border-slate-200 transition-all cursor-pointer ${action.color} hover:scale-[1.02] hover:shadow-sm`}
              >
                <div className="p-3 bg-white/60 rounded-xl mb-3 shadow-sm border border-black/5">
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-xs font-extrabold tracking-tight leading-tight">{action.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bento Two-Columns: Popular Services & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Popular Services Grid */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Popular Services</h3>
              <p className="text-xs text-slate-500 font-bold">Instant details, checklists and official application routing</p>
            </div>
            <button 
              onClick={() => onNavigate("services")}
              className="text-xs font-black text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularServices.map((service) => (
              <div 
                key={service.id}
                onClick={() => onNavigate("services", service.name)}
                className="group border border-slate-200 hover:border-blue-300 hover:bg-blue-50/10 rounded-xl p-4 flex gap-4 cursor-pointer transition-all duration-200"
              >
                <div className="text-2xl p-2.5 bg-slate-50 rounded-xl group-hover:bg-blue-50 shrink-0 self-start transition-colors">
                  {service.icon}
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-700 flex items-center gap-1">
                    <span>{service.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-blue-600" />
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-snug line-clamp-2">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {t.dashboard?.recentActivity || "Recent Activity"}
              </h3>
              <p className="text-xs text-slate-500 font-bold">Real-time trace logs of civic actions</p>
            </div>

            <div className="space-y-4">
              {recentActivities.map((act, index) => (
                <div key={index} className="flex gap-3 text-xs leading-normal font-bold">
                  <div className="mt-0.5 shrink-0 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4 fill-emerald-50" />
                  </div>
                  <div className="text-slate-700">
                    <p className="font-semibold text-slate-800">{act}</p>
                    <span className="text-[10px] text-slate-400 font-bold">Recently</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Status: Verified Connection</span>
            <span className="flex items-center gap-1 text-emerald-600 font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
