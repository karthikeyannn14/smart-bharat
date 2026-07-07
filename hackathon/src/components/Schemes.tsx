import React, { useState } from "react";
import { 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  User, 
  GraduationCap, 
  Spade, 
  HeartHandshake, 
  UserCheck, 
  Rocket, 
  Briefcase, 
  Accessibility, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { PROFILE_RECOMMENDATIONS } from "../servicesData";

interface SchemesProps {
  onOpenAssistant: (question: string) => void;
}

export default function Schemes({ onOpenAssistant }: SchemesProps) {
  const [selectedProfile, setSelectedProfile] = useState<string>("student");
  const [situationText, setSituationText] = useState("");
  const [isInferring, setIsInferring] = useState(false);
  const [inferenceFeedback, setInferenceFeedback] = useState("");

  const profiles = [
    { id: "student", label: "Student", icon: GraduationCap, color: "border-blue-200 text-blue-600 bg-blue-50/30 hover:bg-blue-50" },
    { id: "farmer", label: "Farmer", icon: Spade, color: "border-emerald-200 text-emerald-600 bg-emerald-50/30 hover:bg-emerald-50" },
    { id: "senior citizen", label: "Senior Citizen", icon: HeartHandshake, color: "border-amber-200 text-amber-600 bg-amber-50/30 hover:bg-amber-50" },
    { id: "woman entrepreneur", label: "Woman Entrepreneur", icon: UserCheck, color: "border-pink-200 text-pink-600 bg-pink-50/30 hover:bg-pink-50" },
    { id: "startup founder", label: "Startup Founder", icon: Rocket, color: "border-indigo-200 text-indigo-600 bg-indigo-50/30 hover:bg-indigo-50" },
    { id: "job seeker", label: "Job Seeker", icon: Briefcase, color: "border-slate-200 text-slate-600 bg-slate-50/30 hover:bg-slate-50" },
    { id: "person with disability", label: "Person with Disability", icon: Accessibility, color: "border-violet-200 text-violet-600 bg-violet-50/30 hover:bg-violet-50" },
  ];

  // Map selectedProfile to the key in the database
  const getDatabaseKey = (profileId: string): string => {
    if (profileId === "job seeker") return "unemployed";
    return profileId;
  };

  const activeRecommendation = PROFILE_RECOMMENDATIONS.find(
    rec => rec.profile === getDatabaseKey(selectedProfile)
  );

  const handleInferProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situationText.trim() || isInferring) return;

    setIsInferring(true);
    setInferenceFeedback("");
    try {
      const response = await fetch("/api/infer-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: situationText })
      });

      if (!response.ok) {
        throw new Error("Failed to infer profile");
      }

      const data = await response.json();
      if (data.profile) {
        // Find matching profile from standard list
        const matched = profiles.find(p => p.id.toLowerCase() === data.profile.toLowerCase());
        if (matched) {
          setSelectedProfile(matched.id);
          setInferenceFeedback(`AI Match: Selected "${matched.label}" profile based on your description. "${data.explanation}"`);
        } else {
          // Try fuzzy matching or fallback
          if (data.profile.toLowerCase().includes("job") || data.profile.toLowerCase().includes("unemployed")) {
            setSelectedProfile("job seeker");
          } else if (data.profile.toLowerCase().includes("disability") || data.profile.toLowerCase().includes("disabled")) {
            setSelectedProfile("person with disability");
          }
          setInferenceFeedback(`AI Match: ${data.explanation}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      setInferenceFeedback("Failed to run AI profile matcher. Please select your profile card manually below.");
    } finally {
      setIsInferring(false);
    }
  };

  const handleAskAIAboutScheme = (schemeName: string) => {
    onOpenAssistant(`Tell me how to qualify for the "${schemeName}" scheme, what are the application steps, and what benefits does it offer?`);
  };

  const getSchemePortalLink = (schemeName: string): string => {
    const urls: Record<string, string> = {
      "National Scholarship Portal (NSP)": "https://scholarships.gov.in",
      "Vidya Lakshmi Education Loan Scheme": "https://vidyalakshmi.co.in",
      "PM Vidyalaxmi Scheme": "https://pmvidyalaxmi.gov.in",
      "Post-Matric Scholarship Scheme": "https://scholarships.gov.in",
      "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)": "https://pmkisan.gov.in",
      "PM Fasal Bima Yojana (PMFBY)": "https://pmfby.gov.in",
      "PM Krishi Sinchayee Yojana (PMKSY)": "https://pmksy.gov.in",
      "Fertilizer Subsidy Scheme": "https://urvarak.nic.in",
      "Pradhan Mantri Vaya Vandana Yojana (PMVVY)": "https://licindia.in",
      "Senior Citizens Savings Scheme (SCSS)": "https://indiapost.gov.in",
      "Rashtriya Vayoshri Yojana (RVY)": "https://socialjustice.gov.in",
      "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)": "https://nsap.nic.in",
      "Stand-Up India Scheme": "https://standupmitra.in",
      "Mudra Yojana (Shishu, Kishore, Tarun)": "https://mudra.org.in",
      "Mahila Co-operative Banks & SHG loans": "https://nabard.org",
      "Udyam Sakhi Portal": "https://udyamsakhi.msme.gov.in",
      "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)": "https://pmkvyofficial.org",
      "National Career Service (NCS) Portal": "https://ncs.gov.in",
      "Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)": "https://ddugky.gov.in",
      "PM Prime Minister's Employment Generation Programme (PMEGP)": "https://kviconline.gov.in",
      "Startup India Seed Fund Scheme (SISFS)": "https://seedfund.startupindia.gov.in",
      "SIDBI Fund of Funds for Startups (FFS)": "https://sidbiventures.co.in",
      "Credit Guarantee Scheme for Startups (CGSS)": "https://cgtmse.in",
      "MSME Idea Hackathon": "https://my.msme.gov.in",
      "Divyangjan Swavalamban Yojana": "https://nhfdc.nic.in",
      "ADIP Scheme (Assistance to Disabled Persons)": "https://alimco.in",
      "National Fellowship for Persons with Disabilities (NFPwD)": "https://ugc.ac.in",
      "Deendayal Disabled Rehabilitation Scheme (DDRS)": "https://socialjustice.gov.in"
    };
    return urls[schemeName] || "https://www.india.gov.in/my-government/schemes";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and AI inference header */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-100" />
            <span>AI Government Schemes Recommendation</span>
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Select a profile or describe your situation to let Gemini identify matching central and state welfare benefits
          </p>
        </div>

        {/* Free text input */}
        <form onSubmit={handleInferProfile} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 flex items-center focus-within:border-blue-500 focus-within:bg-white transition-all">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-2">Or Describe Situation:</span>
              <input
                type="text"
                placeholder="e.g. 'I run a small tailoring business from home and support my daughters' or 'I am a crop cultivator looking for fertilizer assistance'..."
                value={situationText}
                onChange={(e) => setSituationText(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-xs font-bold text-slate-800 placeholder:text-slate-400 py-2.5"
              />
            </div>
            <button
              type="submit"
              disabled={isInferring || !situationText.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-xs px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {isInferring ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Matching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Analyze with AI</span>
                </>
              )}
            </button>
          </div>

          {inferenceFeedback && (
            <div className={`p-4 rounded-xl flex items-start gap-2.5 text-xs font-bold leading-normal border
              ${inferenceFeedback.startsWith("AI Match") 
                ? "bg-emerald-50 text-emerald-800 border-emerald-150" 
                : "bg-amber-50 text-amber-800 border-amber-150"
              }
            `}>
              {inferenceFeedback.startsWith("AI Match") ? (
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <p>{inferenceFeedback}</p>
            </div>
          )}
        </form>

        <div className="border-t border-slate-100 pt-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Select Your Profile Group
          </p>
          {/* Profile card picker */}
          <div className="flex flex-wrap gap-2">
            {profiles.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedProfile === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProfile(p.id);
                    setInferenceFeedback("");
                  }}
                  className={`border px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer
                    ${isSelected 
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/15 scale-[1.02]" 
                      : `${p.color} border-slate-200 text-slate-700`
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommended Schemes List */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
          Showing Eligible Schemes ({activeRecommendation?.schemes.length || 0})
        </h3>

        {activeRecommendation && activeRecommendation.schemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRecommendation.schemes.map((scheme, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-extrabold text-slate-900 tracking-tight text-sm leading-tight">
                      {scheme.name}
                    </h4>
                    <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0">
                      Central Welfare
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold leading-normal">
                    {scheme.description}
                  </p>
                  
                  {/* Summary grid */}
                  <div className="grid grid-cols-1 gap-2 pt-1 border-t border-slate-100 text-[11px] font-bold">
                    <div className="flex gap-1">
                      <span className="text-slate-400 uppercase tracking-wider text-[9px] shrink-0 w-16">Helps Who:</span>
                      <span className="text-slate-700">{scheme.helpsWho}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-slate-400 uppercase tracking-wider text-[9px] shrink-0 w-16">Offers What:</span>
                      <span className="text-slate-800">{scheme.offersWhat}</span>
                    </div>
                  </div>
                </div>

                {/* Apply/Verify links */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <a 
                    href={getSchemePortalLink(scheme.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-center cursor-pointer"
                  >
                    <span>Apply on Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleAskAIAboutScheme(scheme.name)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-xs px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Analyze Checklist</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white border border-slate-200 rounded-2xl text-slate-400">
            No recommended schemes found for this profile.
          </div>
        )}
      </div>
    </div>
  );
}
