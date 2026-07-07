import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Dashboard from "./components/Dashboard";
import GovernmentServices from "./components/GovernmentServices";
import Schemes from "./components/Schemes";
import ComplaintsDashboard from "./components/ComplaintsDashboard";
import DocumentVault from "./components/DocumentVault";
import FloatingAssistant from "./components/FloatingAssistant";
import Settings from "./components/Settings";
import NearbyOffices from "./components/NearbyOffices";
import AiWorkspace from "./components/AiWorkspace";
import AuthPage from "./components/AuthPage";
import { LanguageCode, Message, Complaint, UploadedDocument } from "./types";
import { AuthService } from "./services/auth";
import { BotMessageSquare, AlertCircle } from "lucide-react";

// Translations for general app wrapper if needed
const LABELS: Record<string, any> = {
  en: {
    disclaimer: "Illustrative digital simulation. Always verify on official portals.",
    simulateProgress: "Simulate Step Progress",
    formalStatement: "FORMAL REGISTRY DRAFT",
    locationLabel: "REPORTED LOCATION",
    categoryText: "DEPARTMENT",
    categories: {
      "roads/potholes": "Roads & Potholes",
      "garbage/sanitation": "Garbage & Sanitation",
      "water supply": "Water Supply",
      "streetlight": "Streetlight",
      "public safety": "Public Safety",
      "other": "Other Civic Issue"
    }
  },
  hi: {
    disclaimer: "अनुकरणीय डिजिटल सिमुलेशन। हमेशा आधिकारिक पोर्टल पर सत्यापित करें।",
    simulateProgress: "प्रगति का अनुकरण करें",
    formalStatement: "औपचारिक रजिस्ट्री मसौदा",
    locationLabel: "सूचित स्थान",
    categoryText: "विभाग",
    categories: {
      "roads/potholes": "सड़कें और गड्ढे",
      "garbage/sanitation": "कचरा और स्वच्छता",
      "water supply": "पानी की आपूर्ति",
      "streetlight": "बिजली की रोशनी",
      "public safety": "सार्वजनिक सुरक्षा",
      "other": "अन्य नागरिक समस्या"
    }
  },
  ta: {
    disclaimer: "விளக்கக் கூடிய சிமுலேஷன். எப்போதும் அதிகாரப்பூர்வ போர்ட்டலில் சரிபார்க்கவும்.",
    simulateProgress: "செயல்முறையை நகர்த்துக",
    formalStatement: "அதிகாரப்பூர்வ பதிவு நகல்",
    locationLabel: "அறிவிக்கப்பட்ட இடம்",
    categoryText: "துறை",
    categories: {
      "roads/potholes": "சாலைகள் & பள்ளங்கள்",
      "garbage/sanitation": "குப்பை & சுகாதாரம்",
      "water supply": "குடிநீர் விநியோகம்",
      "streetlight": "தெருவிளக்கு",
      "public safety": "பொது பாதுகாப்பு",
      "other": "இதர சிவில் பிரச்சனை"
    }
  },
  te: {
    disclaimer: "నమూనా డిజిటల్ సిమ్యులేషన్. ఎల్లప్పుడూ అధికారిక పోర్టల్‌లలో సరిచూసుకోండి.",
    simulateProgress: "పురోగతిని అనుకరించండి",
    formalStatement: "అధికారిక రిజిస్ట్రీ డ్రాఫ్ట్",
    locationLabel: "నివేదించబడిన స్థానం",
    categoryText: "విభాగం",
    categories: {
      "roads/potholes": "రోడ్లు మరియు గుంతలు",
      "garbage/sanitation": "చెత్త మరియు పారిశుధ్యం",
      "water supply": "నీటి సరఫరా",
      "streetlight": "వీధి దీపం",
      "public safety": "ప్రజా రక్షణ",
      "other": "ఇతర సివిక్ సమస్య"
    }
  },
  ml: {
    disclaimer: "മാതൃകാ ഡിജിറ്റൽ സിമുലേഷൻ. എപ്പോഴും ഔദ്യോഗിക പോർട്ടലിൽ പരിശോധിക്കുക.",
    simulateProgress: "പുരോഗതി പരിശോധിക്കുക",
    formalStatement: "ഔദ്യോഗിക രജിസ്ട്രി വിവരണം",
    locationLabel: "റിപ്പോർട്ട് ചെയ്ത സ്ഥലം",
    categoryText: "വകുപ്പ്",
    categories: {
      "roads/potholes": "റോഡുകളും കുഴികളും",
      "garbage/sanitation": "മാലിന്യവും ശുചിത്വവും",
      "water supply": "ജലവിതരണം",
      "streetlight": "സ്ട്രീറ്റ് ലൈറ്റ്",
      "public safety": "പൊതു സുരക്ഷ",
      "other": "മറ്റ് സിവിക് പ്രശ്നങ്ങൾ"
    }
  },
  bn: {
    disclaimer: "চিত্রণমূলক ডিজিটাল সিমুলেশন। সর্বদা অফিসিয়াল পোর্টালে যাচাই করুন।",
    simulateProgress: "অগ্রগতি অনুকরণ করুন",
    formalStatement: "আনুষ্ঠানিক বিবৃতির খসড়া",
    locationLabel: "রিপোর্ট করা অবস্থান",
    categoryText: "বিভাগ",
    categories: {
      "roads/potholes": "রাস্তা ও গর্ত",
      "garbage/sanitation": "আবর্জনা ও পরিচ্ছন্নতা",
      "water supply": "জল সরবরাহ",
      "streetlight": "রাস্তার আলো",
      "public safety": "জননিরাপত্তা",
      "other": "অন্যান্য নাগরিক সমস্যা"
    }
  }
};

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: "CIV-82719",
    category: "roads/potholes",
    originalDescription: "There is a massive pothole in front of my gate. Water is getting filled and mosquitoes are multiplying. Motorbikes slip every day.",
    formalComplaint: "Severe road deterioration and deep waterlogging due to structural depression in the public asphalt carriage-way, presenting a severe risk of vehicular accidents and a public health hazard due to stagnant breeding grounds.",
    location: "G-12 Lane, Sector 3, Salt Lake, Kolkata",
    status: "Under review",
    timestamp: "2026-07-04 10:15",
    estimatedCompletion: "5 days",
  },
  {
    id: "CIV-45218",
    category: "water supply",
    originalDescription: "Low water pressure in our lane for the last 10 days. Water is muddy.",
    formalComplaint: "Critical drop in municipal water line supply pressure alongside high turbidity levels, requiring physical inspection of the primary water distribution node by the Municipal Water Board.",
    location: "Sector 2, Pragati Nagar, Delhi",
    status: "Under review",
    timestamp: "2026-07-05 14:20",
    estimatedCompletion: "3 days",
    holdReason: "Property tax assessment number required to link water connection repair.",
    actionableNextStep: "Please upload a copy of your latest water bill / tax receipt in the Document Vault to verify identity."
  },
  {
    id: "CIV-31209",
    category: "streetlight",
    originalDescription: "The lights in the public park have not been working since last Wednesday, women feel unsafe to walk after dark.",
    formalComplaint: "Failure of multiple luminaires and municipal street lighting poles across the primary perimeter of the municipal public park, compromising security levels.",
    location: "Netaji Park, Ward No. 14, Chennai",
    status: "Resolved",
    timestamp: "2026-07-05 18:30",
    estimatedCompletion: "Resolved",
  }
];

export default function App() {
  // Persistence States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return AuthService.getCurrentUser() !== null;
  });
  const [userName, setUserName] = useState<string>(() => {
    return AuthService.getCurrentUser()?.fullName || "";
  });
  const [language, setLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem("sb_language") as LanguageCode) || "en";
  });
  const [isLargeText, setIsLargeText] = useState<boolean>(() => {
    return localStorage.getItem("sb_isLargeText") === "true";
  });
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem("sb_complaints");
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });
  const [documents, setDocuments] = useState<UploadedDocument[]>(() => {
    const saved = localStorage.getItem("sb_documents");
    return saved ? JSON.parse(saved) : [];
  });
  const [chatMessages, setChatMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("sb_chatMessages");
    return saved ? JSON.parse(saved) : [];
  });

  // UI Flow States
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>("");
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [floatingChatOpen, setFloatingChatOpen] = useState<boolean>(false);
  
  // Pre-fill states for Complaints from AI Image Analyzer
  const [complaintPreFill, setComplaintPreFill] = useState<{
    category: string;
    description: string;
    image: string | null;
  } | null>(null);
  
  // Trace logs of actions to show in "Recent Activity" on the Dashboard
  const [recentActivities, setRecentActivities] = useState<string[]>([
    "Passport checklist saved for application",
    "Complaint CIV-82719 updated to Under Review",
    "Vidya Lakshmi Scholarship scheme viewed"
  ]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("sb_isLoggedIn", String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem("sb_userName", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("sb_language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("sb_isLargeText", String(isLargeText));
  }, [isLargeText]);

  useEffect(() => {
    localStorage.setItem("sb_complaints", JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem("sb_documents", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("sb_chatMessages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  const addActivityLog = (text: string) => {
    setRecentActivities(prev => [text, ...prev.slice(0, 4)]);
  };

  // Chat message sender logic communicating with server-side Gemini
  const handleSendChatMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const newMessages = [...chatMessages, { sender: "user" as const, text: textToSend }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    setFloatingChatOpen(true); // make sure bubble expands

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages.slice(-8), // send last 8 turns of context
          language: language,
          complaints: complaints
        })
      });

      if (!response.ok) {
        throw new Error("Failed to reach Gemini proxy");
      }

      const data = await response.json();
      setChatMessages([...newMessages, {
        sender: "bot",
        text: data.text,
        matchedServiceId: data.matchedServiceId
      }]);

      addActivityLog(`AI Companion: Query on "${textToSend.substring(0, 20)}..." answered`);

    } catch (err: any) {
      console.error(err);
      setChatMessages([...newMessages, {
        sender: "bot",
        text: `Hello! 👋 I am experiencing a minor connectivity error with my digital core. Please make sure your server is fully compiled. Fallback: For Aadhaar Card, please bring a passport-sized photo, proof of address, and proof of age to your closest CSC.`
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleOpenAssistantWithPreFill = (text: string) => {
    setChatInput(text);
    setFloatingChatOpen(true);
    // Automatically execute the pre-filled question immediately!
    handleSendChatMessage(text);
  };

  const handleNavigateFromDashboard = (section: string, arg?: any) => {
    setActiveSection(section);
    if (section === "services" && typeof arg === "string") {
      setServiceSearchQuery(arg);
      addActivityLog(`Searched service directory for: "${arg}"`);
    } else if (section === "complaints" && arg === "new") {
      // We trigger reporting state in Complaints Dashboard by scrolling or layout focus
      addActivityLog("Initiated new public grievance report");
    } else {
      addActivityLog(`Visited Section: ${section.toUpperCase()}`);
    }
  };

  const currentTranslation = LABELS[language] || LABELS.en;

  if (!isLoggedIn) {
    return (
      <AuthPage 
        language={language} 
        onLoginSuccess={(name) => {
          setUserName(name);
          setIsLoggedIn(true);
          addActivityLog("Authenticated securely via Citizen Gate");
        }} 
      />
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-sans tracking-tight ${isLargeText ? "text-lg" : "text-sm"}`}>
      {/* 1. Collapsible Sidebar Navigation */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={(sec) => {
          setActiveSection(sec);
          if (sec !== "services") setServiceSearchQuery("");
        }} 
        userName={userName} 
        language={language}
      />

      {/* 2. Main Page Layout Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Responsive Header TopBar */}
        <TopBar 
          language={language}
          setLanguage={setLanguage}
          userName={userName}
          onOpenAssistant={() => setFloatingChatOpen(true)}
          setActiveSection={setActiveSection}
          onLogout={() => {
            AuthService.logout();
            setIsLoggedIn(false);
            setUserName("");
            setComplaints(INITIAL_COMPLAINTS);
            setDocuments([]);
            setChatMessages([]);
            addActivityLog("Logged out of citizen portal");
          }}
        />

        {/* Primary Page Canvas */}
        <main className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl w-full mx-auto pb-24">
          
          {activeSection === "dashboard" && (
            <div className="space-y-8">
              <Dashboard 
                userName={userName}
                onNavigate={handleNavigateFromDashboard}
                complaints={complaints}
                documents={documents}
                eligibleSchemesCount={selectedProfileSchemesCount(userName)}
                recentActivities={recentActivities}
                language={language}
              />
              
              {/* Nearby Seva Offices Embedded Directly on Dashboard */}
              <NearbyOffices />
            </div>
          )}

          {activeSection === "services" && (
            <GovernmentServices 
              initialSearchQuery={serviceSearchQuery}
              onOpenAssistant={handleOpenAssistantWithPreFill}
              language={language}
            />
          )}

          {activeSection === "schemes" && (
            <Schemes 
              onOpenAssistant={handleOpenAssistantWithPreFill}
            />
          )}

          {activeSection === "complaints" && (
            <ComplaintsDashboard 
              complaints={complaints}
              setComplaints={(update) => {
                setComplaints(update);
                addActivityLog("Civic grievance ledger synchronized");
              }}
              language={language}
              preFillCategory={complaintPreFill?.category}
              preFillDescription={complaintPreFill?.description}
              preFillImage={complaintPreFill?.image || undefined}
            />
          )}

          {activeSection === "documents" && (
            <DocumentVault 
              documents={documents}
              setDocuments={(update) => {
                setDocuments(update);
                addActivityLog("Secure credentials record synchronized");
              }}
            />
          )}

          {activeSection === "ai" && (
            <AiWorkspace 
              language={language}
              userName={userName}
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              chatLoading={chatLoading}
              onSendMessage={handleSendChatMessage}
              onNavigate={(section, arg) => {
                if (section === "complaints" && arg && arg.preFill) {
                  setComplaintPreFill({
                    category: arg.category,
                    description: arg.description,
                    image: arg.image
                  });
                  setActiveSection("complaints");
                  addActivityLog("Prefilled civic grievance from AI vision analysis");
                } else {
                  setActiveSection(section);
                  addActivityLog(`Visited Section: ${section.toUpperCase()}`);
                }
              }}
              documents={documents}
              setDocuments={setDocuments}
              complaints={complaints}
              setComplaints={setComplaints}
            />
          )}

          {activeSection === "settings" && (
            <Settings 
              userName={userName}
              setUserName={setUserName}
              language={language}
              setLanguage={setLanguage}
              isLargeText={isLargeText}
              setIsLargeText={setIsLargeText}
              t={currentTranslation}
            />
          )}

        </main>

        {/* Global Floating Assistant Bubble (Always visible except when on dedicated AI Assistant tab) */}
        {activeSection !== "ai" && (
          <FloatingAssistant 
            isOpen={floatingChatOpen} 
            setIsOpen={setFloatingChatOpen}
            messages={chatMessages}
            setMessages={setChatMessages}
            input={chatInput}
            setInput={setChatInput}
            loading={chatLoading}
            onSendMessage={handleSendChatMessage}
            language={language}
          />
        )}

        {/* Static Footer */}
        <footer className="bg-white border-t border-slate-200 px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] font-bold text-slate-400 uppercase text-center mt-auto">
          <p>© 2026 National Digital Civic Infrastructure Project</p>
          <p className="text-blue-700/80 font-black max-w-sm md:max-w-xl">
            {currentTranslation.disclaimer}
          </p>
          <p>Smart Bharat v2.5</p>
        </footer>
      </div>
    </div>
  );
}

// Simple helper to guess eligible schemes counts
function selectedProfileSchemesCount(name: string): number {
  return 8; // standard central schemes catalog
}
