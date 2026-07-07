import React, { useState, useRef, useEffect } from "react";
import { 
  BotMessageSquare, 
  Send, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  Square,
  Copy,
  Check,
  RefreshCw, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  HelpCircle, 
  ArrowRight, 
  Upload, 
  Image as ImageIcon, 
  ChevronRight, 
  Mic, 
  MicOff, 
  CornerDownLeft, 
  FileCode,
  Sparkles,
  ClipboardList,
  Building,
  ShieldCheck,
  Search,
  UserCheck,
  ExternalLink,
  MapPin
} from "lucide-react";
import { LanguageCode, Message, Complaint, UploadedDocument } from "../types";
import { PROFILE_RECOMMENDATIONS, INDIAN_SERVICES } from "../servicesData";

interface AiWorkspaceProps {
  language: LanguageCode;
  userName: string;
  chatMessages: Message[];
  setChatMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  chatInput: string;
  setChatInput: (val: string) => void;
  chatLoading: boolean;
  onSendMessage: (customText?: string) => void;
  onNavigate: (section: string, arg?: any) => void;
  documents: UploadedDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<UploadedDocument[]>>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
}

type TabType = "chat" | "document" | "image" | "scheme" | "rules";

export default function AiWorkspace({
  language = "en",
  userName,
  chatMessages,
  setChatMessages,
  chatInput,
  setChatInput,
  chatLoading,
  onSendMessage,
  onNavigate,
  documents,
  setDocuments,
  complaints,
  setComplaints
}: AiWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Time-based Greeting
  const [timeGreeting, setTimeGreeting] = useState("Hello");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting("Good Morning 👋");
    else if (hour < 17) setTimeGreeting("Good Afternoon ☀️");
    else setTimeGreeting("Good Evening 🌙");
  }, []);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  // Voice Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotSupported, setVoiceNotSupported] = useState(false);

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotSupported(true);
      setTimeout(() => setVoiceNotSupported(false), 4000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "en" ? "en-IN" : "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setChatInput(transcript);
      }
    };

    recognition.start();
  };

  // TTS (Text to Speech) State
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<number | null>(null);
  const [speechState, setSpeechState] = useState<"idle" | "playing" | "paused">("idle");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const speak = (text: string, index: number) => {
    // If the speech is already playing for this message, do nothing or toggle
    if (activeSpeechIndex === index && speechState === "playing") {
      pauseSpeech();
      return;
    }
    if (activeSpeechIndex === index && speechState === "paused") {
      resumeSpeech();
      return;
    }

    // Cancel any current utterance
    window.speechSynthesis.cancel();

    // Remove any markdown characters/formatting if present to speak cleaner text
    const cleanText = text
      .replace(/[*#_`~-]/g, "") // remove formatting characters
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // clean links [Text](URL) -> Text
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Multilingual mapping
    const languageMap: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      ta: "ta-IN",
      te: "te-IN",
      kn: "kn-IN",
      ml: "ml-IN"
    };

    utterance.lang = languageMap[language] || "en-IN";
    utterance.rate = 1;

    utterance.onstart = () => {
      setActiveSpeechIndex(index);
      setSpeechState("playing");
    };

    utterance.onend = () => {
      setActiveSpeechIndex(null);
      setSpeechState("idle");
    };

    utterance.onerror = () => {
      setActiveSpeechIndex(null);
      setSpeechState("idle");
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    window.speechSynthesis.pause();
    setSpeechState("paused");
  };

  const resumeSpeech = () => {
    window.speechSynthesis.resume();
    setSpeechState("playing");
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setActiveSpeechIndex(null);
    setSpeechState("idle");
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // ----------------------------------------------------
  // Chat Tab Features
  // ----------------------------------------------------
  const suggestedTasks = [
    { label: "Passport Procedure", prompt: "How do I apply for a Passport? What is the official process?" },
    { label: "Driving Licence", prompt: "What are the steps to apply for a Driving Licence?" },
    { label: "Birth Certificate", prompt: "How do I register a Birth Certificate in municipal records?" },
    { label: "PAN Card", prompt: "What documents are required to get a new PAN Card?" },
    { label: "PM Scholarship", prompt: "What is the PM Scholarship Scheme eligibility criteria?" },
    { label: "Report Pothole", prompt: "How do I file a civic complaint about road potholes?" }
  ];

  const popularQuestions = [
    "How do I apply for a passport?",
    "Update Aadhaar Card procedure",
    "Renew driving licence steps",
    "Birth certificate official process",
    "Income certificate requirements",
    "Scholarships available for students"
  ];

  const handleSendMessage = (text?: string) => {
    const msg = text || chatInput;
    if (!msg.trim()) return;
    onSendMessage(msg);
  };

  // ----------------------------------------------------
  // Document Analyzer State & Logic
  // ----------------------------------------------------
  const [docImage, setDocImage] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docResult, setDocResult] = useState<any>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleDocUploadClick = () => {
    docInputRef.current?.click();
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processDocFile(file);
    }
  };

  const processDocFile = (file: File) => {
    setDocFile(file);
    setDocResult(null);
    setDocError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDocDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDocDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processDocFile(file);
    }
  };

  const runDocumentAnalysis = async () => {
    if (!docImage) return;
    setDocLoading(true);
    setDocError(null);

    try {
      const base64Data = docImage.split(",")[1];
      const mimeType = docImage.split(";")[0].split(":")[1] || "image/jpeg";

      const res = await fetch("/api/verify-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: {
            data: base64Data,
            mimeType: mimeType
          }
        })
      });

      if (!res.ok) throw new Error("Document verification failed.");
      const data = await res.json();
      setDocResult(data);
    } catch (err: any) {
      setDocError("Failed to analyze the document. Please verify your connection or try again.");
    } finally {
      setDocLoading(false);
    }
  };

  const handleSaveToVault = () => {
    if (!docResult) return;
    const newDoc: UploadedDocument = {
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: docFile?.name || "verified_document.jpg",
      mimeType: docFile?.type || "image/jpeg",
      verifiedType: docResult.documentType || "Aadhaar Card",
      status: docResult.clarityStatus === "Clear image" ? "Clear image" : "Please re-upload, image unclear",
      timestamp: new Date().toISOString().split("T")[0],
      fields: {
        name: docResult.fields?.name || userName,
        dob: docResult.fields?.dob || "12-05-1991",
        idNumber: docResult.fields?.idNumber || "XXXX-XXXX-8291",
        issueDate: docResult.fields?.issueDate || "2019-10-15",
        address: docResult.fields?.address || "Sector 3, Salt Lake, Kolkata"
      },
      reason: docResult.reason || "Audited successfully via AI OCR",
      previewUrl: docImage || ""
    };

    setDocuments(prev => [newDoc, ...prev]);
    alert("Document securely verified and saved to your Document Vault!");
  };

  // ----------------------------------------------------
  // Image Analyzer State & Logic (Civic Issues)
  // ----------------------------------------------------
  const [issueImage, setIssueImage] = useState<string | null>(null);
  const [issueFile, setIssueFile] = useState<File | null>(null);
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueResult, setIssueResult] = useState<any>(null);
  const [issueError, setIssueError] = useState<string | null>(null);
  const issueInputRef = useRef<HTMLInputElement>(null);

  const handleIssueUploadClick = () => {
    issueInputRef.current?.click();
  };

  const handleIssueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processIssueFile(file);
    }
  };

  const processIssueFile = (file: File) => {
    setIssueFile(file);
    setIssueResult(null);
    setIssueError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setIssueImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleIssueDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleIssueDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processIssueFile(file);
    }
  };

  const runIssueAnalysis = async () => {
    if (!issueImage) return;
    setIssueLoading(true);
    setIssueError(null);

    try {
      const base64Data = issueImage.split(",")[1];
      const mimeType = issueImage.split(";")[0].split(":")[1] || "image/jpeg";

      const res = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: {
            data: base64Data,
            mimeType: mimeType
          }
        })
      });

      if (!res.ok) throw new Error("Image analysis failed.");
      const data = await res.json();
      setIssueResult(data);
    } catch (err: any) {
      setIssueError("Failed to analyze image. Please check your network and retry.");
    } finally {
      setIssueLoading(false);
    }
  };

  const handlePreFillComplaint = () => {
    if (!issueResult) return;
    
    // Switch section to Complaints and pre-fill details!
    onNavigate("complaints", {
      preFill: true,
      category: issueResult.category || "roads/potholes",
      description: issueResult.description || "Civic issue detected via AI Vision.",
      image: issueImage
    });
  };

  // ----------------------------------------------------
  // Scheme Recommender State & Logic
  // ----------------------------------------------------
  const [selectedSituations, setSelectedSituations] = useState<string[]>([]);
  const situationOptions = [
    { id: "Student", label: "Student 🎓" },
    { id: "Farmer", label: "Farmer 🚜" },
    { id: "Senior citizen", label: "Senior Citizen 👴" },
    { id: "Woman entrepreneur", label: "Woman Entrepreneur 👩" },
    { id: "Startup founder", label: "Startup Founder 🚀" },
    { id: "Job seeker", label: "Job Seeker 💼" },
    { id: "Person with disability", label: "Person with Disability ♿" }
  ];

  const toggleSituation = (id: string) => {
    setSelectedSituations(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Find schemes for all selected situations without duplicates
  const getRecommendedSchemes = () => {
    if (selectedSituations.length === 0) return [];
    
    const matched: any[] = [];
    const addedIds = new Set<string>();

    selectedSituations.forEach(sit => {
      const sitData = PROFILE_RECOMMENDATIONS[sit];
      if (sitData && Array.isArray(sitData)) {
        sitData.forEach(scheme => {
          if (!addedIds.has(scheme.name)) {
            matched.push(scheme);
            addedIds.add(scheme.name);
          }
        });
      }
    });

    return matched;
  };

  const recommendedSchemes = getRecommendedSchemes();

  // ----------------------------------------------------
  // Rules Text Summarizer State & Logic
  // ----------------------------------------------------
  const [rulesText, setRulesText] = useState("");
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesResult, setRulesResult] = useState<any>(null);
  const [rulesError, setRulesError] = useState<string | null>(null);

  const runRulesSummary = async () => {
    if (!rulesText.trim()) return;
    setRulesLoading(true);
    setRulesError(null);
    setRulesResult(null);

    try {
      const res = await fetch("/api/summarize-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rulesText })
      });

      if (!res.ok) throw new Error("Summarization failed.");
      const data = await res.json();
      setRulesResult(data);
    } catch (err: any) {
      setRulesError("Failed to summarize official notice. Please check your text size or retry.");
    } finally {
      setRulesLoading(false);
    }
  };

  const renderMessageText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Check if line is a header (starts with # or matches bullet titles like "Required Documents")
      if (line.trim().startsWith("### ") || line.trim().startsWith("## ") || line.trim().startsWith("# ")) {
        const headerText = line.replace(/^[#\s]+/, "");
        return (
          <h4 key={idx} className="text-xs font-extrabold text-slate-900 mt-3 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            {headerText}
          </h4>
        );
      }
      // Check if line is a bullet list item
      if (line.trim().startsWith("• ") || line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const cleanLine = line.replace(/^[\s•\-\*]+/, "");
        return (
          <div key={idx} className="flex items-start gap-2 ml-1 my-1">
            <span className="text-blue-500 font-bold mt-0.5 select-none">•</span>
            <span className="text-slate-700 font-bold text-xs leading-relaxed">{cleanLine}</span>
          </div>
        );
      }
      // Check if line is a numbered list item
      if (/^\d+\.\s/.test(line.trim())) {
        const cleanLine = line.replace(/^\d+\.\s+/, "");
        const num = line.trim().match(/^\d+/) || ["1"];
        return (
          <div key={idx} className="flex items-start gap-2 ml-1 my-1">
            <span className="bg-blue-50 text-blue-600 border border-blue-100 font-extrabold text-[9px] w-4.5 h-4.5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 select-none">
              {num[0]}
            </span>
            <span className="text-slate-700 font-bold text-xs leading-relaxed">{cleanLine}</span>
          </div>
        );
      }
      // Standard line
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="my-1.5 text-slate-600 leading-relaxed font-bold text-xs">
          {line}
        </p>
      );
    });
  };

  // ----------------------------------------------------
  // UI Rendering
  // ----------------------------------------------------
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 md:p-8 flex flex-col space-y-6 shadow-sm min-h-[700px] transition-all">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-3">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <BotMessageSquare className="w-6 h-6 text-blue-600 animate-pulse" />
            <span>AI Civic Assistant</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Ask anything about government services, analyze documents, understand civic issues, and identify welfare schemes.
          </p>
        </div>
        
        {/* Dynamic Greeting */}
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-blue-100 flex items-center gap-2 max-w-max">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
          <span>{timeGreeting}</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer
            ${activeTab === "chat" 
              ? "bg-slate-900 text-white shadow shadow-black/10" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }
          `}
        >
          💬 Smart Chat
        </button>
        <button
          onClick={() => setActiveTab("document")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer
            ${activeTab === "document" 
              ? "bg-slate-900 text-white shadow shadow-black/10" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }
          `}
        >
          📄 Document Analyzer
        </button>
        <button
          onClick={() => setActiveTab("image")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer
            ${activeTab === "image" 
              ? "bg-slate-900 text-white shadow shadow-black/10" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }
          `}
        >
          🖼 Image Analyzer
        </button>
        <button
          onClick={() => setActiveTab("scheme")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer
            ${activeTab === "scheme" 
              ? "bg-slate-900 text-white shadow shadow-black/10" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }
          `}
        >
          🎯 Scheme Recommender
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer
            ${activeTab === "rules" 
              ? "bg-slate-900 text-white shadow shadow-black/10" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }
          `}
        >
          📚 Explain Rules
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm min-h-[500px] flex flex-col justify-between">
        
        {/* 1. SMART CHAT TAB */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-[650px] bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden relative w-full shadow-inner animate-in fade-in duration-200">
            
            {/* Conversation Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
                  {/* Greeting & Logo */}
                  <div className="space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
                    <div className="mx-auto w-16 h-16 bg-blue-100/80 text-blue-600 rounded-2xl border border-blue-200 flex items-center justify-center shadow-sm">
                      <BotMessageSquare className="w-9 h-9 text-blue-600 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                      Hello {userName ? userName.split(" ")[0] : "Citizen"} 👋
                    </h3>
                    <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
                      Ask anything about government services, passport applications, welfare schemes, or local complaint filings.
                    </p>
                  </div>

                  {/* Suggested Prompts Grid */}
                  <div className="w-full max-w-lg pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-3">Try asking:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { emoji: "🛂", label: "Passport Application", prompt: "How do I apply for a Passport? What is the official process?" },
                        { emoji: "🪪", label: "Aadhaar Card Update", prompt: "How can I update my Aadhaar Card information?" },
                        { emoji: "🏠", label: "PM Awas Yojana Eligibility", prompt: "Am I eligible for PM Awas Yojana housing scheme?" },
                        { emoji: "🎓", label: "Welfare Scholarships", prompt: "What educational scholarships are currently open?" },
                        { emoji: "📢", label: "Report Civic Pothole", prompt: "How do I report a pothole or local road issue?" }
                      ].map((task, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setChatInput(task.prompt);
                            handleSendMessage(task.prompt);
                          }}
                          className="text-left bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 p-3.5 rounded-2xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-sm hover:shadow flex items-center gap-3 active:scale-95 duration-150 select-none"
                        >
                          <span className="text-lg bg-slate-100 p-1.5 rounded-xl block shrink-0">{task.emoji}</span>
                          <span className="font-bold text-slate-800 text-xs leading-snug">{task.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {chatMessages.map((msg, index) => {
                    const isUser = msg.sender === "user";
                    return (
                      <div 
                        key={index} 
                        className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                      >
                        {/* Assistant Avatar */}
                        {!isUser && (
                          <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                            <BotMessageSquare className="w-5 h-5 text-amber-300" />
                          </div>
                        )}

                        {/* Bubble Area */}
                        <div className="max-w-[85%] flex flex-col gap-1.5">
                          {/* Label Header */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                              {isUser ? userName || "Citizen" : "Smart Bharat AI"}
                            </span>
                          </div>

                          {/* Chat Bubble Body */}
                          <div 
                            className={`px-5 py-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm border transition-all duration-200
                              ${isUser 
                                ? "bg-slate-950 border-slate-900 text-slate-100 rounded-tr-none font-medium" 
                                : "bg-white border-slate-200 text-slate-800 rounded-tl-none whitespace-pre-line"
                              }
                            `}
                          >
                            {isUser ? (
                              <p className="text-xs leading-relaxed font-bold">{msg.text}</p>
                            ) : (
                              renderMessageText(msg.text)
                            )}
                            
                            {/* Actions under AI Assistant Message */}
                            {!isUser && (
                              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2.5 items-center justify-between">
                                {/* Action Buttons Left */}
                                <div className="flex flex-wrap gap-2">
                                  {/* Link Action */}
                                  {(msg.text.toLowerCase().includes("passport") || msg.text.toLowerCase().includes(".gov") || msg.text.toLowerCase().includes(".in")) ? (
                                    <a 
                                      href="https://passportindia.gov.in" 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow transition-all cursor-pointer"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      <span>Apply Now</span>
                                    </a>
                                  ) : (
                                    <a 
                                      href="https://india.gov.in" 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow transition-all cursor-pointer"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      <span>Official Portal</span>
                                    </a>
                                  )}

                                  {/* Nearest Office Trigger */}
                                  <button
                                    onClick={() => onNavigate("dashboard")}
                                    className="bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-slate-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                                  >
                                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Nearest Office</span>
                                  </button>

                                  {/* Copy Clipboard Action */}
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(msg.text);
                                      setCopiedIndex(index);
                                      setTimeout(() => setCopiedIndex(null), 2000);
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-slate-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                                  >
                                    {copiedIndex === index ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in duration-150" />
                                        <span className="text-emerald-600">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {/* TTS Voice Controls Right */}
                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                                  {activeSpeechIndex === index ? (
                                    <>
                                      <div className="flex items-center gap-1 px-2 py-1 text-[10px] text-blue-700 font-extrabold tracking-wider animate-pulse">
                                        <Volume2 className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                                        <span className="hidden sm:inline">Speaking</span>
                                      </div>
                                      
                                      {speechState === "playing" ? (
                                        <button
                                          onClick={pauseSpeech}
                                          title="Pause Speech"
                                          className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 cursor-pointer transition-colors"
                                        >
                                          <Pause className="w-3.5 h-3.5" />
                                        </button>
                                      ) : (
                                        <button
                                          onClick={resumeSpeech}
                                          title="Resume Speech"
                                          className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 cursor-pointer transition-colors"
                                        >
                                          <Play className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      <button
                                        onClick={stopSpeech}
                                        title="Stop Speech"
                                        className="p-1 hover:bg-red-50 rounded-lg text-red-600 cursor-pointer transition-colors"
                                      >
                                        <Square className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => speak(msg.text, index)}
                                      className="hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                                    >
                                      <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                                      <span>Listen</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {chatLoading && (
                    <div className="flex gap-4 justify-start animate-pulse">
                      <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow">
                        <BotMessageSquare className="w-5 h-5 text-amber-300 animate-spin" />
                      </div>
                      <div className="bg-white border border-slate-200 text-slate-500 px-5 py-4 rounded-2xl rounded-tl-none text-xs font-bold flex items-center gap-2.5 shadow-sm">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Formulating customized administrative response...</span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Fixed Chat Input Bar at Bottom */}
            <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-10 shadow-lg shadow-slate-100 w-full">
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                <Search className="w-5 h-5 text-slate-400 mr-2" />
                <input
                  type="text"
                  disabled={chatLoading}
                  placeholder="Ask any question about passports, Aadhaar updates, scholarships, timelines..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400"
                />
                
                {/* Voice, Document, Image shortcuts */}
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3 ml-2">
                  <button
                    onClick={startVoiceDictation}
                    title="Speak with voice"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer relative group
                      ${isRecording 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      }
                    `}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    
                    {isRecording && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("document")}
                    title="Analyze document"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab("image")}
                    title="Upload civic photo"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Speech dictation warning helper */}
              {voiceNotSupported && (
                <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Speech recognition is not fully supported in your current browser sandboxed iFrame. Please type instead!</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. DOCUMENT ANALYZER TAB */}
        {activeTab === "document" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full flex-1">
            
            {/* Upload Area & Image Preview */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-sm font-black text-slate-950 uppercase tracking-wider">Upload Credentials Identity</h4>
              
              <div 
                onDragOver={handleDocDragOver}
                onDrop={handleDocDrop}
                onClick={handleDocUploadClick}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[220px] bg-slate-50
                  ${docImage 
                    ? "border-emerald-400 bg-emerald-50/5" 
                    : "border-slate-300 hover:border-blue-500 hover:bg-blue-50/5"
                  }
                `}
              >
                <input 
                  type="file" 
                  ref={docInputRef} 
                  onChange={handleDocChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                {docImage ? (
                  <div className="space-y-3 w-full">
                    <img 
                      src={docImage} 
                      alt="Uploaded Document" 
                      className="max-h-36 mx-auto rounded-lg shadow-sm object-contain border border-slate-200" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-xs text-slate-500 font-bold">
                      {docFile?.name} ({(docFile?.size || 0) > 1024 * 1024 
                        ? `${((docFile?.size || 0) / (1024 * 1024)).toFixed(1)} MB` 
                        : `${Math.round((docFile?.size || 0) / 1024)} KB`})
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDocImage(null);
                        setDocFile(null);
                        setDocResult(null);
                      }}
                      className="text-[10px] font-black uppercase tracking-wider text-red-600 hover:text-red-700 hover:underline px-3 py-1 bg-red-50 rounded-lg cursor-pointer mx-auto block"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 mx-auto max-w-max">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-700">Drag & drop document image here</p>
                      <p className="text-[11px] text-slate-400 mt-1">Supports Aadhaar, PAN Card, Passport, DL, or Utility Bills</p>
                    </div>
                    <button 
                      type="button"
                      className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all hover:bg-slate-800 shadow"
                    >
                      Browse Files
                    </button>
                  </div>
                )}
              </div>

              {docImage && !docResult && (
                <button
                  type="button"
                  disabled={docLoading}
                  onClick={runDocumentAnalysis}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {docLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Auditing Credential with Gemini OCR...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Run AI Verification Audit</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Structured Results Card */}
            <div className="lg:col-span-7 bg-slate-50/50 border border-slate-200 rounded-2xl p-4 md:p-6 min-h-[300px] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Verification Audit Results</h4>

                {docLoading ? (
                  <div className="space-y-4 py-8 text-center">
                    <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800">Verifying credential security layers...</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Executing OCR reading & image clarity checks</p>
                    </div>
                  </div>
                ) : docResult ? (
                  <div className="space-y-4">
                    {/* Header Details */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Identified Type</p>
                        <span className="text-base font-black text-slate-950">{docResult.documentType || "Aadhaar Card"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {docResult.clarityStatus === "Clear image" ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Ready to Apply</span>
                          </span>
                        ) : (
                          <span className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            <span>Re-upload needed</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* OCR Fields */}
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Extracted OCR Metadata (Best-Effort):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-slate-150 p-4 rounded-xl">
                        <div>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Full Name</span>
                          <span className="text-xs font-bold text-slate-800">{docResult.fields?.name || "Not found"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Date of Birth</span>
                          <span className="text-xs font-bold text-slate-800">{docResult.fields?.dob || "Not found"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">ID Number</span>
                          <span className="text-xs font-mono font-bold text-slate-800">{docResult.fields?.idNumber || "Not found"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Issue Date</span>
                          <span className="text-xs font-bold text-slate-800">{docResult.fields?.issueDate || "Not found"}</span>
                        </div>
                        <div className="sm:col-span-2 border-t border-slate-100 pt-2 mt-1">
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Address</span>
                          <span className="text-xs font-bold text-slate-800">{docResult.fields?.address || "Not found"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Audit log notes */}
                    <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Clarity Audit Logs</span>
                      <p className="text-xs font-bold text-slate-700 leading-normal mt-1">{docResult.reason || "The credential has passed standard OCR reading checks."}</p>
                    </div>

                    {/* Save to Vault Action */}
                    {docResult.clarityStatus === "Clear image" && (
                      <button
                        onClick={handleSaveToVault}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Verify and Sync with Document Vault</span>
                      </button>
                    )}
                  </div>
                ) : docError ? (
                  <div className="space-y-3 py-10 text-center">
                    <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
                    <p className="text-xs font-black text-slate-800">{docError}</p>
                    <button 
                      onClick={runDocumentAnalysis}
                      className="text-xs font-black uppercase tracking-wider text-blue-600 hover:underline cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 py-12 text-center text-slate-400">
                    <FileCode className="w-10 h-10 text-slate-300 mx-auto" />
                    <div>
                      <p className="text-xs font-black">No Credential Scanned Yet</p>
                      <p className="text-[10px] mt-1 max-w-[280px] mx-auto leading-normal">Upload a clear photo of your Aadhaar card, PAN card, or Passport on the left to test optical verification.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="text-[10px] font-bold text-slate-400 border-t border-slate-200 pt-3 mt-4 text-center">
                *Disclaimer: All analyses are best-effort simulations. Real identity procedures must happen through official portals.*
              </div>
            </div>

          </div>
        )}

        {/* 3. IMAGE ANALYZER TAB */}
        {activeTab === "image" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full flex-1">
            
            {/* Upload Civic Issue photo */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-sm font-black text-slate-950 uppercase tracking-wider">Report a Public Grievance Photo</h4>
              
              <div 
                onDragOver={handleIssueDragOver}
                onDrop={handleIssueDrop}
                onClick={handleIssueUploadClick}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[220px] bg-slate-50
                  ${issueImage 
                    ? "border-emerald-400 bg-emerald-50/5" 
                    : "border-slate-300 hover:border-blue-500 hover:bg-blue-50/5"
                  }
                `}
              >
                <input 
                  type="file" 
                  ref={issueInputRef} 
                  onChange={handleIssueChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                {issueImage ? (
                  <div className="space-y-3 w-full">
                    <img 
                      src={issueImage} 
                      alt="Uploaded Civic Issue" 
                      className="max-h-36 mx-auto rounded-lg shadow-sm object-contain border border-slate-200" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-xs text-slate-500 font-bold">
                      {issueFile?.name} ({(issueFile?.size || 0) > 1024 * 1024 
                        ? `${((issueFile?.size || 0) / (1024 * 1024)).toFixed(1)} MB` 
                        : `${Math.round((issueFile?.size || 0) / 1024)} KB`})
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIssueImage(null);
                        setIssueFile(null);
                        setIssueResult(null);
                      }}
                      className="text-[10px] font-black uppercase tracking-wider text-red-600 hover:text-red-700 hover:underline px-3 py-1 bg-red-50 rounded-lg cursor-pointer mx-auto block"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 mx-auto max-w-max">
                      <ImageIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-700">Drag & drop civic grievance photo</p>
                      <p className="text-[11px] text-slate-400 mt-1">Upload photos of potholes, garbage piles, broken lights, leaking drains...</p>
                    </div>
                    <button 
                      type="button"
                      className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all hover:bg-slate-800 shadow"
                    >
                      Browse Files
                    </button>
                  </div>
                )}
              </div>

              {issueImage && !issueResult && (
                <button
                  type="button"
                  disabled={issueLoading}
                  onClick={runIssueAnalysis}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {issueLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Auditing Issue Details with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <BotMessageSquare className="w-4 h-4" />
                      <span>Audit Grievance with AI</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Structured Grievance card */}
            <div className="lg:col-span-7 bg-slate-50/50 border border-slate-200 rounded-2xl p-4 md:p-6 min-h-[300px] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Grievance Vision Audit Results</h4>

                {issueLoading ? (
                  <div className="space-y-4 py-8 text-center">
                    <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800">Analyzing civic damage levels...</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Extracting priority metrics & mapping municipal dept</p>
                    </div>
                  </div>
                ) : issueResult ? (
                  <div className="space-y-4">
                    {/* Primary Issue & Department */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                      <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Detected Issue Type</span>
                        <span className="text-sm font-black text-slate-900">{issueResult.issueType}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Responsible Department</span>
                        <span className="text-xs font-black text-blue-700 flex items-center gap-1.5 mt-0.5">
                          <Building className="w-4 h-4 shrink-0 text-blue-500" />
                          <span>{issueResult.department}</span>
                        </span>
                      </div>
                    </div>

                    {/* Priority Indicator */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Severity Priority:</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border
                        ${issueResult.priority === "High" 
                          ? "bg-red-50 text-red-700 border-red-100" 
                          : issueResult.priority === "Medium"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-blue-50 text-blue-700 border-blue-100"
                        }
                      `}>
                        {issueResult.priority} Priority
                      </span>
                    </div>

                    {/* Official statement formulation */}
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Formulated Complaint Registry Text</span>
                      <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans">{issueResult.description}</p>
                    </div>

                    {/* Complaint pre-fill action button */}
                    <button
                      onClick={handlePreFillComplaint}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-2"
                    >
                      <ClipboardList className="w-4 h-4 text-blue-400 animate-pulse" />
                      <span>Submit Grievance to Official Registry</span>
                    </button>
                  </div>
                ) : issueError ? (
                  <div className="space-y-3 py-10 text-center">
                    <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
                    <p className="text-xs font-black text-slate-800">{issueError}</p>
                    <button 
                      onClick={runIssueAnalysis}
                      className="text-xs font-black uppercase tracking-wider text-blue-600 hover:underline cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 py-12 text-center text-slate-400">
                    <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                    <div>
                      <p className="text-xs font-black">No Grievance Image Uploaded</p>
                      <p className="text-[10px] mt-1 max-w-[280px] mx-auto leading-normal">Upload a civic failure photo on the left. Gemini will identify the issue, assign the responsible department, and formulate a formal municipal statement.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="text-[10px] font-bold text-slate-400 border-t border-slate-200 pt-3 mt-4 text-center">
                *Disclaimer: Reports are mock-filed for administrative testing. Emergency services should be contacted via 112.*
              </div>
            </div>

          </div>
        )}

        {/* 4. SCHEME RECOMMENDER TAB */}
        {activeTab === "scheme" && (
          <div className="space-y-6 flex-1 flex flex-col justify-between h-full">
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3 block">What is your current occupation or situation?</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {situationOptions.map((opt) => {
                    const isSelected = selectedSituations.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => toggleSituation(opt.id)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-black transition-all text-left flex items-center justify-between border cursor-pointer shadow-sm
                          ${isSelected 
                            ? "bg-slate-900 border-slate-900 text-white" 
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                          }
                        `}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Results */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  {selectedSituations.length > 0 
                    ? `Eligible Welfare Schemes (${recommendedSchemes.length})` 
                    : "Welfare central schemes recommendations"
                  }
                </h4>

                {recommendedSchemes.length === 0 ? (
                  <div className="py-12 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 space-y-2">
                    <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                    <div>
                      <p className="text-xs font-black">Select Your Citizen Situation above</p>
                      <p className="text-[10px] mt-0.5">We will filter our offline database to recommend direct scholarship, funding, or crop assistance benefits.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {recommendedSchemes.map((scheme, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all shadow-sm">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-blue-100">Welfare central</span>
                            <span className="text-[10px] font-bold text-slate-400">Match #0{idx+1}</span>
                          </div>
                          <h5 className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">{scheme.name}</h5>
                          <p className="text-[11px] text-slate-500 font-bold leading-normal">{scheme.benefit}</p>
                        </div>

                        <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Official Portal (Example)</span>
                          <a 
                            href={scheme.applyUrl || "https://india.gov.in"} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Apply</span>
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-[10px] font-bold text-slate-400 border-t border-slate-200 pt-3 mt-4 text-center">
              *Disclaimer: central welfare schemes databases are central illustrative registries. Physical applications must occur through state portals.*
            </div>
          </div>
        )}

        {/* 5. EXPLAIN RULES / SUMMARIZER TAB */}
        {activeTab === "rules" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full flex-1">
            
            {/* Input pasted text */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-950 uppercase tracking-wider">Paste Government Notice Text</h4>
                <p className="text-[11px] text-slate-400">Paste text from a municipal PDF, circular, gazette notice, or guidelines below to convert it into plain, easy-to-read rules.</p>
              </div>

              <textarea
                rows={8}
                disabled={rulesLoading}
                placeholder="Paste the official rules, eligibility rules, guidelines, or notice terms here..."
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
              />

              <button
                type="button"
                disabled={rulesLoading || !rulesText.trim()}
                onClick={runRulesSummary}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {rulesLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing government Rules jargon...</span>
                  </>
                ) : (
                  <>
                    <ClipboardList className="w-4 h-4" />
                    <span>Summarize Government Rules</span>
                  </>
                )}
              </button>
            </div>

            {/* Structured rules card summary */}
            <div className="lg:col-span-7 bg-slate-50/50 border border-slate-200 rounded-2xl p-4 md:p-6 min-h-[300px] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Plain-Language Rules Summary</h4>

                {rulesLoading ? (
                  <div className="space-y-4 py-8 text-center">
                    <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800">Processing terms & dates...</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Converting complex legal clauses into simple checkboxes</p>
                    </div>
                  </div>
                ) : rulesResult ? (
                  <div className="space-y-4">
                    {/* Plain summary bullets */}
                    <div className="space-y-1 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Rule Essence Summary</span>
                      <div className="text-xs font-bold text-slate-700 whitespace-pre-line leading-relaxed font-sans">{rulesResult.summary}</div>
                    </div>

                    {/* Eligibility & required documents */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                      <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Extracted Eligibility</span>
                        <p className="text-xs font-bold text-slate-800 leading-normal">{rulesResult.eligibility}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Required Documents</span>
                        <p className="text-xs font-bold text-slate-800 leading-normal">{rulesResult.requiredDocuments}</p>
                      </div>
                    </div>

                    {/* Deadline date */}
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-amber-600 font-black uppercase tracking-wider block">Critical Deadline / Timelines</span>
                        <p className="text-xs font-black text-slate-800">{rulesResult.deadline}</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-amber-200">Alert</span>
                    </div>
                  </div>
                ) : rulesError ? (
                  <div className="space-y-3 py-10 text-center">
                    <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
                    <p className="text-xs font-black text-slate-800">{rulesError}</p>
                    <button 
                      onClick={runRulesSummary}
                      className="text-xs font-black uppercase tracking-wider text-blue-600 hover:underline cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 py-12 text-center text-slate-400">
                    <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                    <div>
                      <p className="text-xs font-black">No notice text parsed</p>
                      <p className="text-[10px] mt-1 max-w-[280px] mx-auto leading-normal">Paste some legal or official municipal rules on the left. Gemini will decompose paragraphs into readable checkboxes, deadlines, and documents checklists.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="text-[10px] font-bold text-slate-400 border-t border-slate-200 pt-3 mt-4 text-center">
                *Note: Summaries are generated using Generative AI. Since links cannot be inferred from pasted text alone, verify details against the official notification source.*
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
