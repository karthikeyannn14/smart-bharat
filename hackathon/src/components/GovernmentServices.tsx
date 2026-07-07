import React, { useState, useEffect } from "react";
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  CheckSquare, 
  HelpCircle, 
  Clock, 
  ExternalLink, 
  BookOpen,
  X,
  AlertCircle
} from "lucide-react";
import { INDIAN_SERVICES, GovtService } from "../servicesData";
import { TRANSLATIONS } from "../translations";

interface GovernmentServicesProps {
  initialSearchQuery?: string;
  onOpenAssistant: (question: string) => void;
  language?: "en" | "hi" | "ta" | "te" | "ml" | "bn";
}

export default function GovernmentServices({ 
  initialSearchQuery = "", 
  onOpenAssistant,
  language = "en"
}: GovernmentServicesProps) {
  const [filterQuery, setFilterQuery] = useState(initialSearchQuery);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Auto-expand and filter if we navigate from dashboard with initial query
  useEffect(() => {
    if (initialSearchQuery) {
      setFilterQuery(initialSearchQuery);
      // Try to find matching service to expand
      const query = initialSearchQuery.toLowerCase();
      const match = INDIAN_SERVICES.find(s => 
        s.name.toLowerCase().includes(query) || 
        s.description.toLowerCase().includes(query)
      );
      if (match) {
        setExpandedServiceId(match.id);
      }
    }
  }, [initialSearchQuery]);

  const filteredServices = INDIAN_SERVICES.filter(service => 
    service.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
    service.eligibility.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedServiceId(expandedServiceId === id ? null : id);
  };

  const handleAskAI = (service: GovtService) => {
    const question = `Explain step-by-step how to apply for ${service.name} and tell me the eligibility rules.`;
    onOpenAssistant(question);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>{t.services?.title || "Central Government Services"}</span>
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            {t.services?.subtitle || "Browse requirements, steps, fees, and timelines for official documents."}
          </p>
        </div>

        {/* Filter Input */}
        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full md:max-w-xs focus-within:border-blue-500 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
          <input
            type="text"
            placeholder={t.services?.searchPlaceholder || "Filter services..."}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs font-bold text-slate-800 placeholder:text-slate-400"
          />
          {filterQuery && (
            <button 
              onClick={() => setFilterQuery("")} 
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredServices.length === 0 ? (
        <div className="text-center p-12 bg-white border border-slate-200 rounded-2xl space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-800 font-bold text-sm">No services matched your filter query.</p>
          <p className="text-xs text-slate-400 font-bold">Try searching for generic keywords like "Passport", "Aadhaar", or "Birth".</p>
          <button 
            onClick={() => setFilterQuery("")}
            className="text-xs font-bold text-blue-600 hover:underline hover:text-blue-700 cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const isExpanded = expandedServiceId === service.id;
            return (
              <div 
                key={service.id}
                className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between
                  ${isExpanded 
                    ? "border-blue-400 shadow-md ring-1 ring-blue-400/10 md:col-span-2 lg:col-span-3" 
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  }
                `}
              >
                {/* Card Header (Always visible) */}
                <div 
                  onClick={() => toggleExpand(service.id)}
                  className="p-5 flex items-center justify-between cursor-pointer group hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-3xl p-2.5 bg-slate-50 rounded-xl shrink-0">
                      {service.icon || "📄"}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 tracking-tight text-sm group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                        {service.id.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400 group-hover:text-slate-600 p-1.5 bg-slate-50 rounded-lg shrink-0 transition-colors">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Detail View */}
                {isExpanded ? (
                  <div className="border-t border-slate-100 p-6 bg-slate-50/30 space-y-6">
                    {/* Description */}
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Short Description
                      </h4>
                      <p className="text-sm text-slate-700 font-bold leading-relaxed max-w-4xl">
                        {service.description}
                      </p>
                    </div>

                    {/* Grid of Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Left: Eligibility and Checklist */}
                      <div className="space-y-5">
                        {/* Eligibility */}
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {t.services?.eligibility || "Eligibility Criteria"}
                          </h4>
                          <p className="text-xs text-slate-600 font-bold bg-white border border-slate-200 rounded-xl p-4 leading-relaxed">
                            {service.eligibility}
                          </p>
                        </div>

                        {/* Checklist */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {t.services?.requiredDocs || "Required Documents Checklist"}
                          </h4>
                          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                            {service.documents.map((doc, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-bold">
                                <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{doc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Fees, Timeline and Actions */}
                      <div className="space-y-5">
                        {/* Fees & Processing */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1 bg-white border border-slate-200 rounded-xl p-4">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                              {t.services?.fees || "Application Fees"}
                            </span>
                            <p className="text-xs text-slate-800 font-bold font-mono">
                              {service.fees}
                            </p>
                          </div>
                          <div className="space-y-1 bg-white border border-slate-200 rounded-xl p-4">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {t.services?.processingTime || "Processing Time"}
                            </span>
                            <p className="text-xs text-slate-800 font-bold font-mono">
                              {service.processingTime}
                            </p>
                          </div>
                        </div>

                        {/* Official Actions & Ask AI */}
                        <div className="space-y-3 pt-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {t.services?.portalLink || "Official Actions"}
                          </span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {service.actions && service.actions.length > 0 ? (
                              service.actions.map((act, index) => (
                                <a 
                                  key={index}
                                  href={act.url}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-center cursor-pointer"
                                >
                                  <span>{act.label}</span>
                                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                </a>
                              ))
                            ) : (
                              <a 
                                href={service.officialWebsite}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-center cursor-pointer"
                              >
                                <span>Apply Online</span>
                                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              </a>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-slate-400 font-bold text-center italic leading-normal">
                            *Official portal links are for representative mapping simulation.
                          </p>

                          {/* NEED HELP ASK AI */}
                          <button
                            onClick={() => handleAskAI(service)}
                            className="w-full border border-slate-250 hover:bg-slate-100 text-slate-700 font-black text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <HelpCircle className="w-4 h-4 text-blue-500" />
                            <span>{t.services?.askAi || "Need Help? Ask AI Assistant"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Closed state brief bottom summary
                  <div className="border-t border-slate-100 px-5 py-3.5 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>⏳ {service.processingTime}</span>
                    <button 
                      onClick={() => toggleExpand(service.id)}
                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      View Documents
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
